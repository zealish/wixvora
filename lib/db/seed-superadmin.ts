import 'dotenv/config'
import { db } from '@/lib/db'
import { user, staffs, staffRoles, roles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/auth'

const SUPERADMIN_EMAIL = 'admin@wixvora.com'
const SUPERADMIN_PASSWORD = 'Admin123!'
const SUPERADMIN_NAME = 'Super Admin'

async function seedSuperAdmin() {
  console.log('Seeding superadmin account...')

  const existing = await db.select().from(user).where(eq(user.email, SUPERADMIN_EMAIL)).limit(1)
  if (existing.length > 0) {
    console.log('Superadmin user already exists:', SUPERADMIN_EMAIL)
    process.exit(0)
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      name: SUPERADMIN_NAME,
      accountType: 'STAFF',
    },
  })

  if (!result || !result.user) {
    console.error('Failed to create superadmin user')
    process.exit(1)
  }

  const userId = result.user.id
  console.log('Created user:', userId)

  const [staff] = await db.insert(staffs).values({
    userId,
    department: 'Engineering',
    position: 'Super Administrator',
    employmentStatus: 'ACTIVE',
  }).returning()

  console.log('Created staff profile:', staff!.id)

  const [superAdminRole] = await db.select().from(roles).where(eq(roles.code, 'SUPER_ADMIN')).limit(1)

  if (!superAdminRole) {
    console.error('SUPER_ADMIN role not found. Run db:seed first.')
    process.exit(1)
  }

  await db.insert(staffRoles).values({
    staffId: staff!.id,
    roleId: superAdminRole.id,
  })

  console.log('Assigned SUPER_ADMIN role')
  console.log('')
  console.log('Superadmin account created:')
  console.log(`  Email: ${SUPERADMIN_EMAIL}`)
  console.log(`  Password: ${SUPERADMIN_PASSWORD}`)
  console.log('')

  process.exit(0)
}

seedSuperAdmin().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
