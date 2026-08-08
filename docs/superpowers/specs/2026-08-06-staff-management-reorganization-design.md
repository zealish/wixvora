# Staff Management Reorganization Design

**Date:** 2026-08-06  
**Status:** Approved  
**Author:** AI Assistant

---

## Overview

Reorganize the staff management interface to separate staff users and client users into distinct pages under the Management navigation group. Both pages will share the same underlying component architecture but render different data and configurations.

---

## Goals

1. Create separate management interfaces for staff users and client users
2. Move existing `/staff/users` functionality to `/staff/staffs`
3. Implement full CRUD operations for client users
4. Maintain code reusability through component abstraction
5. Preserve existing permissions and audit logging

---

## Current State

### Routes

- `/staff/users` - Staff users list
- `/staff/users/create` - Create staff user

### Data Layer

- `getAllStaffUsers()` - Fetches users with `accountType = "STAFF"`
- No client user query function exists
- Client schema exists in database but no UI implementation

### Navigation

```typescript
{
  label: "Management",
  items: [
    { title: "Users", href: "/staff/users", ... },
    { title: "Roles", href: "/staff/roles", ... },
    { title: "Audit Logs", href: "/staff/audit", ... }
  ]
}
```

---

## Proposed Design

### 1. Route Structure

**New Routes:**

```
/staff/staffs              → Staff users list page
/staff/staffs/create       → Create new staff user
/staff/staffs/[id]         → Edit staff user (future)
/staff/clients             → Client users list page
/staff/clients/create      → Create new client user
/staff/clients/[id]        → Edit client user (future)
```

**Migration:**

- Rename `/staff/users` → `/staff/staffs`
- Add redirect from old URLs to new ones (301 permanent redirect)
- Update all internal links and navigation

**Updated Navigation:**

```typescript
{
  label: "Management",
  items: [
    {
      title: "Staffs",
      href: "/staff/staffs",
      icon: "Users",
      permission: PERMISSIONS.USERS_VIEW
    },
    {
      title: "Clients",
      href: "/staff/clients",
      icon: "UserCheck",
      permission: PERMISSIONS.CLIENTS_VIEW
    },
    {
      title: "Roles",
      href: "/staff/roles",
      icon: "Shield",
      permission: PERMISSIONS.ROLES_VIEW
    },
    {
      title: "Audit Logs",
      href: "/staff/audit",
      icon: "ScrollText",
      permission: PERMISSIONS.AUDIT_VIEW
    }
  ]
}
```

---

### 2. Data Layer

**Extended Type** (`features/users/types.ts`):

```typescript
interface UserWithProfile {
  id: string;
  name: string;
  email: string;
  accountType: "CLIENT" | "STAFF";
  createdAt: Date;

  // Staff-specific (nullable)
  staff?: {
    id: string;
    department: string | null;
    position: string | null;
    employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
  } | null;

  // Client-specific (nullable)
  client?: {
    id: string;
    displayName: string | null;
    companyName: string | null;
    phone: string | null;
    status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  } | null;
}
```

**Query Functions** (`features/users/queries.ts`):

```typescript
// Existing - rename for clarity
export async function getAllStaffUsers(): Promise<UserWithProfile[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      createdAt: user.createdAt,
      staff: {
        id: staffs.id,
        department: staffs.department,
        position: staffs.position,
        employmentStatus: staffs.employmentStatus,
      },
    })
    .from(user)
    .leftJoin(staffs, eq(user.id, staffs.userId))
    .where(eq(user.accountType, "STAFF"));
}

// New - for clients
export async function getAllClientUsers(): Promise<UserWithProfile[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      createdAt: user.createdAt,
      client: {
        id: clients.id,
        displayName: clients.displayName,
        companyName: clients.companyName,
        phone: clients.phone,
        status: clients.status,
      },
    })
    .from(user)
    .leftJoin(clients, eq(user.id, clients.userId))
    .where(eq(user.accountType, "CLIENT"));
}
```

**Server Actions:**

Existing staff actions in `features/users/actions.ts`:

- `createStaffUser()`
- `updateStaffUser()`
- `deleteStaffUser()`

New client actions in `features/clients/actions.ts`:

- `createClientUser()` - Create user + client profile, log audit
- `updateClientUser()` - Update client profile, log audit
- `deleteClientUser()` - Soft delete, log audit
- All follow existing patterns with permission checks and revalidation

---

### 3. Table Configuration

**Staff Columns** (`features/users/table/staff-columns.tsx`):

- Name (with avatar, sortable)
- Email (sortable)
- Department (sortable, filterable)
- Position (filterable)
- Employment Status (badge: Active/Inactive/Terminated, filterable)
- Created Date (sortable)
- Actions (dropdown: view, edit, delete)

**Client Columns** (`features/clients/table/client-columns.tsx`):

- Name (with avatar, sortable)
- Email (sortable)
- Company Name (sortable, filterable)
- Phone
- Status (badge: Active/Suspended/Inactive, filterable)
- Created Date (sortable)
- Actions (dropdown: view, edit, delete)

**Staff Filters** (`features/users/table/staff-filters.ts`):

```typescript
export const staffFilters = [
  {
    id: "search",
    type: "search",
    placeholder: "Search by name or email...",
    fields: ["name", "email"],
  },
  {
    id: "department",
    type: "select",
    label: "Department",
    options: [], // Populated dynamically from data
  },
  {
    id: "employmentStatus",
    type: "select",
    label: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Terminated", value: "TERMINATED" },
    ],
  },
  {
    id: "createdAt",
    type: "dateRange",
    label: "Created Date",
  },
];
```

**Client Filters** (`features/clients/table/client-filters.ts`):

```typescript
export const clientFilters = [
  {
    id: "search",
    type: "search",
    placeholder: "Search by name, email, or company...",
    fields: ["name", "email", "companyName"],
  },
  {
    id: "status",
    type: "select",
    label: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Suspended", value: "SUSPENDED" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    id: "createdAt",
    type: "dateRange",
    label: "Created Date",
  },
];
```

Both configurations support:

- Column sorting
- Column visibility toggles
- Export to CSV/Excel
- Bulk actions (if permissions allow)
- Row selection

---

### 4. Component Architecture

**Generic User Management Page** (`features/user-management/components/user-management-page.tsx`):

```typescript
interface UserManagementPageProps {
  userType: "STAFF" | "CLIENT";
}

export async function UserManagementPage({ userType }: UserManagementPageProps) {
  // Permission check
  const permission = userType === "STAFF"
    ? PERMISSIONS.USERS_VIEW
    : PERMISSIONS.CLIENTS_VIEW;
  await authorize(permission);

  // Fetch data
  const users = userType === "STAFF"
    ? await getAllStaffUsers()
    : await getAllClientUsers();

  // Select configuration
  const config = userType === "STAFF" ? {
    title: "Staff Users",
    description: "Manage staff user accounts and permissions",
    columns: staffColumns,
    filters: staffFilters,
    createHref: "/staff/staffs/create",
    tableId: "staff-users",
  } : {
    title: "Client Users",
    description: "Manage client user accounts and access",
    columns: clientColumns,
    filters: clientFilters,
    createHref: "/staff/clients/create",
    tableId: "client-users",
  };

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        action={{
          label: `Create ${userType === "STAFF" ? "Staff" : "Client"}`,
          href: config.createHref,
        }}
      />
      <DataTable
        id={config.tableId}
        data={users}
        columns={config.columns}
        filters={config.filters}
      />
    </>
  );
}
```

**Route Page Wrappers:**

```typescript
// app/(staff)/staff/staffs/page.tsx
import { UserManagementPage } from "@/features/user-management";

export default function StaffsPage() {
  return <UserManagementPage userType="STAFF" />;
}

// app/(staff)/staff/clients/page.tsx
import { UserManagementPage } from "@/features/user-management";

export default function ClientsPage() {
  return <UserManagementPage userType="CLIENT" />;
}
```

**Generic User Form** (`features/user-management/components/user-form.tsx`):

```typescript
interface UserFormProps {
  userType: "STAFF" | "CLIENT";
  initialData?: UserWithProfile;
  mode: "create" | "edit";
}

export function UserForm({ userType, initialData, mode }: UserFormProps) {
  // Conditional field rendering based on userType
  // Staff: name, email, department, position, employmentStatus
  // Client: name, email, companyName, phone, status
  // Form submission calls appropriate server action
  // createStaffUser/createClientUser or updateStaffUser/updateClientUser
}
```

---

### 5. File Organization

**New Directory Structure:**

```
features/user-management/
├── components/
│   ├── user-management-page.tsx      (generic page component)
│   ├── user-form.tsx                 (generic form component)
│   └── index.ts                      (exports)
├── hooks/
│   └── use-user-form.ts              (shared form logic)
└── utils.ts                          (helper functions)

features/users/table/
├── staff-columns.tsx                 (staff-specific columns)
└── staff-filters.ts                  (staff-specific filters)

features/clients/
├── actions.ts                        (server actions - expand existing)
├── queries.ts                        (queries - expand existing)
├── types.ts                          (types - existing)
├── validation.ts                     (validation - expand existing)
└── table/
    ├── client-columns.tsx            (client-specific columns)
    └── client-filters.ts             (client-specific filters)

app/(staff)/staff/
├── staffs/
│   ├── page.tsx                      (list page)
│   ├── create/
│   │   └── page.tsx                  (create form)
│   └── [id]/
│       └── page.tsx                  (edit form - future)
├── clients/
│   ├── page.tsx                      (list page)
│   ├── create/
│   │   └── page.tsx                  (create form)
│   └── [id]/
│       └── page.tsx                  (edit form - future)
└── users/                            (DELETE after migration)
```

---

### 6. Authorization & Permissions

**Permission Mapping:**

| Page                    | Required Permission          | Fallback               |
| ----------------------- | ---------------------------- | ---------------------- |
| `/staff/staffs`         | `PERMISSIONS.USERS_VIEW`     | `/staff/access-denied` |
| `/staff/staffs/create`  | `PERMISSIONS.USERS_CREATE`   | `/staff/access-denied` |
| `/staff/clients`        | `PERMISSIONS.CLIENTS_VIEW`   | `/staff/access-denied` |
| `/staff/clients/create` | `PERMISSIONS.CLIENTS_CREATE` | `/staff/access-denied` |

**Authorization Flow:**

1. Page component calls `authorize(permission)` at render time
2. `authorize()` checks current user's role permissions
3. If denied, throws error → caught by error boundary → redirects to access denied
4. Navigation items are filtered based on permissions (existing behavior)

**Row-Level Actions:**

- Edit button: Requires `USERS_UPDATE` or `CLIENTS_UPDATE`
- Delete button: Requires `USERS_DELETE` or `CLIENTS_DELETE`
- Actions disabled/hidden if user lacks permission

---

### 7. Error Handling

**Query Failures:**

- Wrap data fetching in try/catch
- Display error toast with user-friendly message
- Fallback to empty table state with retry button
- Log error details for debugging

**Form Validation:**

- Client-side validation using react-hook-form + Zod schemas
- Display inline field errors below inputs
- Prevent submission until valid
- Server-side validation as final check

**Server Action Errors:**

- Return `{ success: false, error: string }` format
- Display error toast notification
- Keep form data populated for correction
- Common errors:
  - Email already exists
  - Database constraint violations
  - Permission denied
  - Network timeout

**Not Found (404):**

- User/client ID doesn't exist
- Redirect to list page with error toast
- Log the attempt for audit

**Database Errors:**

- Constraint violations → User-friendly message ("Email already in use")
- Connection errors → Retry with exponential backoff
- Transaction failures → Rollback, display error

---

### 8. Audit Logging

**Logged Actions:**

- `USER_CREATED` - Staff or client user created
- `USER_UPDATED` - Staff or client user updated
- `USER_DELETED` - Staff or client user deleted

**Audit Log Entry:**

```typescript
{
  action: "USER_CREATED",
  userId: "current-user-id",
  targetUserId: "new-user-id",
  accountType: "CLIENT" | "STAFF",
  metadata: {
    email: "user@example.com",
    name: "User Name",
  },
  timestamp: Date,
}
```

**Implementation:**

- Use existing audit logging system from `features/users/actions.ts`
- Log after successful database operation
- Include actor, action, target, and context
- Viewable in `/staff/audit` (existing page)

---

### 9. Migration Plan

**Phase 1: Create New Structure (Parallel)**

1. Create `features/user-management/` directory and components
2. Create `features/clients/table/` with columns and filters
3. Add `getAllClientUsers()` query function
4. Add client CRUD server actions
5. Create `/staff/staffs/` route pages
6. Create `/staff/clients/` route pages
7. Update navigation config

**Phase 2: Testing**

1. Run unit tests for new queries and actions
2. Test staffs page functionality
3. Test clients page functionality
4. Verify permissions work correctly
5. Verify audit logging captures events

**Phase 3: Redirects & Cleanup**

1. Add redirect from `/staff/users` → `/staff/staffs`
2. Add redirect from `/staff/users/create` → `/staff/staffs/create`
3. Update any hardcoded links in codebase
4. Delete old `/staff/users/` directory

**Phase 4: Deployment**

1. Deploy to staging environment
2. Run E2E tests
3. Manual QA testing
4. Deploy to production
5. Monitor for errors

**Rollback Plan:**

- If issues found, revert navigation config to show old "Users" link
- Old `/staff/users` code remains until confident in new implementation
- Can toggle between old/new via feature flag if needed

---

## Alternative Approaches Considered

### Approach B: Feature Separation

- Separate implementations for staffs and clients
- **Rejected:** More code duplication, harder to maintain consistency

### Approach C: Hybrid - Shared Table, Separate Pages

- Generic DataTable but duplicate page components
- **Rejected:** Medium duplication, doesn't fully leverage abstraction

**Selected Approach A:** Component abstraction with userType prop provides the best balance of code reuse, maintainability, and flexibility.

---

## Dependencies

**Existing Systems:**

- DataTable component (`components/shared/data-table/`)
- Authorization system (`lib/auth/authorize`)
- Audit logging system
- Drizzle ORM with PostgreSQL

**No New External Dependencies Required**

---

## Success Criteria

- [ ] Staffs page accessible at `/staff/staffs` with correct data
- [ ] Clients page accessible at `/staff/clients` with correct data
- [ ] Both pages support full CRUD operations
- [ ] Navigation shows separate menu items for Staffs and Clients
- [ ] Old URLs redirect to new URLs
- [ ] Permissions enforced correctly on all pages
- [ ] Audit logs capture all user management actions
- [ ] No code duplication between staff and client implementations
- [ ] All existing tests pass
- [ ] New functionality has test coverage

---

## Future Enhancements

- Bulk import users from CSV
- Advanced filtering (saved filters, complex queries)
- User profile page with activity history
- Email notifications for account changes
- Two-factor authentication management
- Account suspension workflow with reasons
