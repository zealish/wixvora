import "dotenv/config";
import { db } from "@/lib/db";
import { permissions, roles, rolePermissions } from "@/lib/db/schema";

const seedPermissions = [
  {
    key: "users.view.any",
    resource: "users",
    action: "view",
    scope: "any",
    description: "View all users",
  },
  {
    key: "users.create.any",
    resource: "users",
    action: "create",
    scope: "any",
    description: "Create users",
  },
  {
    key: "users.update.any",
    resource: "users",
    action: "update",
    scope: "any",
    description: "Update any user",
  },
  {
    key: "users.delete.any",
    resource: "users",
    action: "delete",
    scope: "any",
    description: "Delete any user",
  },
  {
    key: "roles.view",
    resource: "roles",
    action: "view",
    scope: null,
    description: "View roles",
  },
  {
    key: "roles.manage",
    resource: "roles",
    action: "manage",
    scope: null,
    description: "Manage roles",
  },
  {
    key: "clients.view.any",
    resource: "clients",
    action: "view",
    scope: "any",
    description: "View all clients",
  },
  {
    key: "clients.create.any",
    resource: "clients",
    action: "create",
    scope: "any",
    description: "Create clients",
  },
  {
    key: "clients.update.any",
    resource: "clients",
    action: "update",
    scope: "any",
    description: "Update any client",
  },
  {
    key: "clients.delete.any",
    resource: "clients",
    action: "delete",
    scope: "any",
    description: "Delete any client",
  },
  {
    key: "billing.view",
    resource: "billing",
    action: "view",
    scope: null,
    description: "View billing information",
  },
  {
    key: "billing.refund",
    resource: "billing",
    action: "refund",
    scope: null,
    description: "Process refunds",
  },
  {
    key: "dashboard.view",
    resource: "dashboard",
    action: "view",
    scope: null,
    description: "View dashboard",
  },
  {
    key: "settings.update",
    resource: "settings",
    action: "update",
    scope: null,
    description: "Update settings",
  },
  {
    key: "analytics.view",
    resource: "analytics",
    action: "view",
    scope: null,
    description: "View analytics",
  },
  {
    key: "audit.view",
    resource: "audit",
    action: "view",
    scope: null,
    description: "View audit logs",
  },
  {
    key: "templates.view",
    resource: "templates",
    action: "view",
    scope: null,
    description: "View templates",
  },
  {
    key: "templates.create",
    resource: "templates",
    action: "create",
    scope: null,
    description: "Create templates",
  },
  {
    key: "templates.publish",
    resource: "templates",
    action: "publish",
    scope: null,
    description: "Publish templates",
  },
  {
    key: "sites.manage",
    resource: "sites",
    action: "manage",
    scope: null,
    description: "Manage sites",
  },
];

const seedRoles = [
  {
    code: "SUPER_ADMIN",
    name: "Super Administrator",
    description: "Full system access with all permissions",
  },
  {
    code: "ADMIN",
    name: "Administrator",
    description: "Manage users, clients, and roles",
  },
  { code: "SUPPORT", name: "Support", description: "View and assist clients" },
  {
    code: "FINANCE",
    name: "Finance",
    description: "Manage billing and refunds",
  },
  {
    code: "CONTENT",
    name: "Content Manager",
    description: "Manage templates and content",
  },
  {
    code: "MARKETING",
    name: "Marketing",
    description: "View analytics and client data",
  },
  {
    code: "DEVELOPER",
    name: "Developer",
    description: "Technical access to templates and settings",
  },
];

const rolePermissionMappings: Record<string, string[]> = {
  ADMIN: [
    "users.view.any",
    "users.create.any",
    "users.update.any",
    "clients.view.any",
    "clients.update.any",
    "roles.view",
    "dashboard.view",
    "audit.view",
  ],
  SUPPORT: [
    "users.view.any",
    "clients.view.any",
    "clients.update.any",
    "dashboard.view",
  ],
  FINANCE: [
    "billing.view",
    "billing.refund",
    "clients.view.any",
    "dashboard.view",
  ],
  CONTENT: [
    "templates.view",
    "templates.create",
    "templates.publish",
    "dashboard.view",
  ],
  MARKETING: ["analytics.view", "clients.view.any", "dashboard.view"],
  DEVELOPER: [
    "users.view.any",
    "templates.view",
    "dashboard.view",
    "settings.update",
  ],
};

async function seed() {
  console.log("🌱 Seeding database...");

  console.log("📝 Inserting permissions...");
  await db.insert(permissions).values(seedPermissions).onConflictDoNothing();

  console.log("👥 Inserting roles...");
  await db.insert(roles).values(seedRoles).onConflictDoNothing();

  console.log("🔗 Mapping role permissions...");
  const allRoles = await db.select().from(roles);
  const allPermissions = await db.select().from(permissions);

  for (const [roleCode, permissionKeys] of Object.entries(
    rolePermissionMappings
  )) {
    const role = allRoles.find((r) => r.code === roleCode);
    if (!role) continue;

    for (const permKey of permissionKeys) {
      const permission = allPermissions.find((p) => p.key === permKey);
      if (!permission) continue;

      await db
        .insert(rolePermissions)
        .values({
          roleId: role.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing();
    }
  }

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
