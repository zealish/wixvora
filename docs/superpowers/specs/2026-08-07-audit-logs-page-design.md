# Audit Logs Page Design Specification

**Date**: 2026-08-07  
**Status**: Approved  
**Author**: Claude Code

## Context

The user has already created the database schema for Audit Logs in the system. The `audit_logs` table exists with fields for tracking user actions, entities modified, metadata, IP addresses, and timestamps. However, no user interface exists to view these logs. This specification describes the implementation of a comprehensive Audit Logs viewing page within the staff dashboard that allows authorized users to browse, filter, search, and export audit trail data.

## Requirements Summary

### Mandatory Features

- Display audit logs in a paginated table
- Show: User, Action, Entity, Entity ID, Timestamp, IP Address, User Agent
- Detail view modal for full metadata
- Filters: Action type, Entity type, Date range, Free text search
- Export functionality: CSV, Excel, JSON
- Column sorting
- Server-side pagination (50 items per page default)
- Authorization using existing `PERMISSIONS.AUDIT_VIEW`

### User Experience Goals

- Fast loading even with large datasets
- Easy filtering and searching
- Clear visual distinction between action types
- Accessible audit trail for compliance and debugging
- Shareable URLs with filter states

## Architecture

### File Structure

```
features/audit/
├── types.ts                          # Existing, will extend with new types
├── service.ts                        # Existing, will extend if needed
├── queries.ts                        # NEW - Server-side data fetching
└── components/
    ├── audit-logs-table.tsx          # NEW - Main client table component
    ├── audit-log-detail-dialog.tsx   # NEW - Detail view modal
    ├── audit-logs-export-menu.tsx    # NEW - Export dropdown
    └── columns.tsx                   # NEW - TanStack Table column definitions

app/(staff)/staff/audit-logs/
└── page.tsx                          # NEW - Server component page
```

### Technology Stack

- **Table Management**: TanStack Table v8
- **UI Components**: shadcn/ui (Table, Dialog, Select, Input, Button, Calendar/DatePicker)
- **Data Fetching**: Server Components with Drizzle ORM
- **State Management**: URL searchParams for filters (server-side filtering)
- **Export**: Client-side generation (CSV/JSON) and Excel library

### Data Flow

1. User navigates to `/staff/audit-logs`
2. `page.tsx` (server component) reads URL searchParams for filters/pagination
3. `page.tsx` calls `getAuditLogs()` from `queries.ts`
4. `queries.ts` fetches from database with JOIN to user table
5. Data passed to `AuditLogsTable` client component
6. User interactions (filter, sort, page) update URL searchParams
7. URL change triggers server re-render and new query
8. Click on row opens `AuditLogDetailDialog` to show full metadata

## Database Query Design

### Query Function Signature

```typescript
// features/audit/queries.ts
export async function getAuditLogs({
  page = 1,
  pageSize = 50,
  action?: string,
  entity?: string,
  searchTerm?: string,
  startDate?: Date,
  endDate?: Date,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}): Promise<{
  data: AuditLogWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>
```

### Query Implementation

- Use Drizzle ORM query builder
- JOIN `audit_logs` with `user` table on `userId`
- Apply WHERE conditions dynamically based on filters:
  - `action` filter: exact match
  - `entity` filter: exact match
  - `searchTerm`: ILIKE search on entityId, user.name, user.email
  - Date range: `createdAt BETWEEN startDate AND endDate`
- Apply ORDER BY based on `sortBy` and `sortOrder`
- Apply LIMIT and OFFSET for pagination
- Separate COUNT query for total records (for pagination)

### Performance Considerations

- Existing indexes: `audit_logs_user_id_idx`, `audit_logs_created_at_idx`
- May need additional indexes on `action` and `entity` columns if queries are slow
- JSONB metadata search is not included in initial search (only in detail view)
- Consider adding composite index on `(action, entity, createdAt)` if filter queries are slow

## User Interface Design

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Audit Logs                                              │
│ View system activity and user actions                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Search...] [Action ▼] [Entity ▼] [Date Range] [Export]│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Timestamp      User       Action   Entity    IP    •••  │
├─────────────────────────────────────────────────────────┤
│ Aug 7, 11:17PM John Doe   created  User      192…  [i]  │
│                john@...    🟢                            │
│ Aug 7, 11:15PM Jane Smith updated  Role      192…  [i]  │
│                jane@...    🔵                            │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘

Showing 1-50 of 1,234 results    [< Previous]  [Next >]
```

### Table Columns

1. **Timestamp**
   - Format: "Aug 7, 2026 11:17 PM"
   - Tooltip: Relative time ("2 hours ago")
   - Sortable: Yes
   - Width: ~150px

2. **User**
   - Primary: User name or "System"
   - Secondary: Email (smaller, muted text)
   - Sortable: Yes (by name)
   - Width: ~200px

3. **Action**
   - Display: Badge/pill with color coding
     - created → green badge
     - updated → blue badge
     - deleted → red badge
     - login → purple badge
     - logout → gray badge
   - Sortable: Yes
   - Width: ~120px

4. **Entity**
   - Format: "Entity Type #EntityID"
   - Example: "User #abc123", "Category #xyz"
   - Truncate EntityID if too long
   - Sortable: Yes (by entity type)
   - Width: ~180px

5. **IP Address**
   - Display: Full IP or truncated with tooltip
   - Width: ~130px

6. **User Agent**
   - Display: Browser/device summary
   - Example: "Chrome 126 on Mac"
   - Truncate with tooltip for full agent string
   - Width: ~150px

7. **Actions**
   - Icon button: "View Details" (Info icon)
   - Opens detail dialog
   - Width: ~60px

### Filter Controls

**Search Input**:

- Placeholder: "Search by entity ID, user name, or email..."
- Debounced input (300ms)
- Searches: entityId, user.name, user.email

**Action Filter**:

- Dropdown select with options from distinct actions in database
- Default: "All Actions"
- Options dynamically loaded from database

**Entity Filter**:

- Dropdown select with options from distinct entities in database
- Default: "All Entities"
- Options dynamically loaded from database

**Date Range Picker**:

- Two date inputs: Start Date and End Date
- Uses shadcn/ui Calendar component
- Clear button to reset date range

**Export Button**:

- Dropdown menu with options: CSV, Excel, JSON
- Respects current filters (exports filtered data)

### Detail Dialog

When user clicks a row or "View Details" button:

```
┌─────────────────────────────────────────────┐
│ Audit Log Details                      [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ Timestamp:    Aug 7, 2026 11:17:43 PM      │
│               (2 hours ago)                 │
│                                             │
│ User:         John Doe                      │
│               john@example.com              │
│               ID: abc-123-def               │
│                                             │
│ Action:       created 🟢                    │
│                                             │
│ Entity:       User                          │
│ Entity ID:    xyz-789-abc                   │
│                                             │
│ IP Address:   192.168.1.100                 │
│                                             │
│ User Agent:   Mozilla/5.0 (Macintosh;      │
│               Intel Mac OS X 10_15_7)...    │
│                                             │
│ Metadata:                                   │
│ ┌─────────────────────────────────────┐    │
│ │ {                                   │    │
│ │   "previousEmail": "old@email.com", │    │
│ │   "newEmail": "new@email.com",      │    │
│ │   "changedBy": "admin"              │    │
│ │ }                                   │    │
│ └─────────────────────────────────────┘    │
│                                             │
│                          [Close]            │
└─────────────────────────────────────────────┘
```

**Dialog Content**:

- All fields displayed in full (no truncation)
- Metadata displayed as formatted JSON (indented, syntax highlighted if possible)
- Scrollable if content is long
- Close button and click outside to dismiss

### Empty States

**No logs exist**:

```
┌─────────────────────────────────────────────┐
│                                             │
│              📄                             │
│         No audit logs found                 │
│                                             │
└─────────────────────────────────────────────┘
```

**No results after filtering**:

```
┌─────────────────────────────────────────────┐
│                                             │
│              🔍                             │
│      No logs match your filters             │
│      Try adjusting your search criteria     │
│                                             │
└─────────────────────────────────────────────┘
```

### Loading States

- Show skeleton rows while data is loading
- Disable filter controls during loading
- Show loading indicator on export button during export

## Export Functionality

### Export Menu Component

Dropdown button with three options:

1. **Export as CSV**
2. **Export as Excel**
3. **Export as JSON**

### Export Behavior

- Exports **filtered data only** (respects current filters)
- Exports all pages of filtered results, not just current page
- Download triggered client-side
- Filename format: `audit-logs-YYYY-MM-DD.{csv|xlsx|json}`

### Export Formats

**CSV Format**:

```csv
Timestamp,User Name,User Email,Action,Entity,Entity ID,IP Address,User Agent,Metadata
"2026-08-07 23:17:43","John Doe","john@example.com","created","User","xyz-789",192.168.1.100,"Mozilla/5.0...","{"key":"value"}"
```

**Excel Format**:

- Same columns as CSV
- Formatted with headers in bold
- Auto-sized columns
- Freeze first row

**JSON Format**:

```json
[
  {
    "id": "log-id-123",
    "timestamp": "2026-08-07T23:17:43Z",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "action": "created",
    "entity": "User",
    "entityId": "xyz-789",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "metadata": {
      "key": "value"
    }
  }
]
```

## Authorization & Navigation

### Authorization

- **Permission Required**: `PERMISSIONS.AUDIT_VIEW` (value: `"audit.view"`)
- **Implementation**: Use `authorize(PERMISSIONS.AUDIT_VIEW)` in server component
- **Unauthorized Behavior**: Redirect to `/staff/access-denied`
- **Authorization Check**: Happens before data fetching in page.tsx

### Navigation Integration

**Add to Staff Navigation**:

- Location: `app/(staff)/staff/layout.tsx`
- Menu item: "Audit Logs"
- Icon: `FileText` or `ScrollText` from lucide-react
- Position: Under Settings or in separate Admin/Monitoring section
- Active state: Highlighted when on `/staff/audit-logs`

### Routing

**Main Route**: `/staff/audit-logs`

**URL Structure with Filters**:

```
/staff/audit-logs?page=2&action=created&entity=user&search=john&startDate=2026-08-01&endDate=2026-08-07&sortBy=createdAt&sortOrder=desc
```

**searchParams**:

- `page`: number (default: 1)
- `pageSize`: number (default: 50)
- `action`: string (optional)
- `entity`: string (optional)
- `search`: string (optional)
- `startDate`: ISO date string (optional)
- `endDate`: ISO date string (optional)
- `sortBy`: string (default: "createdAt")
- `sortOrder`: "asc" | "desc" (default: "desc")

## Type Definitions

### Extended Types (features/audit/types.ts)

```typescript
export interface AuditLogWithUser {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogsResult {
  data: AuditLogWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogsFilters {
  page?: number;
  pageSize?: number;
  action?: string;
  entity?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "createdAt" | "action" | "entity";
  sortOrder?: "asc" | "desc";
}
```

## Implementation Checklist

### Phase 1: Data Layer

- [ ] Extend `features/audit/types.ts` with new types
- [ ] Create `features/audit/queries.ts` with `getAuditLogs()` function
- [ ] Create helper functions: `getDistinctActions()`, `getDistinctEntities()`
- [ ] Test query performance with sample data

### Phase 2: Components

- [ ] Create `features/audit/components/columns.tsx` with column definitions
- [ ] Create `features/audit/components/audit-log-detail-dialog.tsx`
- [ ] Create `features/audit/components/audit-logs-export-menu.tsx`
- [ ] Create `features/audit/components/audit-logs-table.tsx` (main table component)

### Phase 3: Page

- [ ] Create `app/(staff)/staff/audit-logs/page.tsx`
- [ ] Implement authorization check
- [ ] Implement searchParams parsing
- [ ] Wire up data fetching and component rendering

### Phase 4: Navigation

- [ ] Update `app/(staff)/staff/layout.tsx` to add Audit Logs menu item
- [ ] Test navigation and active states

### Phase 5: Testing & Polish

- [ ] Test with various filter combinations
- [ ] Test pagination with large datasets
- [ ] Test export functionality for all formats
- [ ] Test authorization (with and without permission)
- [ ] Test empty and loading states
- [ ] Verify responsive layout
- [ ] Check accessibility (keyboard navigation, screen readers)

## Edge Cases & Considerations

1. **Null userId**: Display "System" when userId is null (system-generated logs)
2. **Long metadata**: Handle very large metadata objects (truncate in table, show full in dialog)
3. **Special characters in entityId**: Ensure proper escaping in search
4. **Date range validation**: End date must be after start date
5. **Large exports**: Consider limiting export to a maximum number of rows (e.g., 10,000)
6. **Time zones**: Display timestamps in user's local timezone
7. **Performance**: Monitor query performance and add indexes if needed
8. **JSONB search**: If metadata search is needed later, consider PostgreSQL JSONB operators

## Future Enhancements (Out of Scope)

- Real-time updates using WebSockets or polling
- Advanced metadata filtering (search within JSON)
- Audit log retention policies and archiving
- Audit log diff view (comparing before/after states)
- Audit log aggregation and analytics dashboard
- Export with custom column selection
- Scheduled audit reports via email

## Success Criteria

- [ ] Authorized staff can view audit logs at `/staff/audit-logs`
- [ ] All required columns are displayed correctly
- [ ] Filters work and update URL searchParams
- [ ] Pagination works for large datasets
- [ ] Detail dialog shows full metadata in readable format
- [ ] Export produces valid CSV, Excel, and JSON files
- [ ] Unauthorized users are redirected to access-denied page
- [ ] Page loads in under 2 seconds with typical dataset
- [ ] No console errors or warnings
- [ ] Responsive layout works on desktop and tablet
