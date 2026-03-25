"use client";

import React, { useState } from 'react';
import { FileText, Plus, Download, Filter, MoreHorizontal, X, ExternalLink, Send, FileCheck, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAccountantStore, type Invoice } from '@/store/useAccountantStore';
import { cn } from '@/lib/utils';

export default function InvoicesDashboard() {
    const { invoices, addInvoice, updateInvoiceStatus, deleteInvoice } = useAccountantStore();
    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form fields
    const [client, setClient] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NA', { style: 'currency', currency: 'NAD' }).format(amount).replace('NAD', 'N$');
    };

    const handleAddInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !amount) return;

        const dateObj = new Date();
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const dueObj = dueDate ? new Date(dueDate) : new Date(dateObj.setDate(dateObj.getDate() + 14));
        const dueStr = dueObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newInvoice: Invoice = {
            id: `INV-${dateObj.getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
            client,
            amount: parseFloat(amount),
            status: 'Pending',
            date: dateStr,
            dueDate: dueStr
        };

        addInvoice(newInvoice);
        setShowModal(false);
        setClient('');
        setAmount('');
        setDueDate('');
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: Invoice['status']) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-serif text-neutral-900 tracking-tight">Receivables</h1>
                    </div>
                    <p className="text-neutral-500 font-medium">Create beautiful invoices, seamlessly track payments, and get paid faster.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-neutral-200 px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm focus:ring-2 focus:ring-neutral-200 outline-none">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 border border-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 outline-none">
                        <Plus className="w-4 h-4" /> New Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Paid</p>
                    <p className="text-3xl font-serif text-neutral-900">{formatCurrency(invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0))}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-16 h-16 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Awaiting Payment</p>
                    <p className="text-3xl font-serif text-neutral-900">{formatCurrency(invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0))}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-red-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Overdue Warning</p>
                    <p className="text-3xl font-serif text-red-700">{formatCurrency(invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0))}</p>
                </div>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50/30">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search invoices or clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:font-normal"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-neutral-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Invoice Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Dates</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-400 font-medium">No invoices found matching your criteria.</td>
                                </tr>
                            ) : filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-neutral-900">{inv.client}</span>
                                            <span className="text-sm text-neutral-500 font-medium">{inv.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                                        {formatCurrency(inv.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold border", getStatusStyle(inv.status))}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-neutral-900">Due {inv.dueDate}</span>
                                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Issued {inv.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors rounded-lg bg-white border border-transparent hover:border-emerald-100 hover:bg-emerald-50 tooltip-trigger"
                                                title="Send as Email/Link"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors rounded-lg bg-white border border-transparent hover:border-emerald-100 hover:bg-emerald-50 tooltip-trigger"
                                                title="Reconcile as Paid"
                                                onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                                            >
                                                <FileCheck className="w-4 h-4" />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === inv.id ? null : inv.id)}
                                                    className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-lg bg-white border border-transparent hover:border-neutral-200 hover:bg-neutral-50"
                                                    title="More actions"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>

                                                {activeDropdown === inv.id && (
                                                    <div className="absolute right-0 top-12 w-48 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
                                                        <div className="py-1">
                                                            <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between">
                                                                Preview PDF <ExternalLink className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                                                                Duplicate Invoice
                                                            </button>
                                                            <div className="h-px bg-neutral-100 my-1"></div>
                                                            <button
                                                                onClick={() => {
                                                                    deleteInvoice(inv.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal Drawer */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-primary-50">
                            <div>
                                <h2 className="text-2xl font-serif text-neutral-900">New Invoice</h2>
                                <p className="text-neutral-500 text-sm mt-1">Draft a new request for payment.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} title="Close modal" className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddInvoice} className="p-6 space-y-6 overflow-y-auto flex-1 bg-neutral-50/50">
                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 pb-2">Client Details</h3>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1.5">Who are you billing?</label>
                                    <input
                                        type="text"
                                        value={client}
                                        onChange={(e) => setClient(e.target.value)}
                                        placeholder="Enter client or agency name"
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-neutral-900 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 pb-2">Invoice Attributes</h3>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1.5">Total Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">N$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-neutral-900 shadow-sm font-mono placeholder:font-sans"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-1.5">Due Date (Optional)</label>
                                    <input
                                        type="date"
                                        title="Due Date"
                                        placeholder="YYYY-MM-DD"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-neutral-700 shadow-sm"
                                    />
                                    <p className="text-xs text-neutral-500 mt-2">Will default to +14 days (Net 14) if left blank.</p>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-neutral-100 bg-white">
                            <button onClick={handleAddInvoice} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-600/20 active:scale-[0.98]">
                                <FileCheck className="w-5 h-5" /> Generate Invoice Draft
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
