"use client";
import React, { useState } from "react";
import DetailModal from "@/components/detailPage";
import type { Prospect } from "../types/types";
import AvatarInitials from "@/components/ui/AvatarInitials";
import OutreachSection from "./OutreachSection";
import toast from "react-hot-toast";

const renderStatusBadge = (status?: Prospect['status']) => {
  const cls: Record<NonNullable<Prospect['status']>, string> = {
    New: 'bg-[#E4E4E7] text-[#3F3F46]',
    Researching: 'bg-[#DBEAFE] text-[#1D4ED8]',
    Contacted: 'bg-[#E0E7FF] text-[#4338CA]',
    Responded: 'bg-green-100 text-green-700',
    MeetingBooked: 'bg-[#FEF3C7] text-[#92400E]',
    Converted: 'bg-teal-100 text-teal-700',
    NotInterested: 'bg-[#FEE2E2] text-[#B91C1C]',
  };
  const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status ?? 'Unknown'}
    </span>
  );
}

interface ProspectDetailProps {
  isOpen: boolean;
  prospect: Prospect | null;
  onClose: () => void;
  onEdit?: (prospect: Prospect) => void;
  onDelete?: (id: string) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
  isDeleting?: boolean;
  isEditing?: boolean;
  isExporting?: boolean;
}

export default function ProspectDetail({
  isOpen,
  prospect,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
  isDeleting = false,
  isEditing = false,
  isExporting = false,
}: ProspectDetailProps) {
  const [converting, setConverting] = useState(false);

  if (!prospect) return null;

  const handleConvert = async () => {
    if (!confirm("Convert this lead to a project? This will create a new project with their info.")) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/prospects/${prospect.id}/convert`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversion failed");
      toast.success(
        <span>
          Project created: <strong>{data.dealName}</strong>
        </span>
      );
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setConverting(false);
    }
  };

  const p = prospect as any;

  const details = [
    { label: "Status", value: renderStatusBadge(prospect.status) },
    {
      label: "Owner",
      value: (
        <span className="flex items-center gap-2">
          <AvatarInitials
            name={typeof prospect.owner === 'object' ? prospect.owner?.name ?? '' : String(prospect.owner ?? '')}
            size={24}
          />
          {typeof prospect.owner === 'object' ? prospect.owner?.name : prospect.owner ?? "-"}
        </span>
      ),
    },
    { label: "Company", value: prospect.company && typeof prospect.company === 'object' && 'fullName' in prospect.company ? (prospect.company as any).fullName ?? "-" : prospect.company ?? "-" },
    { label: "Email", value: prospect.email ?? "-" },
    { label: "Phone", value: prospect.phone ?? "-" },
    p.domain && { label: "Domain", value: p.domain },
    p.website && {
      label: "Website",
      value: (
        <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
          {p.website}
        </a>
      ),
    },
    p.nameType && { label: "Name Type", value: p.nameType },
    p.source && { label: "Source", value: p.source },
    { label: "Last Contact", value: prospect.lastContact ? new Date(prospect.lastContact).toLocaleDateString() : "-" },
    prospect.tags && prospect.tags.length > 0 && {
      label: "Tags",
      value: (
        <div className="flex flex-wrap gap-1">
          {prospect.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              {tag}
            </span>
          ))}
        </div>
      )
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={prospect.fullName ?? "Lead Details"}
      notes={prospect.notes ?? undefined}
      details={details}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(prospect.id) : undefined}
      onEdit={onEdit ? () => onEdit(prospect as Prospect) : undefined}
      editLabel="Edit Lead"
      onAddNotes={onAddNotes ? () => onAddNotes(prospect.id) : undefined}
      onExport={onExport ? () => onExport(prospect.id) : undefined}
      isDeleting={isDeleting}
      isEditing={isEditing}
      isExporting={isExporting}
      extraContent={
        <div className="space-y-4">
          <OutreachSection prospectId={prospect.id} />
          {prospect.status !== "Converted" && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full py-2 px-4 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {converting ? "Converting..." : "Convert to Project"}
              </button>
            </div>
          )}
        </div>
      }
    />
  );
}
