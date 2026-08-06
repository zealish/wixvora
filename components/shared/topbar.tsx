"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GlobalSearch } from "@/components/shared/global-search";

interface TopbarProps {
  userImage: string | null | undefined;
  userInitials: string;
  profileHref: string;
}

export function Topbar({ userImage, userInitials, profileHref }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <SearchIcon className="size-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
          </kbd>
        </button>
        
        <div className="flex items-center gap-2">
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
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
