"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, MessageSquare, Send, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

interface OutreachLog {
  id: string
  action: string
  details?: string
  createdAt: string
  performedBy: { name?: string; email: string }
}

const ACTION_OPTIONS = [
  "Email Sent",
  "LinkedIn DM",
  "Phone Call",
  "Follow-Up Email",
  "Left Voicemail",
  "Note",
  "Other",
]

const ACTION_ICONS: Record<string, React.ReactNode> = {
  "Email Sent": <Mail size={14} className="text-blue-500" />,
  "Follow-Up Email": <Send size={14} className="text-indigo-500" />,
  "LinkedIn DM": <MessageSquare size={14} className="text-sky-600" />,
  "Phone Call": <Phone size={14} className="text-green-500" />,
  "Left Voicemail": <Phone size={14} className="text-orange-500" />,
  "Note": <MessageSquare size={14} className="text-gray-500" />,
  "Other": <Clock size={14} className="text-gray-400" />,
}

export default function OutreachSection({ prospectId }: { prospectId: string }) {
  const [logs, setLogs] = useState<OutreachLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [action, setAction] = useState(ACTION_OPTIONS[0])
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/outreach`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [prospectId])

  const handleSubmit = async () => {
    if (!action) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/prospects/${prospectId}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details: details || undefined }),
      })
      if (!res.ok) throw new Error("Failed to log activity")
      toast.success("Activity logged")
      setDetails("")
      setShowForm(false)
      fetchLogs()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Outreach Activity</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <Plus size={12} /> Log Activity
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 outline-none"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Add details (optional)..."
            rows={2}
            className="w-full text-sm border border-gray-200 rounded px-3 py-2 outline-none resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="bg-black text-white" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Log"}
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-xs text-gray-400">No outreach activity yet</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="mt-0.5 flex-shrink-0">
                {ACTION_ICONS[log.action] || <Clock size={14} className="text-gray-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{log.action}</p>
                {log.details && <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>}
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatDate(log.createdAt)} &middot; {log.performedBy?.name || log.performedBy?.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
