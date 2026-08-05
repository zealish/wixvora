'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateClientProfile } from '@/features/clients/actions';
import type { ClientProfile } from '@/features/clients/types';

interface ProfileFormProps {
  profile: ClientProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      displayName: formData.get('displayName') as string,
      companyName: formData.get('companyName') as string,
      phone: formData.get('phone') as string,
      timezone: formData.get('timezone') as string,
      locale: formData.get('locale') as string,
    };

    startTransition(async () => {
      const result = await updateClientProfile(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess('Profile updated successfully');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile.displayName || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={profile.companyName || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              name="timezone"
              defaultValue={profile.timezone || ''}
              placeholder="e.g., America/New_York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Input
              id="locale"
              name="locale"
              defaultValue={profile.locale || ''}
              placeholder="e.g., en-US"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
