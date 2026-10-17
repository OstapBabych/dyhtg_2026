import type { ReactNode } from 'react'
import { APP_NAME } from '../../constants/app'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">{APP_NAME}</header>
      <main className="app-main">{children}</main>
    </div>
  )
}
