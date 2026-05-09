'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Trash2, Star, Loader2, ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mediaApi } from '@/lib/api/media.api';
import { Property } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  property: Property;
}

interface FilePreview {
  file: File;
  objectUrl: string;
}

export default function ImageUploadManager({ open, onClose, property }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    return () => { previews.forEach((p) => URL.revokeObjectURL(p.objectUrl)); };
  }, [previews]);

  useEffect(() => {
    if (!open) {
      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      setPreviews([]);
    }
  }, [open]);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => mediaApi.uploadImages(property.id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Images uploaded successfully!');
      previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => toast.error('Failed to upload images.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => mediaApi.deleteImage(property.id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Image deleted.');
    },
    onError: () => toast.error('Failed to delete image.'),
  });

  const primaryMutation = useMutation({
    mutationFn: (imageId: string) => mediaApi.setPrimary(property.id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Primary image updated!');
    },
    onError: () => toast.error('Failed to set primary image.'),
  });

  // Shared validation + preview logic — used by both click-select and drag-and-drop
  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files only.');
      return;
    }
    const remaining = 8 - property.images.length;
    if (imageFiles.length > remaining) {
      toast.error(`You can only upload ${remaining} more image${remaining !== 1 ? 's' : ''}.`);
      return;
    }
    previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setPreviews(imageFiles.map((file) => ({ file, objectUrl: URL.createObjectURL(file) })));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index].objectUrl);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (previews.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearPreviews = () => {
    previews.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const slotsRemaining = 8 - property.images.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Images — {property.title}</DialogTitle>
        </DialogHeader>

        {/* ── Uploaded Images ── */}
        {property.images.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Uploaded ({property.images.length}/8)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {property.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg overflow-hidden border aspect-video bg-gray-100"
                >
                  <Image src={img.url} alt="Property" fill className="object-cover" />
                  {img.isPrimary && (
                    <div className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" /> Primary
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        title="Set as primary"
                        onClick={() => primaryMutation.mutate(img.id)}
                        disabled={primaryMutation.isPending}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      title="Delete image"
                      onClick={() => deleteMutation.mutate(img.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-sm">No images uploaded yet</p>
          </div>
        )}

        {/* ── Upload Section ── */}
        {slotsRemaining > 0 && (
          <div className="space-y-3 mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {previews.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Selected for upload ({previews.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div
                      key={preview.objectUrl}
                      className="relative group rounded-lg overflow-hidden border aspect-video bg-gray-100"
                    >
                      <Image
                        src={preview.objectUrl}
                        alt={preview.file.name}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(index)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1">
                        <p className="text-white text-xs truncate">{preview.file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearPreviews}
                    disabled={uploadMutation.isPending}
                  >
                    Clear all
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => uploadMutation.mutate(previews.map((p) => p.file))}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                    ) : (
                      `Upload ${previews.length} image${previews.length !== 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Drag-and-drop zone ── */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full rounded-xl border-2 border-dashed cursor-pointer
                  transition-colors duration-150 select-none
                  flex flex-col items-center justify-center gap-2 py-10
                  ${isDragOver
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-400'
                  }
                `}
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                  isDragOver ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-5 w-5 transition-colors ${isDragOver ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
                  </p>
                  <p className="text-xs mt-0.5 text-gray-400">
                    or click to browse · {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {slotsRemaining === 0 && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Maximum of 8 images reached. Delete one to upload more.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}