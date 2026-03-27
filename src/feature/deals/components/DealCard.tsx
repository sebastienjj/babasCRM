"use client"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/libs/utils"
import type { Deal } from "../types"
import { Badge } from "@/components/ui/Table"
import { Calendar } from "lucide-react"
import AvatarInitials from "@/components/ui/AvatarInitials"

type DealCardProps = {
  deal: Deal
  className?: string
}

// Map stage -> subtle token-based badge styles (no hard-coded colors)
const stageBadgeClass: Record<string, string> = {
  Lead: "bg-blue-50 text-blue-700",
  Discovery: "bg-indigo-50 text-indigo-700",
  Proposal: "bg-orange-50 text-orange-700",
  Design: "bg-purple-50 text-purple-700",
  Development: "bg-cyan-50 text-cyan-700",
  Review: "bg-yellow-50 text-yellow-700",
  Launch: "bg-violet-50 text-violet-700",
  Won: "bg-primary/10 text-primary",
  Lost: "bg-destructive/10 text-destructive",
}

const getCurrencySymbol = (currency?: string) => {
  switch (currency?.toUpperCase()) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'USD':
    default: return '$';
  }
};

const formatCurrency = (amount: number, currency?: string) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getContactName = (contact: any) => {
  if (!contact) return 'No Contact';
  if (typeof contact === 'string') return contact;
  if (typeof contact === 'object' && contact?.fullName) return contact.fullName;
  return 'Unknown Contact';
};

const getOwnerName = (owner: any) => {
  if (!owner) return 'No Owner';
  if (typeof owner === 'string') return owner;
  if (typeof owner === 'object' && owner?.name) return owner.name;
  if (typeof owner === 'object' && owner?.email) return owner.email;
  return 'Unknown Owner';
};

export function DealCard({ deal, className }: DealCardProps) {
  const badgeClass = stageBadgeClass[deal.stage] ?? "bg-muted text-muted-foreground"

  return (
    <Card className={cn("border", className)} role="article" aria-label={deal.dealName}>
      <CardContent className="p-4 gap-3">
        {/* Stage badge */}
        <div className="mb-2">
          <span className={cn("inline-flex items-center rounded-md  py-0.5 text-xs font-medium", badgeClass)}>
            <Badge variant={deal.stage}>{labelForStage(deal.stage)}</Badge>
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-pretty">{deal.dealName}</h4>

        {/* Amount + contact */}
        <p className="mt-1 text-xs text-[var(--brand-gray)] ">
          {(() => {
            const r = deal as any;
            if (r.hourlyRate && r.hourlyRate > 0) {
              const earned = r.hourlyRate * (r.hoursLogged || 0);
              return `${formatCurrency(earned, r.currency)} (${r.hoursLogged || 0}hrs @ ${formatCurrency(r.hourlyRate, r.currency)}/hr)`;
            }
            return formatCurrency(deal.amount, r.currency);
          })()} <span className=""> - {getContactName(deal.contact)}</span>
        </p>

        {/* Date / tags / activity */}
        <div className="text-xs mt-2  text-[var(--brand-gray)] ">
          {deal.closeDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 " />
              <span>{formatDate(deal.closeDate)}</span>
            </div>
          ) : null}
          {deal.priority ? (
            <div className="flex mt-2 items-center gap-2">
              <Calendar className="h-3.5 w-3.5 " />
              <span>{deal.priority}</span>
            </div>
          ) : null}
        </div>

        {/* Owner */}
        <div className="mt-4 flex items-center gap-2">
          <AvatarInitials name={getOwnerName(deal.owner)} size={24} />
          <span className="text-xs text-foreground/80 capitalize">{getOwnerName(deal.owner)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function labelForStage(stage: Deal["stage"]) {
  switch (stage) {
    case "Lead": return "Lead"
    case "Discovery": return "Discovery"
    case "Proposal": return "Proposal"
    case "Design": return "Design"
    case "Development": return "Development"
    case "Review": return "Review"
    case "Launch": return "Launch"
    case "Won": return "Won"
    case "Lost": return "Lost"
    default: return stage
  }
}

export default DealCard
