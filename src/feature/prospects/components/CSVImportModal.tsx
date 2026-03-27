"use client"

import { useState, useCallback } from "react"
import { X, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/Button"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"

const LEAD_FIELDS = [
  { value: "", label: "— Skip —" },
  { value: "fullName", label: "Contact Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "domain", label: "Domain" },
  { value: "website", label: "Website URL" },
  { value: "nameType", label: "Name Type" },
  { value: "firstDetected", label: "First Detected" },
  { value: "lastDetected", label: "Last Detected" },
  { value: "notes", label: "Notes" },
]

const AUTO_MAP: Record<string, string> = {
  "email": "email",
  "e-mail": "email",
  "name": "fullName",
  "contact name": "fullName",
  "inferred contact name": "fullName",
  "full name": "fullName",
  "fullname": "fullName",
  "phone": "phone",
  "phone number": "phone",
  "domain": "domain",
  "website": "website",
  "website url": "website",
  "url": "website",
  "name type": "nameType",
  "nametype": "nameType",
  "first detected": "firstDetected",
  "last detected": "lastDetected",
  "notes": "notes",
  "note": "notes",
}

type Step = "upload" | "mapping" | "preview" | "importing" | "done"

interface CSVImportModalProps {
  open: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export default function CSVImportModal({ open, onClose, onImportComplete }: CSVImportModalProps) {
  const [step, setStep] = useState<Step>("upload")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ imported: number; duplicates: number; errors: string[] } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const reset = () => {
    setStep("upload")
    setHeaders([])
    setRows([])
    setMappings({})
    setResult(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const parseFile = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!sheet) throw new Error("No worksheet found")

      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
      if (json.length === 0) throw new Error("File is empty")

      const hdrs = Object.keys(json[0])
      setHeaders(hdrs)
      setRows(json)

      // Auto-map headers
      const autoMappings: Record<string, string> = {}
      hdrs.forEach((h) => {
        const key = h.toLowerCase().trim()
        if (AUTO_MAP[key]) autoMappings[h] = AUTO_MAP[key]
      })
      setMappings(autoMappings)
      setStep("mapping")
    } catch (err: any) {
      toast.error(err.message || "Failed to parse file")
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }, [parseFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }, [parseFile])

  const handleImport = async () => {
    setStep("importing")
    try {
      const res = await fetch("/api/admin/prospects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings, rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")
      setResult(data)
      setStep("done")
      if (data.imported > 0) {
        toast.success(`${data.imported} leads imported!`)
        onImportComplete?.()
      }
    } catch (err: any) {
      toast.error(err.message || "Import failed")
      setStep("preview")
    }
  }

  const mappedCount = Object.values(mappings).filter(Boolean).length
  const previewRows = rows.slice(0, 5)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Import Leads</h2>
            <p className="text-xs text-gray-500">
              {step === "upload" && "Upload a CSV or Excel file"}
              {step === "mapping" && `Map your columns to lead fields (${mappedCount} mapped)`}
              {step === "preview" && `Preview ${rows.length} rows before importing`}
              {step === "importing" && "Importing..."}
              {step === "done" && "Import complete"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* UPLOAD STEP */}
          {step === "upload" && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium mb-1">Drag & drop your file here</p>
              <p className="text-xs text-gray-500 mb-4">CSV or Excel (.xlsx, .xls)</p>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800">
                  <Upload size={14} /> Choose File
                </span>
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          )}

          {/* MAPPING STEP */}
          {step === "mapping" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-2">
                Found {headers.length} columns and {rows.length} rows
              </p>
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <div className="w-1/2 text-sm font-medium truncate bg-gray-50 px-3 py-2 rounded">
                    {header}
                  </div>
                  <span className="text-gray-400">→</span>
                  <select
                    className="w-1/2 text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400"
                    value={mappings[header] || ""}
                    onChange={(e) => setMappings((prev) => ({ ...prev, [header]: e.target.value }))}
                  >
                    {LEAD_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* PREVIEW STEP */}
          {step === "preview" && (
            <div className="overflow-x-auto">
              <p className="text-xs text-gray-500 mb-3">
                Showing first {previewRows.length} of {rows.length} rows
              </p>
              <table className="w-full text-xs border">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.entries(mappings).filter(([, v]) => v).map(([csvCol, field]) => (
                      <th key={csvCol} className="px-3 py-2 text-left font-medium border-b">
                        {LEAD_FIELDS.find((f) => f.value === field)?.label || field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {Object.entries(mappings).filter(([, v]) => v).map(([csvCol]) => (
                        <td key={csvCol} className="px-3 py-2 truncate max-w-[200px]">
                          {row[csvCol] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* IMPORTING STEP */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Importing {rows.length} leads...</p>
            </div>
          )}

          {/* DONE STEP */}
          {step === "done" && result && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <p className="text-sm font-medium">{result.imported} leads imported</p>
                  {result.duplicates > 0 && (
                    <p className="text-xs text-gray-500">{result.duplicates} duplicates skipped</p>
                  )}
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-500" size={16} />
                    <p className="text-sm font-medium text-red-700">{result.errors.length} errors</p>
                  </div>
                  <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button onClick={step === "done" ? handleClose : () => { if (step === "mapping") setStep("upload"); else if (step === "preview") setStep("mapping") }}>
            {step === "done" ? "Close" : "Back"}
          </Button>
          <div className="flex gap-2">
            {step === "mapping" && (
              <Button className="bg-black text-white" onClick={() => setStep("preview")} disabled={mappedCount === 0}>
                Preview ({rows.length} rows)
              </Button>
            )}
            {step === "preview" && (
              <Button className="bg-black text-white" onClick={handleImport}>
                Import {rows.length} Leads
              </Button>
            )}
            {step === "done" && (
              <Button className="bg-black text-white" onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
