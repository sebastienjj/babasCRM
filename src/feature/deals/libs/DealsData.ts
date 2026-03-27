export interface DealData {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'Lead' | 'Discovery' | 'Proposal' | 'Design' | 'Development' | 'Review' | 'Launch' | 'Won' | 'Lost'
  amount: number
  owner: string
  ownerImage?: string
  activity?: string
  tags?: string
  date?: string 
  priority?: string
  notes?: string
  files?: { url: string; name?: string; size?: number; mimeType?: string }[];
}

