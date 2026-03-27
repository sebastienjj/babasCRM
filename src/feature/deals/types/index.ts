
export type Deal = {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'Lead' | 'Discovery' | 'Proposal' | 'Design' | 'Development' | 'Review' | 'Launch' | 'Won' | 'Lost'
  amount: number
  hourlyRate?: number | null
  hoursEstimated?: number | null
  hoursLogged?: number
  isOngoing?: boolean
  currency?: string
  ownerImage?: string
  activity?: string
  lastActivity?: string
  tags?: string
  closeDate?: string
  priority?: string
  notes?: string
  files?: { url: string; name?: string; size?: number; mimeType?: string }[];
 
  ownerId?: string
  userId: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  } | string;
}
