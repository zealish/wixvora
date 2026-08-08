"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoSettingsForm } from "./seo-settings-form";
import type { SeoSettings } from "@/features/settings/validation";

interface SettingsTabsProps {
  seoSettings: SeoSettings;
}

export function SettingsTabs({ seoSettings }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="seo" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          General settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="seo">
        <SeoSettingsForm initialData={seoSettings} />
      </TabsContent>

      <TabsContent value="email">
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Email settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="integrations">
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Integration settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="security">
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Security settings coming soon.
        </div>
      </TabsContent>
    </Tabs>
  );
}
