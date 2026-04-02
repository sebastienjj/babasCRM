"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, Trash2, FileText, Film, Image as ImageIcon, File, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import toast from "react-hot-toast"

interface ClientFile {
  id: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  category: string
  notes?: string
  createdAt: string
  uploadedBy?: { name?: string; email: string }
}

const CATEGORIES = ["All", "Logo", "Brand", "Reference", "Deliverable", "QR Code", "Video", "Document", "General"]

interface ClientBrainProps {
  customerId?: string
  companyId?: string
  dealId?: string
  title?: string
  showSharedFiles?: boolean // When viewing from a project, also show the client's shared files
  sharedCustomerId?: string
  sharedCompanyId?: string
}

export default function ClientBrain({
  customerId,
  companyId,
  dealId,
  title = "Client Brain",
  showSharedFiles = false,
  sharedCustomerId,
  sharedCompanyId,
}: ClientBrainProps) {
  const [files, setFiles] = useState<ClientFile[]>([])
  const [sharedFiles, setSharedFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState("All")
  const [uploadCategory, setUploadCategory] = useState("General")
  const [dragOver, setDragOver] = useState(false)
  const [previewFile, setPreviewFile] = useState<ClientFile | null>(null)

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (customerId) params.set("customerId", customerId)
      if (companyId) params.set("companyId", companyId)
      if (dealId) params.set("dealId", dealId)
      if (category !== "All") params.set("category", category)

      const res = await fetch(`/api/admin/files?${params}`)
      if (res.ok) setFiles(await res.json())

      // Fetch shared client files if viewing from a project
      if (showSharedFiles && (sharedCustomerId || sharedCompanyId)) {
        const sharedParams = new URLSearchParams()
        if (sharedCustomerId) sharedParams.set("customerId", sharedCustomerId)
        if (sharedCompanyId) sharedParams.set("companyId", sharedCompanyId)
        if (category !== "All") sharedParams.set("category", category)

        const sharedRes = await fetch(`/api/admin/files?${sharedParams}`)
        if (sharedRes.ok) setSharedFiles(await sharedRes.json())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [customerId, companyId, dealId, category, showSharedFiles, sharedCustomerId, sharedCompanyId])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const handleUpload = async (fileList: FileList) => {
    setUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < fileList.length; i++) formData.append("file", fileList[i])
      if (customerId) formData.set("customerId", customerId)
      if (companyId) formData.set("companyId", companyId)
      if (dealId) formData.set("dealId", dealId)
      formData.set("category", uploadCategory)

      const res = await fetch("/api/admin/files/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      toast.success(`${fileList.length} file(s) uploaded`)
      fetchFiles()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return
    try {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("File deleted")
      fetchFiles()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={20} className="text-blue-500" />
    if (type.startsWith("video/")) return <Film size={20} className="text-purple-500" />
    if (type.includes("pdf")) return <FileText size={20} className="text-red-500" />
    return <File size={20} className="text-gray-400" />
  }

  const isImage = (type: string) => type.startsWith("image/")
  const isVideo = (type: string) => type.startsWith("video/")

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const renderFileGrid = (fileList: ClientFile[], label?: string) => (
    <div>
      {label && <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{label}</h4>}
      {fileList.length === 0 ? (
        <p className="text-sm text-gray-400">No files yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setPreviewFile(file)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {isImage(file.fileType) ? (
                  <img src={file.filePath} alt={file.fileName} className="w-full h-full object-cover" />
                ) : isVideo(file.fileType) ? (
                  <video src={file.filePath} className="w-full h-full object-cover" muted />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    {getFileIcon(file.fileType)}
                    <span className="text-[10px] text-gray-400 uppercase">{file.fileName.split('.').pop()}</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{file.fileName}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{formatSize(file.fileSize)}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{file.category}</span>
                </div>
              </div>
              {/* Delete on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(file.id) }}
                className="absolute top-1 right-1 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center gap-4">
          <Upload size={20} className="text-gray-400" />
          <div className="text-left">
            <p className="text-sm font-medium">Drop files here or <label className="text-blue-600 cursor-pointer hover:underline">
              browse
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
            </label></p>
            <p className="text-xs text-gray-400">Images, videos, PDFs, docs</p>
          </div>
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 ml-auto"
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {uploading && <p className="text-xs text-blue-500 mt-2">Uploading...</p>}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              category === c ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* File grids */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading files...</p>
      ) : (
        <div className="space-y-6">
          {dealId && showSharedFiles && sharedFiles.length > 0 && (
            renderFileGrid(sharedFiles, "Client Assets (Shared)")
          )}
          {renderFileGrid(files, dealId && showSharedFiles ? "Project Files" : undefined)}
        </div>
      )}

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-lg max-w-3xl max-h-[85vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b">
              <div>
                <p className="text-sm font-medium">{previewFile.fileName}</p>
                <p className="text-xs text-gray-400">{formatSize(previewFile.fileSize)} &middot; {previewFile.category}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[300px]">
              {isImage(previewFile.fileType) ? (
                <img src={previewFile.filePath} alt={previewFile.fileName} className="max-w-full max-h-[70vh] object-contain" />
              ) : isVideo(previewFile.fileType) ? (
                <video src={previewFile.filePath} controls className="max-w-full max-h-[70vh]" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {getFileIcon(previewFile.fileType)}
                  <a href={previewFile.filePath} download className="text-sm text-blue-600 hover:underline">
                    Download {previewFile.fileName}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
