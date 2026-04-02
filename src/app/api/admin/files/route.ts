import { NextRequest, NextResponse } from "next/server"
import { getSessionOrDev } from "@/libs/devSession"
import { prisma } from "@/libs/prisma"
import { unlink } from "fs/promises"
import path from "path"

// GET: List files for a customer, company, or deal
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const customerId = url.searchParams.get("customerId")
    const companyId = url.searchParams.get("companyId")
    const dealId = url.searchParams.get("dealId")
    const category = url.searchParams.get("category")

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (companyId) where.companyId = companyId
    if (dealId) where.dealId = dealId
    if (category && category !== "All") where.category = category

    const files = await prisma.clientFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { name: true, email: true } } },
    })

    return NextResponse.json(files)
  } catch (err: any) {
    console.error("GET /files error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE: Remove a file by id
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionOrDev()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId } = await req.json()
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 })
    }

    const file = await prisma.clientFile.findUnique({ where: { id: fileId } })
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete from disk
    try {
      const fullPath = path.join(process.cwd(), "public", file.filePath)
      await unlink(fullPath)
    } catch {
      // File might already be gone, continue with DB cleanup
    }

    await prisma.clientFile.delete({ where: { id: fileId } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /files error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PATCH: Update file metadata (category, notes)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionOrDev()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId, category, notes } = await req.json()
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 })
    }

    const updated = await prisma.clientFile.update({
      where: { id: fileId },
      data: {
        ...(category !== undefined ? { category } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("PATCH /files error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
