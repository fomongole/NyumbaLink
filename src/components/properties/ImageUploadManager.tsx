'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Trash2, Star, Loader2, ImageIcon } from 'lucide-react';
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

export default function ImageUploadManager({ open, onClose, property }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<File[]>([]);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => mediaApi.uploadImages(property.id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Images uploaded successfully!');
      setPreviews([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 8 - property.images.length;
    if (files.length > remaining) {
      toast.error(`You can only upload ${remaining} more image(s).`);
      return;
    }
    setPreviews(files);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Images — {property.title}</DialogTitle>
        </DialogHeader>

        {/* Existing Images */}
        {property.images.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {property.images.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video">
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
                      onClick={() => primaryMutation.mutate(img.id)}
                      disabled={primaryMutation.isPending}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(img.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed rounded-lg mb-4">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-sm">No images uploaded yet</p>
          </div>
        )}

        {/* Upload Section */}
        {property.images.length < 8 && (
          <div className="space-y-3">
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
                <p className="text-sm font-medium text-gray-700">{previews.length} file(s) selected</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviews([])}
                  >
                    Clear
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => uploadMutation.mutate(previews)}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                    ) : 'Upload Images'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full py-6 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Click to select images ({8 - property.images.length} slots remaining)
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}