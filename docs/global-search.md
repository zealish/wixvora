# Global Search

A command palette-style global search component that allows users to quickly navigate and search across the application.

## Features

- **Keyboard Shortcut**: `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux)
- **Smart Scoring**: Prioritizes exact matches, then "starts with", then "includes"
- **Category Grouping**: Results organized by Navigation, Actions, Page, Content, User
- **Recent Searches**: Automatically tracks last 5 selections
- **Permission Aware**: Respects user permissions
- **Mobile Support**: Touch-friendly search button
- **Zero Loading State**: Instant client-side search

## Architecture

```
Layout
  └─ GlobalSearchProvider (receives navigationGroups)
      ├─ Sidebar
      └─ Topbar
          └─ GlobalSearch (consumes context)
```

## Usage in Pages

### Basic Example

```typescript
'use client';

import { useGlobalSearch } from '@/hooks/use-global-search';
import { SearchCategory } from '@/types/search';
import { UserPlusIcon, UploadIcon } from 'lucide-react';

export default function UsersPage() {
  useGlobalSearch("users-page", [
    {
      id: 'create-user',
      title: 'Create New User',
      description: 'Add a new staff member',
      category: SearchCategory.Action,
      icon: UserPlusIcon,
      href: '/staff/users/create',
      priority: 20,
    },
    {
      id: 'import-users',
      title: 'Import Users',
      description: 'Bulk import from CSV',
      category: SearchCategory.Action,
      icon: UploadIcon,
      priority: 25,
      onSelect: () => {
        // Custom action
        openImportDialog();
      },
    },
  ]);

  return <div>...</div>;
}
```

### With Keywords

```typescript
useGlobalSearch("settings-page", [
  {
    id: 'email-config',
    title: 'Email Configuration',
    category: SearchCategory.Page,
    icon: MailIcon,
    href: '/staff/settings/email',
    keywords: ['smtp', 'mail', 'notification', 'sender'],
    priority: 30,
  },
]);
```

### Conditional Visibility

```typescript
useGlobalSearch("dashboard-page", [
  {
    id: 'export-report',
    title: 'Export Report',
    category: SearchCategory.Action,
    icon: FileDownIcon,
    href: '/staff/reports/export',
    hidden: !hasExportPermission, // Dynamically hide
    priority: 20,
  },
]);
```

## SearchItem Interface

```typescript
interface SearchItem {
  id: string;                    // Unique identifier
  title: string;                 // Display title
  description?: string;          // Optional subtitle
  href?: string;                 // Navigation URL
  category: SearchCategory;      // One of: navigation, action, page, content, user
  icon?: LucideIcon;            // Typed Lucide icon component
  keywords?: string[];          // Additional search terms
  priority?: number;            // Lower = higher priority (default: 50)
  hidden?: boolean;             // Conditionally hide item
  meta?: Record<string, unknown>; // Custom metadata
  onSelect?: () => void;        // Custom callback (alternative to href)
}
```

## Search Categories

| Category | Default Priority | Use For |
|----------|-----------------|---------|
| `SearchCategory.Navigation` | 10 | Sidebar navigation items |
| `SearchCategory.Action` | 20 | Quick actions (create, import, export) |
| `SearchCategory.Page` | 30 | Page-specific content |
| `SearchCategory.Content` | 50 | Dynamic content items |
| `SearchCategory.User` | 60 | User records (future) |

## Scoring Algorithm

Search results are scored based on match quality:

| Match Type | Score |
|------------|-------|
| Exact match | 100 |
| Starts with | 80 |
| Title includes | 60 |
| Keyword match | 40 |
| Description match | 20 |

Results are then sorted by:
1. Score (descending)
2. Priority (ascending - lower is better)
3. Title (alphabetically)

## Recent Searches

- Automatically stores last 5 selected items
- Shown when search query is empty
- Stored in `localStorage` with 30-day expiration
- Key: `wixvora:recent-searches`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open search dialog |
| `Escape` | Close dialog |
| `Arrow Up/Down` | Navigate results |
| `Enter` | Select current result |

## Advanced: Manual Registration

For dynamic content that changes frequently:

```typescript
'use client';

import { useEffect } from 'react';
import { useGlobalSearchContext } from '@/hooks/use-global-search';

export default function DynamicPage() {
  const { registerItems, unregisterItems } = useGlobalSearchContext();

  useEffect(() => {
    // Fetch dynamic data
    fetchUsers().then(users => {
      const searchItems = users.map(user => ({
        id: `user-${user.id}`,
        title: user.name,
        description: user.email,
        category: SearchCategory.User,
        icon: UserIcon,
        href: `/staff/users/${user.id}`,
      }));

      registerItems('dynamic-users', searchItems);
    });

    return () => {
      unregisterItems('dynamic-users');
    };
  }, [registerItems, unregisterItems]);

  return <div>...</div>;
}
```

## Implementation Notes

- All navigation items from sidebar are automatically searchable
- Search is entirely client-side (no API calls)
- Permission filtering happens at render time
- Icons must be typed `LucideIcon` components, not strings
- Each page should use a unique scope name for registration

## Future Enhancements

- Remote/async search for database records
- AI-powered semantic search
- Search analytics and tracking
- Command execution (beyond navigation)
- Search result previews
