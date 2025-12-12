import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex pt-[93px]">
        <Sidebar />
        <main className="flex-1 p-6 min-h-[calc(100vh-93px)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

