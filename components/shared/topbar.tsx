import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';

interface TopbarProps {
  userImage: string | null | undefined;
  userInitials: string;
  profileHref: string;
}

export function Topbar({ userImage, userInitials, profileHref }: TopbarProps) {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-end gap-2 px-6">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <Avatar>
              <AvatarImage src={userImage || undefined} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={profileHref} />}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <form action="/api/auth/sign-out" method="POST">
                  <button type="submit" className="w-full text-left">
                    Sign Out
                  </button>
                </form>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
