"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Search, Grid3x3, Briefcase, User, FileText, PoundSterling, Shield, Wrench, ChevronDown, Mail, MessageCircle } from "lucide-react"
import { SupportChatWidget } from "@/components/support-chat-widget"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "How do I post a new job?",
    answer: "To post a new job, navigate to the Jobs page and click the 'Create Job' button. Fill in all required fields including job title, description, requirements, and other details. Once completed, click 'Publish' to make your job listing live."
  },
  {
    question: "How can I edit or remove a job posting?",
    answer: "You can edit a job posting by going to the Jobs page, finding the job you want to edit, and clicking the edit icon. To remove a job posting, click the delete icon and confirm the deletion. Deleted jobs cannot be recovered."
  },
  {
    question: "What happens when I delete my account?",
    answer: "When you delete your account, all your data including job postings, candidate information, and messages will be permanently deleted. This action cannot be undone. Please ensure you have exported any important data before proceeding."
  },
  {
    question: "How do I contact shortlisted candidates?",
    answer: "You can contact shortlisted candidates by going to the Candidates page, finding the candidate you want to contact, and clicking the message icon. You can send messages, schedule interviews, or make phone calls directly from the platform."
  },
  {
    question: "Can I pause my subscription?",
    answer: "Yes, you can pause your subscription at any time from the Billing page. When paused, you'll retain access to your account but won't be charged. You can resume your subscription whenever you're ready."
  }
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Support / Help Center</h1>
            <p className="text-neutral-600">Find answers to common questions and get help</p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-end">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Support Categories */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Support / Help Center Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Getting Started */}
            <Link href="/support/getting-started" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <Grid3x3 className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Getting Started</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Posting your first job</li>
                      <li>Updating company profile</li>
                      <li>Understanding the dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Job Management */}
            <Link href="/support/job-management" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <Briefcase className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Job Management</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Edit / Delete job postings</li>
                      <li>Application tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Candidates */}
            <Link href="/support/candidates" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <User className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Candidates</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Viewing candidate profiles</li>
                      <li>Shortlisting / rejecting applicants</li>
                      <li>Messaging candidates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Billing & Subscriptions */}
            <Link href="/support/billing" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <PoundSterling className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Billing & Subscriptions</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Invoices & receipts</li>
                      <li>Refund policy</li>
                      <li>Payment methods</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Account & Security */}
            <Link href="/support/account-security" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <Shield className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Account & Security</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Password management</li>
                      <li>2FA authentication</li>
                      <li>Account settings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Technical Support */}
            <Link href="/support/technical-support" className="block">
              <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 rounded-lg p-3">
                    <Wrench className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 mb-3">Technical Support</h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                      <li>Login issues</li>
                      <li>Dashboard errors</li>
                      <li>Browser compatibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">FAQ (Frequently Asked Questions)</h2>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm font-medium text-neutral-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${openFAQ === index ? "transform rotate-180" : ""
                      }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                    <p className="text-sm text-neutral-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Support */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-sky-100 rounded-lg p-3">
                  <Mail className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">Email Support</h3>
                  <a
                    href="mailto:support@opennurse.com"
                    className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    support@opennurse.com
                  </a>
                </div>
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-sky-100 rounded-lg p-3">
                  <MessageCircle className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-neutral-900 mb-2">Live Chat</h3>
                  <p className="text-sm text-neutral-600">Available 9am - 6pm (Business Days)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SupportChatWidget />
    </DashboardLayout>
  )
}
