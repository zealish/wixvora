import { pgTable, timestamp, uuid, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { staffs } from './staffs';
import { roles } from './roles';
import { user } from './auth';

export const staffRoles = pgTable(
  'staff_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    staffId: uuid('staff_id')
      .notNull()
      .references(() => staffs.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
    assignedBy: uuid('assigned_by').references(() => user.id),
  },
  (table) => ({
    staffRoleUnique: unique('staff_role_unique').on(table.staffId, table.roleId),
  })
);

export const staffRolesRelations = relations(staffRoles, ({ one }) => ({
  staff: one(staffs, {
    fields: [staffRoles.staffId],
    references: [staffs.id],
  }),
  role: one(roles, {
    fields: [staffRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(user, {
    fields: [staffRoles.assignedBy],
    references: [user.id],
  }),
}));
