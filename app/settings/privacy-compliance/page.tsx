"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { suggestionApi } from "@/lib/api/suggestions"
import { useToast } from "@/components/ui/toast"
import { format } from "date-fns"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

export default function PrivacyCompliancePage() {
  const { success, error } = useToast()

  // Suggestion State
  const [suggestionInput, setSuggestionInput] = useState("")
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true)
    try {
      const response = await suggestionApi.getAll()
      if (response.success) {
        setSuggestions(response.data.data) // Pagination data structure
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleCreateSuggestion = async () => {
    if (!suggestionInput.trim()) return

    setIsSubmittingSuggestion(true)
    try {
      const response = await suggestionApi.create({ content: suggestionInput })
      if (response.success) {
        success("Your suggestion has been submitted successfully.", {
          title: "Success",
        })
        setSuggestionInput("")
        fetchSuggestions() // Refresh list
      } else {
        error(response.message || "Failed to submit suggestion.", {
          title: "Error",
        })
      }
    } catch (err) {
      console.error("Error submitting suggestion:", err)
      error("An unexpected error occurred.", {
        title: "Error",
      })
    } finally {
      setIsSubmittingSuggestion(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Privacy & Compliance</h1>
          <p className="text-neutral-600">Manage your privacy settings and share feedback.</p>
        </div>


        {/* System Suggestions Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">System Suggestions</h2>
          <p className="text-sm text-neutral-600 mb-6">Have suggestions to improve our system? We'd love to hear from you!</p>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <textarea
                value={suggestionInput}
                onChange={(e) => setSuggestionInput(e.target.value)}
                placeholder="Type your suggestion here... e.g., 'It would be great if we could filter candidates by availability...'"
                className="flex-1 min-h-[100px] rounded-md border border-neutral-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleCreateSuggestion}
                disabled={!suggestionInput.trim() || isSubmittingSuggestion}
                className="bg-[#00EB23] hover:bg-[#00d820] text-white"
              >
                {isSubmittingSuggestion ? "Submitting..." : "Submit Suggestion"}
              </Button>
            </div>

            {/* Past Suggestions History */}
            {suggestions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Your Past Suggestions</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Suggestion</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell className="text-neutral-900">{suggestion.content}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              suggestion.status === 'implemented' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {suggestion.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-neutral-600">
                          {format(new Date(suggestion.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

