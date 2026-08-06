"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  GlobeIcon,
  UserCheck,
  UsersIcon,
  ShieldIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import type { NavGroup } from "@/config/navigation";

const iconMap = {
  LayoutDashboard: LayoutDashboardIcon,
  Globe: GlobeIcon,
  UserCheck: UserCheck,
  Users: UsersIcon,
  Shield: ShieldIcon,
  FileText: FileTextIcon,
  Settings: SettingsIcon,
};

interface AppSidebarProps {
  navGroups: NavGroup[];
  brandName?: string;
  brandHref: string;
}

export function AppSidebar({
  navGroups,
  brandName = "Wixvora",
  brandHref,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={brandHref} className="truncate text-lg font-bold">
            {brandName}
          </Link>
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => {
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>
                <span className="uppercase">{group.label}</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = iconMap[item.icon as keyof typeof iconMap];

                    // Exact match for the item href
                    let isActive = pathname === item.href;

                    // For child routes, check if pathname starts with href + "/"
                    // But exclude if another nav item is a better match
                    if (!isActive && pathname.startsWith(item.href + "/")) {
                      // Flatten all items from all groups to check specificity
                      const allItems = navGroups.flatMap((g) => g.items);
                      const hasMoreSpecificMatch = allItems.some(
                        (otherItem) =>
                          otherItem.href !== item.href &&
                          otherItem.href.startsWith(item.href) &&
                          (pathname === otherItem.href ||
                            pathname.startsWith(otherItem.href + "/"))
                      );
                      isActive = !hasMoreSpecificMatch;
                    }

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          tooltip={item.title}
                          className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        >
                          {Icon && <Icon />}
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
