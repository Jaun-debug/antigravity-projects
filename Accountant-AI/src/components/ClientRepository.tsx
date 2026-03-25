"use client";

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Folder,
    Trash2,
    ChevronRight,
    Receipt,
    X,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { useAccountantStore } from '@/store/useAccountantStore';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ClientRepository() {
    const {
        clients,
        setClients,
        expandedSections,
        toggleSection,
        viewingFile,
        setViewingFile
    } = useAccountantStore();

    const fetchClients = useCallback(async () => {
        try {
            const data = await api.fetchClients();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    }, [setClients]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleDeleteClient = async (name: string) => {
        if (!confirm(`Permanently delete all data for ${name}?`)) return;
        try {
            await api.deleteClient(name);
            setClients(clients.filter(c => c.name !== name));
        } catch (error) {
            console.error("Delete client error", error);
            alert("Failed to delete client.");
        }
    };

    const handleDeleteFile = async (e: React.MouseEvent, clientName: string, type: string, filename: string) => {
        e.stopPropagation();
        if (!confirm(`Permanently delete ${filename}?`)) return;
        try {
            await api.deleteFile(clientName, type, filename);
            fetchClients();
        } catch (error) {
            console.error("Delete file error", error);
            alert("Failed to delete file.");
        }
    };

    const handleFileClick = async (clientName: string, type: string, filename: string) => {
        try {
            const data = await api.readCSV(clientName, type, filename);
            setViewingFile({ client: clientName, type, filename, data });
        } catch (error) {
            console.error("Read file error", error);
            alert("Failed to read file.");
        }
    };

    const formatAmount = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount;
        if (isNaN(num)) return "0,00";
        const isNegative = num < 0;
        const parts = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).split('.');
        return (isNegative ? '-' : '') + parts[0].replace(/,/g, ' ') + ',' + parts[1];
    };

    if (clients.length === 0) {
        return (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <Folder className="w-10 h-10 text-neutral-200" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No client folders found</h3>
                <p className="text-neutral-500 max-w-sm mb-8">Start by using the AI Extraction tool to process statements and save them to client folders.</p>
                <Link href="/extraction" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50">
                    Create First Entry
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
                const debitsKey = `${client.name}-debits`;
                const creditsKey = `${client.name}-credits`;
                const isDebitsOpen = expandedSections[debitsKey];
                const isCreditsOpen = expandedSections[creditsKey];

                return (
                    <div key={client.name} className="bg-white border border-neutral-100 p-6 rounded-3xl hover:shadow-xl hover:shadow-neutral-200/40 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                    <Folder className="w-6 h-6 text-neutral-400 group-hover:text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900">{client.name}</h4>
                                    <p className="text-xs text-neutral-500 font-medium">{(client.debits?.length || 0) + (client.credits?.length || 0)} Documents</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteClient(client.name)}
                                aria-label={`Delete ${client.name}`}
                                title={`Delete ${client.name}`}
                                className="p-2 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Debits */}
                            <div className="rounded-2xl border border-neutral-50 overflow-hidden">
                                <div
                                    onClick={() => toggleSection(client.name, 'debits')}
                                    className="flex items-center gap-3 p-4 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors"
                                >
                                    <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", isDebitsOpen && "rotate-90")} />
                                    <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                                        <ArrowDownLeft className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Expenses</span>
                                    <span className="ml-auto text-xs font-bold text-neutral-400">{client.debits?.length || 0}</span>
                                </div>

                                {isDebitsOpen && (
                                    <div className="p-2 space-y-1 bg-white border-t border-neutral-50 max-h-64 overflow-y-auto">
                                        {client.debits?.map((file) => (
                                            <div
                                                key={file.name}
                                                onClick={() => handleFileClick(client.name, 'Debits', file.name)}
                                                className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl cursor-pointer group/item transition-all"
                                            >
                                                <div className="flex flex-col min-w-0 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                                                        <span className="text-sm font-semibold text-neutral-700 truncate">{file.displayName}</span>
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400 ml-6 truncate font-medium uppercase tracking-tight">{file.companies.join(', ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-red-600 tabular-nums whitespace-nowrap">
                                                        {formatAmount(file.total).startsWith('-') ? formatAmount(file.total) : `-${formatAmount(file.total)}`}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteFile(e, client.name, 'Debits', file.name)}
                                                        aria-label={`Delete ${file.name}`}
                                                        title={`Delete ${file.name}`}
                                                        className="p-1.5 hover:bg-red-50 text-neutral-200 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Credits */}
                            <div className="rounded-2xl border border-neutral-50 overflow-hidden">
                                <div
                                    onClick={() => toggleSection(client.name, 'credits')}
                                    className="flex items-center gap-3 p-4 bg-neutral-50/50 cursor-pointer hover:bg-neutral-50 transition-colors"
                                >
                                    <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", isCreditsOpen && "rotate-90")} />
                                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                        <ArrowUpRight className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Income</span>
                                    <span className="ml-auto text-xs font-bold text-neutral-400">{client.credits?.length || 0}</span>
                                </div>

                                {isCreditsOpen && (
                                    <div className="p-2 space-y-1 bg-white border-t border-neutral-50 max-h-64 overflow-y-auto">
                                        {client.credits?.map((file) => (
                                            <div
                                                key={file.name}
                                                onClick={() => handleFileClick(client.name, 'Credits', file.name)}
                                                className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl cursor-pointer group/item transition-all"
                                            >
                                                <div className="flex flex-col min-w-0 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                                                        <span className="text-sm font-semibold text-neutral-700 truncate">{file.displayName}</span>
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400 ml-6 truncate font-medium uppercase tracking-tight">{file.companies.join(', ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                                                        {formatAmount(file.total).startsWith('-') ? formatAmount(file.total).replace('-', '+') : `+${formatAmount(file.total)}`}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteFile(e, client.name, 'Credits', file.name)}
                                                        aria-label={`Delete ${file.name}`}
                                                        title={`Delete ${file.name}`}
                                                        className="p-1.5 hover:bg-red-50 text-neutral-200 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {viewingFile && (
                <div className="fixed inset-0 z-[100] bg-neutral-900/60 flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-neutral-50 rounded-2xl">
                                    <Receipt className="w-6 h-6 text-neutral-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900">{viewingFile.displayName || viewingFile.filename}</h3>
                                    <p className="text-sm text-neutral-500 font-medium uppercase tracking-widest">{viewingFile.client} • {viewingFile.type}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingFile(null)}
                                aria-label="Close"
                                title="Close"
                                className="p-3 hover:bg-neutral-100 rounded-2xl transition-all"
                            >
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-8 bg-neutral-50/30">
                            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-100">
                                            {viewingFile.data.headers.map((h: string, i: number) => (
                                                <th key={i} className="px-6 py-4 font-bold text-neutral-600 uppercase text-[10px] tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {viewingFile.data.rows.map((row: string[], i: number) => (
                                            <tr
                                                key={i}
                                                className={cn(
                                                    "transition-colors",
                                                    row.includes("TOTAL") ? "bg-emerald-50/50 font-bold text-emerald-900" : "hover:bg-neutral-50/50"
                                                )}
                                            >
                                                {row.map((cell: string, c: number) => {
                                                    const header = viewingFile.data.headers[c]?.toUpperCase() || '';
                                                    const isAmountCol = header.includes('AMOUNT');
                                                    let displayValue = cell?.replace(/"/g, '');
                                                    if (isAmountCol && displayValue) {
                                                        const stripped = displayValue.replace(/[^0-9.-]/g, '');
                                                        if (stripped && !isNaN(parseFloat(stripped))) {
                                                            displayValue = formatAmount(stripped);
                                                        }
                                                    }
                                                    return (
                                                        <td key={c} className="px-6 py-4 tabular-nums text-neutral-700 whitespace-nowrap">{displayValue}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
