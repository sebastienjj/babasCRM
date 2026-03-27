import { NextResponse } from "next/server";
import { getSessionOrDev } from "@/libs/devSession";
import { prisma } from "@/libs/prisma";

/**
 * Parse a "Mon YYYY" date string (e.g. "May 2024", "Mar 2026") into a Date.
 * Returns null if the input is falsy or unparseable.
 */
function parseMonthYear(value: string | undefined | null): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const date = new Date(`1 ${trimmed}`);
  if (isNaN(date.getTime())) return null;
  return date;
}

export async function POST(req: Request) {
  try {
    const session = await getSessionOrDev();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mappings, rows } = body as {
      mappings: Record<string, string>;
      rows: Record<string, unknown>[];
    };

    if (!mappings || !rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid payload: mappings and rows are required" },
        { status: 400 }
      );
    }

    // Build a reverse map: prospectField -> csvColumn
    const fieldToColumn: Record<string, string> = {};
    for (const [csvCol, prospectField] of Object.entries(mappings)) {
      if (prospectField) {
        fieldToColumn[prospectField] = csvCol;
      }
    }

    const userId = session.user.id;

    // Pre-fetch existing emails and domains for dedup
    const existingProspects = await prisma.prospect.findMany({
      select: { email: true, domain: true },
    });

    const existingEmails = new Set(
      existingProspects
        .map((p) => p.email?.toLowerCase())
        .filter(Boolean) as string[]
    );
    const existingDomains = new Set(
      existingProspects
        .map((p) => p.domain?.toLowerCase())
        .filter(Boolean) as string[]
    );

    let imported = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // Apply mappings to extract values
        const getValue = (field: string): string => {
          const col = fieldToColumn[field];
          if (!col) return "";
          const val = row[col];
          return typeof val === "string" ? val.trim() : val != null ? String(val).trim() : "";
        };

        const fullName = getValue("fullName");
        const email = getValue("email");
        const domain = getValue("domain");

        if (!fullName) {
          errors.push(`Row ${i + 1}: missing fullName, skipped`);
          continue;
        }

        // Dedup check
        const emailLower = email?.toLowerCase();
        const domainLower = domain?.toLowerCase();

        if ((emailLower && existingEmails.has(emailLower)) ||
            (domainLower && existingDomains.has(domainLower))) {
          duplicates++;
          continue;
        }

        const firstDetected = parseMonthYear(getValue("firstDetected") || null);
        const lastDetected = parseMonthYear(getValue("lastDetected") || null);

        await prisma.prospect.create({
          data: {
            fullName,
            email: email || null,
            phone: getValue("phone") || null,
            domain: domain || null,
            website: getValue("website") || null,
            nameType: getValue("nameType") || null,
            firstDetected,
            lastDetected,
            notes: getValue("notes") || null,
            status: "New",
            source: "CSV Import",
            userId,
            ownerId: userId,
          },
        });

        // Track newly imported for in-batch dedup
        if (emailLower) existingEmails.add(emailLower);
        if (domainLower) existingDomains.add(domainLower);

        imported++;
      } catch (rowErr: any) {
        errors.push(`Row ${i + 1}: ${rowErr.message ?? "unknown error"}`);
      }
    }

    return NextResponse.json({ imported, duplicates, errors });
  } catch (err) {
    console.error("POST /prospects/import error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
