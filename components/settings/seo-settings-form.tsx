"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "./toggle-switch";
import { SettingCard } from "./setting-card";
import { updateSeoSettingsAction } from "@/features/settings/actions";
import type { SeoSettings } from "@/features/settings/validation";

interface SeoSettingsFormProps {
  initialData: SeoSettings;
}

export function SeoSettingsForm({ initialData }: SeoSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gaEnabled, setGaEnabled] = useState(
    initialData.googleAnalytics.enabled
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: SeoSettings = {
      googleAnalytics: {
        enabled: formData.get("ga_enabled") === "on",
        measurementId: (formData.get("measurement_id") as string) || null,
      },
      searchConsole: {
        siteUrl: (formData.get("site_url") as string) || null,
        verificationToken:
          (formData.get("verification_token") as string) || null,
      },
    };

    startTransition(async () => {
      const result = await updateSeoSettingsAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-700">
          SEO settings updated successfully.
        </div>
      )}

      <SettingCard
        title="Google Analytics"
        description="Track visitor behavior with Google Analytics 4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ga_enabled">Enable Google Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Inject GA tracking script on all pages
            </p>
          </div>
          <ToggleSwitch
            id="ga_enabled"
            name="ga_enabled"
            defaultChecked={initialData.googleAnalytics.enabled}
            onChange={(checked) => setGaEnabled(checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement_id">Measurement ID</Label>
          <Input
            id="measurement_id"
            name="measurement_id"
            placeholder="G-XXXXXXXXXX"
            defaultValue={initialData.googleAnalytics.measurementId ?? ""}
            disabled={!gaEnabled}
          />
          <p className="text-sm text-muted-foreground">
            Format: G-XXXXXXXXXX (10 alphanumeric characters)
          </p>
        </div>
      </SettingCard>

      <SettingCard
        title="Google Search Console"
        description="Verify site ownership for Google Search Console"
      >
        <div className="space-y-2">
          <Label htmlFor="site_url">Site URL</Label>
          <Input
            id="site_url"
            name="site_url"
            type="url"
            placeholder="https://example.com"
            defaultValue={initialData.searchConsole.siteUrl ?? ""}
          />
          <p className="text-sm text-muted-foreground">
            The URL of your property in Search Console
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification_token">Verification Token</Label>
          <Textarea
            id="verification_token"
            name="verification_token"
            placeholder="Paste the content value from the meta tag"
            defaultValue={initialData.searchConsole.verificationToken ?? ""}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Copy the content attribute value from the verification meta tag
          </p>
        </div>
      </SettingCard>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save SEO Settings"}
      </Button>
    </form>
  );
}
