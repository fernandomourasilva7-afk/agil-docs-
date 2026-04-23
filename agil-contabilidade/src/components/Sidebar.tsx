'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FolderOpen, LayoutDashboard, UserPlus, LogOut, X, Menu, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clientes/novo', icon: UserPlus, label: 'Novo Cliente' },
  { href: '/plano', icon: Sparkles, label: 'Meu Plano' },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-500 text-white rounded-lg p-1.5">
            <FolderOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Ágil Docs</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/60">
        <button
          onClick={sair}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 w-full transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:z-30">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-slate-900 border-b border-slate-700/60 flex items-center gap-3 px-4 h-14">
        <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-teal-500 text-white rounded-lg p-1">
            <FolderOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-white">Ágil Docs</span>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            <NavContent onClose={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
