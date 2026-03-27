"use client"
import React, { useEffect, useState } from 'react'
import { Table } from '@/components/ui/Table';

import { ProspectHeader } from './ProspectHeader'
import { TableColumn } from '@/components/ui/Table'
import { Prospect } from '../types/types'
import ProspectDetail from './ProspectDetail'
import { useProspectsStore } from '../stores/useProspectsStore'
import { useUserStore } from '../../user/store/userStore'
import  ProspectModel from './ProspectModel'
import Loading from '@/components/ui/Loading'
import { DateConvertion } from '@/libs/utils/dateConvertion';

export const prospectsColumns: TableColumn<Prospect>[] = [
  {
    key: 'fullName',
    title: 'Name',
    dataIndex: 'fullName',
    sortable: true,
    width: '18%',
  },
  {
    key: 'domain',
    title: 'Domain',
    dataIndex: 'domain' as any,
    sortable: false,
    width: '15%',
    render: (_val: any, record: any) => {
      const domain = record?.domain;
      if (!domain) return <span className="text-gray-400">-</span>;
      return <span className="text-xs truncate block max-w-[140px]">{domain}</span>;
    },
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: false,
    width: '18%',
    render: (email: any) => email ? <span className="text-xs truncate block max-w-[160px]">{email}</span> : <span className="text-gray-400">-</span>,
  },
  {
    key: 'source',
    title: 'Source',
    dataIndex: 'source' as any,
    sortable: false,
    width: '10%',
    render: (_val: any, record: any) => {
      const source = record?.source;
      if (!source) return <span className="text-gray-400">-</span>;
      return <span className="text-xs">{source}</span>;
    },
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    width: '12%',
    render: (status?: Prospect['status']) => {
      const cls: Record<NonNullable<Prospect['status']>, string> = {
        New: 'bg-[#E4E4E7] text-[#3F3F46]',
        Researching: 'bg-[#DBEAFE] text-[#1D4ED8]',
        Contacted: 'bg-[#E0E7FF] text-[#4338CA]',
        Responded: 'bg-green-100 text-green-700',
        MeetingBooked: 'bg-[#FEF3C7] text-[#92400E]',
        Converted: 'bg-teal-100 text-teal-700',
        NotInterested: 'bg-[#FEE2E2] text-[#B91C1C]',
      };
      const labels: Record<string, string> = { MeetingBooked: 'Meeting', NotInterested: 'Not Int.' };
      const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${classes}`}>
          {labels[status ?? ''] ?? status ?? 'Unknown'}
        </span>
      );
    },
  },
  { key: 'owner', title: 'Owner', dataIndex: 'owner', sortable: false, width: '12%', render: (owner: any) => {
      if (!owner) return 'Unassigned';
      if (typeof owner === 'string') return <span className="text-xs truncate block max-w-[100px]">{owner}</span>;
      if (typeof owner === 'object' && owner?.name) return <span className="text-xs truncate block max-w-[100px]">{owner.name}</span>;
      return 'Unknown';
    }, avatar: { srcIndex: 'ownerImage', altIndex: 'owner', size: 24 } },
  {
    key: 'tags',
    title: 'Tags',
    dataIndex: 'tags',
    sortable: false,
    width: '12%',
    render: (tags?: string[]) => {
      if (!tags || tags.length === 0) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-gray-100 rounded">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              +{tags.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
]

export default function Prospects () {
  const [selected, setSelected] = React.useState<Prospect | null>(null)
  const [open, setOpen] = React.useState(false)
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [editProspect, setEditProspect] = useState<Prospect | null>(null);
  const [selectedProspects, setSelectedProspects] = React.useState<string[]>([])
  const [selectedProspectRows, setSelectedProspectRows] = React.useState<Prospect[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);


  const { filteredProspects, fetchProspects, loading, isDeleting: storeDeleting, isEditing: storeEditing, isExporting: storeExporting, deleteProspect, exportSingleProspect, initializeOwnerOptions } = useProspectsStore();
  const { fetchUsers, users } = useUserStore();

  // Load users once on mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load prospects once on mount
  useEffect(() => {
    fetchProspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize owner options when users are available
  useEffect(() => {
    if (users.length > 0) {
      initializeOwnerOptions();
    }
  }, [users.length, initializeOwnerOptions]);

   const handleEditDeal = (prospect: Prospect) => {
      setEditProspect(prospect);
      setShowModal(true);
      setOpen(false);
    };
  const openDetail = (prospect: Prospect) => { setSelected(prospect); setOpen(true) }
  const closeDetail = () => { setOpen(false); setSelected(null) }

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Prospect[]) => {
    setSelectedProspects(selectedKeys);
    setSelectedProspectRows(selectedRows);
  };

  return (
    <div className='overflow-x-hidden'>
      <ProspectHeader
        selectedProspects={selectedProspects}
        selectedProspectRows={selectedProspectRows}
        onClearSelection={() => {
          setSelectedProspects([]);
          setSelectedProspectRows([]);
        }}
      />
       <div className='py-4 px-3 md:py-6 md:px-4 lg:px-6 overflow-x-hidden'>
         {loading ? (
           <Loading label="Loading Prospects..." />
         ) : (
           <>
             <Table 
               columns={prospectsColumns} 
               data={filteredProspects} 
               selectable={true}
               onSelectionChange={handleSelectionChange}
               onRowClick={(record) => openDetail(record as Prospect)}
             />
             <ProspectDetail 
               isOpen={open}
               prospect={selected}
               onClose={closeDetail}
               onDelete={async (id: string) => {
                 setIsDeleting(true);
                 try {
                   await deleteProspect(id);
                   closeDetail();
                 } finally {
                   setIsDeleting(false);
                 }
               }}
               onEdit={handleEditDeal}
               onAddNotes={(id: string) => {
                 // Handle add notes logic here
                 console.log('Add notes for prospect:', id);
               }}
               onExport={(id: string) => {
                 setIsExporting(true);
                 try {
                   exportSingleProspect(id);
                 } finally {
                   setIsExporting(false);
                 }
               }}
               isDeleting={isDeleting || storeDeleting}
               isEditing={isEditing || storeEditing}
               isExporting={isExporting || storeExporting}
             />
             <ProspectModel
              open={showModal} onClose={() => setShowModal(false)} mode={editProspect ? 'edit' : 'add'} prospect={editProspect || undefined}/>
           </>
         )}
       </div>
      </div>
  )
}
