"use client";

import React, { useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Download,
    History,
    Search,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useAccountantStore } from '@/store/useAccountantStore';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StatementManager() {
    const {
        statements,
        setStatements,
        loadingStatements,
        setLoadingStatements
    } = useAccountantStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchStatements();
    }, []);

    const fetchStatements = async () => {
        setLoadingStatements(true);
        try {
            const data = await api.fetchStatements();
            setStatements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatements(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await api.uploadStatement(file);
            fetchStatements();
        } catch (error) {
            alert("Upload failed");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
        try {
            await api.deleteStatement(filename);
            setStatements(statements.filter(s => s.id !== filename));
        } catch (error) {
            alert("Delete failed");
        }
    };

    const handleDownload = (filename: string) => {
        window.open(`/api/statements/${filename}`, '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight flex items-center gap-4">
                        <History className="w-10 h-10 text-emerald-600" />
                        Statement Center
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">Manage and archive your consolidated financial statements.</p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Statement
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input
                            type="text"
                            placeholder="Search statements..."
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 rounded-2xl border-transparent focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="divide-y divide-neutral-100">
                    {loadingStatements ? (
                        <div className="p-20 text-center text-neutral-400">
                            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="font-bold uppercase tracking-widest text-xs">Fetching repository...</p>
                        </div>
                    ) : statements.length === 0 ? (
                        <div className="p-20 text-center text-neutral-400">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-xs">No statements found</p>
                        </div>
                    ) : (
                        statements.map((item) => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-neutral-100">
                                        <FileText className="w-7 h-7 text-neutral-400 group-hover:text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors">{item.month}</h4>
                                        <p className="text-xs text-neutral-500 font-medium uppercase tracking-tight">Financial Record • {item.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex flex-col items-end mr-8">
                                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Status</span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            Ready
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => handleDownload(item.id)}
                                            className="p-3 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
