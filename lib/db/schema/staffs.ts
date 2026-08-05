import { pgTable, text, timestamp, uuid, index, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const staffs = pgTable(
  'staffs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    employeeCode: text('employee_code').unique(),
    department: text('department'),
    position: text('position'),
    hireDate: date('hire_date'),
    employmentStatus: text('employment_status', {
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    })
      .notNull()
      .default('ACTIVE'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    userIdIdx: index('staffs_user_id_idx').on(table.userId),
  })
);

export const staffsRelations = relations(staffs, ({ one }) => ({
  user: one(user, {
    fields: [staffs.userId],
    references: [user.id],
  }),
}));
