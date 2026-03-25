import { create } from 'zustand';

export interface Invoice {
    id: string;
    client: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
    date: string;
    dueDate: string;
}

interface Transaction {
    date: string;
    description: string;
    amount: number;
    account?: string;
    approved?: boolean;
}

interface ExtractionResults {
    listName: string;
    transactions: Transaction[];
}

interface Statement {
    id: string;
    month: string;
    size: string;
    status: string;
}

interface ClientFile {
    name: string;
    displayName: string;
    total: string;
    companies: string[];
    created: string;
}

interface Client {
    name: string;
    debits: ClientFile[];
    credits: ClientFile[];
}

export interface Expense {
    id: string;
    vendor: string;
    category: string;
    amount: string;
    date: string;
}

export interface CalendarEvent {
    id: number;
    date: number;
    title: string;
    type: 'income' | 'expense' | 'alert';
    amount: string;
    nextMonth?: boolean;
}

export interface FinancialItem {
    id: number;
    name: string;
    category: string;
    value: number;
    icon: any;
    color: string;
}

export interface AIRule {
    id: number;
    description: string;
    condition: string;
    action: string;
}

interface AccountantStore {
    activeTab: string;
    setActiveTab: (tab: string) => void;

    statements: Statement[];
    setStatements: (statements: Statement[]) => void;
    loadingStatements: boolean;
    setLoadingStatements: (loading: boolean) => void;

    clients: Client[];
    setClients: (clients: Client[]) => void;

    extractionResults: ExtractionResults | null;
    setExtractionResults: (results: ExtractionResults | null) => void;

    isExtracting: boolean;
    setIsExtracting: (is: boolean) => void;

    viewingFile: any;
    setViewingFile: (file: any) => void;

    expandedSections: Record<string, boolean>;
    toggleSection: (clientName: string, type: string) => void;

    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
    addInvoice: (invoice: Invoice) => void;
    updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
    deleteInvoice: (id: string) => void;

    expenses: Expense[];
    addExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;

    calendarEvents: CalendarEvent[];
    addCalendarEvent: (event: CalendarEvent) => void;
    deleteCalendarEvent: (id: number) => void;

    assets: FinancialItem[];
    addAsset: (asset: FinancialItem) => void;
    deleteAsset: (id: number) => void;

    liabilities: FinancialItem[];
    addLiability: (liability: FinancialItem) => void;
    deleteLiability: (id: number) => void;

    aiRules: AIRule[];
    addAIRule: (rule: AIRule) => void;
    deleteAIRule: (id: number) => void;
}

export const useAccountantStore = create<AccountantStore>((set) => ({
    activeTab: 'overview',
    setActiveTab: (tab) => set({ activeTab: tab }),

    statements: [],
    setStatements: (statements) => set({ statements }),
    loadingStatements: false,
    setLoadingStatements: (loading) => set({ loadingStatements: loading }),

    clients: [],
    setClients: (clients) => set({ clients }),

    extractionResults: null,
    setExtractionResults: (results) => set({ extractionResults: results }),

    isExtracting: false,
    setIsExtracting: (is) => set({ isExtracting: is }),

    viewingFile: null,
    setViewingFile: (file) => set({ viewingFile: file }),

    expandedSections: {},
    toggleSection: (clientName, type) => set((state) => {
        const key = `${clientName}-${type}`;
        return {
            expandedSections: {
                ...state.expandedSections,
                [key]: !state.expandedSections[key]
            }
        };
    }),

    invoices: [
        { id: 'INV-2026-001', client: 'Acme Corp', amount: 4500.00, status: 'Paid', date: 'Feb 12, 2026', dueDate: 'Feb 26, 2026' },
        { id: 'INV-2026-002', client: 'TechFlow', amount: 8200.00, status: 'Pending', date: 'Feb 18, 2026', dueDate: 'Mar 04, 2026' },
        { id: 'INV-2026-003', client: 'Global Dynamics', amount: 2100.00, status: 'Overdue', date: 'Jan 25, 2026', dueDate: 'Feb 08, 2026' },
    ],
    setInvoices: (invoices) => set({ invoices }),
    addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
    updateInvoiceStatus: (id, status) => set((state) => ({
        invoices: state.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
    })),
    deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter(inv => inv.id !== id)
    })),

    expenses: [
        { id: 'EXP-001', vendor: 'AWS Cloud Services', category: 'Infrastructure', amount: '$340.00', date: 'Feb 22, 2026' },
        { id: 'EXP-002', vendor: 'Google Workspace', category: 'Software', amount: '$54.00', date: 'Feb 20, 2026' },
        { id: 'EXP-003', vendor: 'WeWork Office', category: 'Rent', amount: '$1,200.00', date: 'Feb 01, 2026' },
    ],
    addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
    deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),

    calendarEvents: [
        { id: 1, date: 15, title: 'Q1 VAT Tax Due', type: 'alert', amount: 'N$4 250,00' },
        { id: 2, date: 18, title: 'Acme Corp Retainer', type: 'income', amount: '+N$1 500,00' },
        { id: 3, date: 22, title: 'AWS Cloud Hosting', type: 'expense', amount: '-N$340,00' },
        { id: 4, date: 28, title: 'Payroll Run', type: 'expense', amount: '-N$12 400,00' },
        { id: 5, date: 5, title: 'TechFlow Inv #004', type: 'income', amount: '+N$8 200,00', nextMonth: true }
    ],
    addCalendarEvent: (event) => set((state) => ({ calendarEvents: [...state.calendarEvents, event] })),
    deleteCalendarEvent: (id) => set((state) => ({ calendarEvents: state.calendarEvents.filter(e => e.id !== id) })),

    assets: [
        { id: 1, name: 'Main Office Building', category: 'Property', value: 450000, icon: 'Home', color: 'blue' },
        { id: 2, name: 'Company Vehicles (3)', category: 'Vehicle', value: 85000, icon: 'Car', color: 'emerald' },
        { id: 3, name: 'Business Checking', category: 'Cash', value: 124500, icon: 'Landmark', color: 'purple' },
    ],
    addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
    deleteAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),

    liabilities: [
        { id: 1, name: 'Office Mortgage', category: 'Loan', value: 280000, icon: 'Home', color: 'red' },
        { id: 2, name: 'Equipment Lease', category: 'Lease', value: 15400, icon: 'PieChart', color: 'red' },
    ],
    addLiability: (liability) => set((state) => ({ liabilities: [...state.liabilities, liability] })),
    deleteLiability: (id) => set((state) => ({ liabilities: state.liabilities.filter(l => l.id !== id) })),

    aiRules: [
        { id: 1, description: 'Uber Rides', condition: 'If Vendor contains "Uber"', action: 'Assign to "Travel & Transport"' },
        { id: 2, description: 'Software Subs', condition: 'If Description contains "Subscription"', action: 'Assign to "Software", Tax 0%' },
        { id: 3, description: 'Client Windfall', condition: 'If Amount > $10,000', action: 'Flag for "Manual Review"' },
    ],
    addAIRule: (rule) => set((state) => ({ aiRules: [rule, ...state.aiRules] })),
    deleteAIRule: (id) => set((state) => ({ aiRules: state.aiRules.filter(r => r.id !== id) })),
}));
