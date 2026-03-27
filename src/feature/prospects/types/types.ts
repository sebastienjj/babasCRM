export type Prospect = {
  id: string;
  fullName: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  status: 'New' | 'Researching' | 'Contacted' | 'Responded' | 'MeetingBooked' | 'Converted' | 'NotInterested';
  lastContact?: string | null;
  tags?: string[];
  notes?: string | null;
  domain?: string;
  website?: string;
  nameType?: string;
  firstDetected?: string;
  lastDetected?: string;
  source?: string;
  files?: Array<{ url: string; name: string; size: number }>;
  ownerId: string;
  userId: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  } | string; // Can be either User object (from API) or string (processed)
  ownerAvatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Contact = {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  owner?: string;
  ownerAvatar?: string;
  status?:
    | 'New'
    | 'Researching'
    | 'Contacted'
    | 'Responded'
    | 'MeetingBooked'
    | 'Converted'
    | 'NotInterested';
  lastContact?: string;
  tags?: string;
};
