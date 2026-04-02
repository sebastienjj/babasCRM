import { NextRequest, NextResponse } from "next/server"
import { getSessionOrDev } from "@/libs/devSession"
import { prisma } from "@/libs/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrDev()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const files = formData.getAll("file") as File[]
    const customerId = formData.get("customerId") as string | null
    const companyId = formData.get("companyId") as string | null
    const dealId = formData.get("dealId") as string | null
    const category = (formData.get("category") as string) || "General"

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Determine folder based on client
    const folderId = customerId || companyId || dealId || "general"
    const uploadDir = path.join(process.cwd(), "public", "uploads", folderId)
    await mkdir(uploadDir, { recursive: true })

    const created = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Sanitize filename and add timestamp to avoid collisions
      const ext = path.extname(file.name)
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_")
      const fileName = `${Date.now()}_${baseName}${ext}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, buffer)

      const publicPath = `/uploads/${folderId}/${fileName}`

      const record = await prisma.clientFile.create({
        data: {
          fileName: file.name,
          filePath: publicPath,
          fileType: file.type || "application/octet-stream",
          fileSize: file.size,
          category,
          customerId: customerId || undefined,
          companyId: companyId || undefined,
          dealId: dealId || undefined,
          uploadedById: session.user.id,
        },
      })

      created.push(record)
    }

    return NextResponse.json({ files: created }, { status: 201 })
  } catch (err: any) {
    console.error("File upload error:", err)
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 })
  }
}
