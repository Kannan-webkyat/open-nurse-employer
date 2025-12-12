"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    console.log("Deleting account...")
    setIsDeleteDialogOpen(false)
  }

  const isConfirmValid = confirmText.toLowerCase() === "delete"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Delete Account</h1>
          <p className="text-neutral-600">Permanently delete your account and all associated data</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Warning</h2>
              <p className="text-sm text-neutral-600 mb-4">
                This action cannot be undone. This will permanently delete your account, remove all your data from our servers, and cancel any active subscriptions. All your jobs, candidates, and billing information will be permanently deleted.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-2 block">
                    To confirm, type <span className="font-bold text-red-600">DELETE</span> in the box below
                  </label>
                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="danger"
                  disabled={!isConfirmValid}
                  className="bg-red-600 text-white hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete Account"
          description="Are you sure you want to permanently delete your account? This action cannot be undone."
          variant="danger"
        />
      </div>
    </DashboardLayout>
  )
}

