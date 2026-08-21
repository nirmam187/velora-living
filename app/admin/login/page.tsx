import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  if (isAdmin()) redirect('/admin')

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-display text-2xl tracking-[0.04em] text-ink">Velora</div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.35em] text-gold">
            Living
          </div>
        </div>
        <h1 className="mb-2 font-display text-2xl font-medium">Studio admin</h1>
        <p className="mb-8 text-sm text-ink-soft">
          Enquiries and newsletter signups.
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
