import { reqRef } from '@nuxtjs/composition-api'
import { useModal } from '@app/hooks/core/modal'
import CreateSubject from '@app/components/modals/create/CreateSubject.vue'
import CreateQuestion from '@app/components/modals/create/CreateQuestion.vue'
import CreateAnswer from '@app/components/modals/create/CreateAnswer.vue'
import EditSubject from '@app/components/modals/edit/EditSubject.vue'
import EditAccountProfile from '@app/components/modals/edit/EditAccountProfile.vue'
import MakePayment from '@app/components/modals/payments/MakePayment.vue'
import BuyCoins from '@app/components/modals/account/AccountBuyCoins.vue'
import TipTutor from '@app/components/modals/account/AccountTipTutor.vue'
import ReportUser from '@app/components/modals/account/AccountReportUser.vue'
import MeetTutor from '@app/components/modals/account/AccountMeetTutor.vue'
import RightSidebar from '@app/components/modals/menus/RightSidebarMenu.vue'
import AdminSidebar from '@app/components/modals/menus/AdminSidebarMenu.vue'
import Sidebar from '@app/components/modals/menus/SidebarMenu.vue'
import CreateSession from '@app/components/modals/sessions/SessionCreateSession.vue'
import Ratings from '@app/components/modals/sessions/SessionRatings.vue'

type CreateTypes = 'Subject' | 'Question' | 'Answer'
type EditTypes = 'Subject' | 'AccountProfile'
type AccountTypes = 'BuyCoins' | 'TipTutor' | 'ReportUser' | 'MeetTutor'
type MenuTypes = 'RightSidebar' | 'AdminSidebar' | 'Sidebar'
type SessionTypes = 'CreateSession' | 'Ratings'
type PaymentTypes = 'MakePayment'

const CreateModals = { Subject: CreateSubject, Question: CreateQuestion, Answer: CreateAnswer } as Record<CreateTypes, any>
const EditModals = { Subject: EditSubject, AccountProfile: EditAccountProfile } as Record<EditTypes, any>
const AccountModals = { BuyCoins, TipTutor, ReportUser, MeetTutor } as Record<AccountTypes, any>
const MenuModals = { RightSidebar, AdminSidebar, Sidebar } as Record<MenuTypes, any>
const SessionModals = { CreateSession, Ratings } as Record<SessionTypes, any>
const PaymentModals = { MakePayment } as Record<PaymentTypes, any>

export const modal = useModal(reqRef([] as string[]))
const createModal = modal.register('Create', CreateModals)
const editModal = modal.register('Edit', EditModals)
const accountModal = modal.register('Account', AccountModals)
const menuModal = modal.register('Menu', MenuModals)
const sessionModal = modal.register('Session', SessionModals)
const paymentModal = modal.register('Payment', PaymentModals)

export const useCreateModal = () => createModal
export const useEditModal = () => editModal
export const useAccountModal = () => accountModal
export const useMenuModal = () => menuModal
export const useSessionModal = () => sessionModal
export const usePaymentModal = () => paymentModal
