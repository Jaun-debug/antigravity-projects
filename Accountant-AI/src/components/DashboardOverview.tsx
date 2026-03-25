"use client";

import React, { useMemo } from 'react';
import {
    TrendingUp,
    MoreHorizontal,
    ArrowRight,
    Plus,
    Building2,
    PieChart,
    Wallet
} from 'lucide-react';
import { useAccountantStore } from '@/store/useAccountantStore';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardOverview() {
    const { clients, invoices } = useAccountantStore();

    const formatAmount = (num: number) => {
        const isNegative = num < 0;
        const parts = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).split('.');
        return (isNegative ? '-' : '') + parts[0].replace(/,/g, ' ') + ',' + parts[1];
    };

    const dashboardStats = useMemo(() => {
        let globalRevenue = 0;
        let globalExpenses = 0;

        clients.forEach(c => {
            c.credits?.forEach(f => {
                globalRevenue += parseFloat(f.total.toString().replace(/[^0-9.-]/g, '') || "0");
            });
            c.debits?.forEach(f => {
                globalExpenses += parseFloat(f.total.toString().replace(/[^0-9.-]/g, '') || "0");
            });
        });

        const globalBalance = globalRevenue - globalExpenses;

        return {
            globalBalance,
            globalRevenue,
            globalExpenses
        };
    }, [clients]);

    // Mock chart data representing 6 months of cash flow
    const cashFlowData = [
        { month: 'Sep', in: dashboardStats.globalRevenue * 0.1, out: dashboardStats.globalExpenses * 0.12 },
        { month: 'Oct', in: dashboardStats.globalRevenue * 0.15, out: dashboardStats.globalExpenses * 0.18 },
        { month: 'Nov', in: dashboardStats.globalRevenue * 0.12, out: dashboardStats.globalExpenses * 0.14 },
        { month: 'Dec', in: dashboardStats.globalRevenue * 0.22, out: dashboardStats.globalExpenses * 0.19 },
        { month: 'Jan', in: dashboardStats.globalRevenue * 0.18, out: dashboardStats.globalExpenses * 0.16 },
        { month: 'Feb', in: dashboardStats.globalRevenue * 0.23, out: dashboardStats.globalExpenses * 0.21 },
    ];

    // Calculate Invoices Summary
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue');
    const invoiceTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-serif text-neutral-900 tracking-tight">Acme Corporation</h1>
                    <p className="text-neutral-500 font-medium mt-1 tracking-wide">Financial Overview Dashboard</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-neutral-200 px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm focus:ring-2 focus:ring-neutral-200 outline-none">
                        Edit Dashboard
                    </button>
                    <button className="flex items-center gap-2 bg-emerald-600 border border-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 outline-none">
                        <Plus className="w-4 h-4" /> New Transaction
                    </button>
                </div>
            </div>

            {/* Dashboard Grid - Xero Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bank Accounts Widget */}
                <div className="bg-white rounded-[1.5rem] border border-neutral-200 shadow-sm overflow-hidden flex flex-col group hover:border-emerald-200 transition-colors">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-600" /> Bank Accounts
                        </h2>
                        <button title="Options" className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-neutral-700 text-lg">Business Checking ...4922</p>
                            <p className="text-2xl font-serif font-black text-neutral-900">N${formatAmount(dashboardStats.globalBalance)}</p>
                        </div>
                        <p className="text-sm text-neutral-500 font-medium mb-6">Statement balance as of Today</p>

                        <div className="space-y-3">
                            <button className="w-full py-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl font-bold text-sm text-neutral-700 transition-colors">
                                Reconcile 12 Items
                            </button>
                        </div>
                    </div>
                </div>

                {/* Total Cash In and Out Widget */}
                <div className="bg-white rounded-[1.5rem] border border-neutral-200 shadow-sm overflow-hidden flex flex-col group hover:border-blue-200 transition-colors">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" /> Total Cash In and Out
                        </h2>
                        <button title="Options" className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashFlowData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                    <XAxis dataKey="month" axisLine={true} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 600 }} dy={10} />
                                    <YAxis tickFormatter={(val) => `N$${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: '#f5f5f5' }}
                                        formatter={(val: any) => [`N$ ${formatAmount(val)}`, '']}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} name="In" />
                                    <Bar dataKey="out" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Out" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Invoices Owed to You */}
                <div className="bg-white rounded-[1.5rem] border border-neutral-200 shadow-sm overflow-hidden flex flex-col group hover:border-amber-200 transition-colors">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-600" /> Invoices Owed to You
                        </h2>
                        <button title="Options" className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                            <div>
                                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Awaiting Payment</p>
                                <p className="text-3xl font-serif text-neutral-900">N${formatAmount(invoiceTotal)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-1">Overdue</p>
                                <p className="text-xl font-serif text-red-600">N${formatAmount(invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0))}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 pt-2">
                            {pendingInvoices.slice(0, 3).map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer group/row">
                                    <div>
                                        <p className="font-bold text-neutral-900">{inv.client}</p>
                                        <p className="text-xs text-neutral-500 font-medium">Due {inv.dueDate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-mono font-bold text-neutral-700">N${formatAmount(inv.amount)}</p>
                                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover/row:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                            {pendingInvoices.length === 0 && (
                                <div className="text-center py-6 text-sm font-medium text-neutral-400">
                                    No outstanding invoices. Good job!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Watchlist */}
                <div className="bg-white rounded-[1.5rem] border border-neutral-200 shadow-sm overflow-hidden flex flex-col group hover:border-purple-200 transition-colors">
                    <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" /> Account Watchlist
                        </h2>
                        <button title="Options" className="text-neutral-400 hover:text-neutral-900"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    <div className="p-0 flex-1 flex flex-col overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="py-3 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Account</th>
                                    <th className="py-3 px-6 text-xs text-right font-bold text-neutral-400 uppercase tracking-widest">This Month</th>
                                    <th className="py-3 px-6 text-xs text-right font-bold text-neutral-400 uppercase tracking-widest">YTD</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                <tr className="hover:bg-neutral-50 cursor-pointer transition-colors">
                                    <td className="py-4 px-6 font-bold text-emerald-700">Sales</td>
                                    <td className="py-4 px-6 font-mono text-right font-medium text-neutral-700">N${formatAmount((dashboardStats.globalRevenue / 6) * 1.2)}</td>
                                    <td className="py-4 px-6 font-mono text-right font-bold text-neutral-900">N${formatAmount(dashboardStats.globalRevenue)}</td>
                                </tr>
                                <tr className="hover:bg-neutral-50 cursor-pointer transition-colors">
                                    <td className="py-4 px-6 font-bold text-neutral-700">Checking</td>
                                    <td className="py-4 px-6 font-mono text-right font-medium text-neutral-700">N${formatAmount(24500)}</td>
                                    <td className="py-4 px-6 font-mono text-right font-bold text-neutral-900">N${formatAmount(dashboardStats.globalBalance)}</td>
                                </tr>
                                <tr className="hover:bg-neutral-50 cursor-pointer transition-colors">
                                    <td className="py-4 px-6 font-bold text-red-700">General Expenses</td>
                                    <td className="py-4 px-6 font-mono text-right font-medium text-neutral-700">N${formatAmount((dashboardStats.globalExpenses / 6) * 0.9)}</td>
                                    <td className="py-4 px-6 font-mono text-right font-bold text-neutral-900">N${formatAmount(dashboardStats.globalExpenses)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
