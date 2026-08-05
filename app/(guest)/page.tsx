import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    if (session.user.accountType === 'CLIENT') {
      redirect('/client')
    } else {
      redirect('/staff')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Wixvora</h1>
        <p className="text-muted-foreground">
          Your business management platform
        </p>
      </div>
    </div>
  )
}
