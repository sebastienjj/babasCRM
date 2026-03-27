"use client"

import SideBar from "./layout/SideBar"
import NavBar from "./layout/NavBar"
import {useCompanyModalStore} from "@/feature/companies/stores/useCompanyModalStore"
import CompaniesModel from "@/feature/companies/components/CompaniesModel"
import CustomersModel from "@/feature/customers/components/CustomersModel"
import {useCustomerModalStore} from "@/feature/customers/stores/useCustomersModel"
import {useMeetingModalStore} from "@/feature/meetings/stores/meetingModelStore"
import {AddMeetingModal} from "@/feature/meetings/components/AddMeetingModal"
import {useDealModalStore} from "@/feature/deals/stores/dealsModelStore"
import {useTaskModalStore} from "@/feature/todo/stores/taskModelStore"
import DealSlideOver from "@/feature/deals/components/DealModal"
import TodoSlideOver from "@/feature/todo/components/TodoModel"
import {useProspectModelStore} from "@/feature/prospects/stores/prospectModelStore";
import ProspectSlideOver from "@/feature/prospects/components/ProspectModel";

export default function ProtectedLayout({children}: { children: React.ReactNode }) {
    const {isOpen: isCompanyOpen, closeModal: closeCompanyModal, mode: companyMode} = useCompanyModalStore();
    const {isOpen: isCustomerOpen, closeModal: closeCustomerModal, mode: customerMode} = useCustomerModalStore();
    const {isOpen: isMeetingOpen, closeModal: closeMeetingModal, mode: MeetingMode} = useMeetingModalStore();
    const {isOpen: isDealOpen, closeModal: closeDealModal, mode: DealMode} = useDealModalStore();
    const {isOpen: isTaskOpen, closeModal: closeTaskModal, mode: TaskMode} = useTaskModalStore();
    const {isOpen: isProspectOpen, closeModal: closePropspectModal, mode: PropspectMode} = useProspectModelStore();

    return (
        <div>
            <div className="flex h-[100dvh] overflow-hidden">
                <SideBar/>
                <div className="flex flex-col flex-1 min-w-0">
                    <NavBar/>
                    <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
                        {children}
                    </div>
                </div>
            </div>
            <CompaniesModel open={isCompanyOpen} onClose={closeCompanyModal} mode={companyMode}/>
            <CustomersModel open={isCustomerOpen} onClose={closeCustomerModal} mode={customerMode}/>
            <AddMeetingModal isOpen={isMeetingOpen} onClose={closeMeetingModal} mode={MeetingMode}/>
            <DealSlideOver open={isDealOpen} onClose={closeDealModal} mode={DealMode}/>
            <TodoSlideOver open={isTaskOpen} onClose={closeTaskModal} mode={TaskMode}/>
            <ProspectSlideOver open={isProspectOpen} onClose={closePropspectModal} mode={PropspectMode}/>
        </div>
    )
}
