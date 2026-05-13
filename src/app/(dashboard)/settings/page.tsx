'use client';

import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, MapPin, User } from 'lucide-react';
import AccountTab from '@/components/settings/AccountTab';
import DistrictsTab from '@/components/settings/DistrictsTab';
import UniversitiesTab from '@/components/settings/UniversitiesTab';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" description="Manage your account and system configuration" />

      <main className="flex-1 p-6">
        <Tabs defaultValue="account">
          <TabsList className="mb-6 bg-gray-100 p-1 h-10">
            <TabsTrigger value="account" className="gap-1.5 data-[state=active]:bg-white">
              <User className="h-3.5 w-3.5" />
              Account
            </TabsTrigger>
            <TabsTrigger value="districts" className="gap-1.5 data-[state=active]:bg-white">
              <MapPin className="h-3.5 w-3.5" />
              Districts
            </TabsTrigger>
            <TabsTrigger value="universities" className="gap-1.5 data-[state=active]:bg-white">
              <GraduationCap className="h-3.5 w-3.5" />
              Universities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountTab />
          </TabsContent>

          <TabsContent value="districts">
            <div className="max-w-3xl">
              <DistrictsTab />
            </div>
          </TabsContent>

          <TabsContent value="universities">
            <div className="max-w-4xl">
              <UniversitiesTab />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}