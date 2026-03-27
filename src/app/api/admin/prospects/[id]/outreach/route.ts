import { NextRequest, NextResponse } from "next/server";
import { getSessionOrDev } from "@/libs/devSession";
import { prisma } from "@/libs/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Params) {
  try {
    const { id } = await context.params;

    const logs = await prisma.outreachLog.findMany({
      where: { prospectId: id },
      orderBy: { createdAt: "desc" },
      include: {
        performedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("GET /prospects/:id/outreach error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: Params) {
  try {
    const session = await getSessionOrDev();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (!body.action || typeof body.action !== "string") {
      return NextResponse.json(
        { error: "Validation error", details: "action is required" },
        { status: 422 }
      );
    }

    const prospect = await prisma.prospect.findUnique({ where: { id } });
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const log = await prisma.outreachLog.create({
      data: {
        prospectId: id,
        action: body.action,
        details: body.details ?? null,
        performedById: session.user.id,
      },
      include: {
        performedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error("POST /prospects/:id/outreach error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
