"use client";

import React, { useState } from 'react';
import { CreditCard, Plus, Download, Filter, MoreHorizontal, TrendingDown, X } from 'lucide-react';

import { useAccountantStore } from '@/store/useAccountantStore';

export default function ExpensesDashboard() {
    const expenses = useAccountantStore(state => state.expenses);
    const addExpense = useAccountantStore(state => state.addExpense);
    const deleteExpense = useAccountantStore(state => state.deleteExpense);

    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Form fields
    const [vendor, setVendor] = useState('');
    const [category, setCategory] = useState('Software');
    const [amount, setAmount] = useState('');

    const handleLogExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor || !amount) return;

        const newExpense = {
            id: `EXP-00${expenses.length + 1}`,
            vendor,
            category,
            amount: `$${parseFloat(amount).toFixed(2)}`,
            date: 'Feb 22, 2026'
        };

        addExpense(newExpense);
        setShowModal(false);
        setVendor('');
        setAmount('');
        setCategory('Software');
    };

    const handleDelete = (id: string) => {
        deleteExpense(id);
        setActiveDropdown(null);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Expenses</h1>
                    <p className="text-neutral-500 font-medium mt-1">Track and organize company spending.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Log Expense
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" /> Recent Transactions
                    </h2>
                    <button aria-label="Download expenses" className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-white"><Download className="w-5 h-5" /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/30">
                                <th className="p-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                                <th className="p-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Vendor</th>
                                <th className="p-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Category</th>
                                <th className="p-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Amount</th>
                                <th className="p-6 text-xs font-bold text-neutral-400 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {expenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="p-6 text-neutral-500 font-medium">{exp.date}</td>
                                    <td className="p-6 font-bold text-neutral-900">{exp.vendor}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600 text-xs font-bold">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="p-6 font-mono font-bold text-red-600 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> {exp.amount}</td>
                                    <td className="p-6 text-right relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === exp.id ? null : exp.id)}
                                            aria-label="More options"
                                            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-100"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === exp.id && (
                                            <div className="absolute right-8 top-12 w-32 bg-white border border-neutral-100 shadow-lg rounded-xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
                                                <button className="w-full text-left px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Edit</button>
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">Log New Expense</h2>
                            <button onClick={() => setShowModal(false)} aria-label="Close" className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleLogExpense} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Vendor</label>
                                <input
                                    type="text"
                                    value={vendor}
                                    onChange={(e) => setVendor(e.target.value)}
                                    placeholder="e.g., Apple Store"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    aria-label="Expense Category"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                >
                                    <option value="Software">Software</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g., 299.00"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-colors shadow-sm mt-4">
                                Save Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
