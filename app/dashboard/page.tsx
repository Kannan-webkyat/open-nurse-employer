import { DashboardLayout } from "@/components/dashboard/layout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600">Welcome to your dashboard</p>
      </div>
    </DashboardLayout>
  )
}

