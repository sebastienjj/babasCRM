import { NextRequest, NextResponse } from "next/server";
import { getSessionOrDev } from "@/libs/devSession";
import { prisma } from "@/libs/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Params) {
  try {
    const session = await getSessionOrDev();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const prospect = await prisma.prospect.findUnique({ where: { id } });
    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    if (prospect.status === "Converted") {
      return NextResponse.json(
        { error: "Prospect is already converted" },
        { status: 400 }
      );
    }

    const deal = await prisma.$transaction(async (tx) => {
      const newDeal = await tx.deal.create({
        data: {
          dealName: prospect.fullName || prospect.domain || "Untitled Deal",
          stage: "Lead",
          amount: 0,
          currency: "USD",
          ownerId: session.user.id,
          companyId: prospect.companyId ?? null,
          notes: prospect.notes ?? null,
          hoursLogged: 0,
        },
      });

      await tx.prospect.update({
        where: { id },
        data: { status: "Converted" },
      });

      return newDeal;
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    console.error("POST /prospects/:id/convert error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
