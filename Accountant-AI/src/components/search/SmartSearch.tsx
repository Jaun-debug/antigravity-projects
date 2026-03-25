"use client";

import React, { useState } from 'react';
import { Search as SearchIcon, Filter, ArrowRight, FileText, LayoutDashboard, Calendar, CreditCard } from 'lucide-react';

const MOCK_RESULTS = [
    { id: 1, type: 'Invoice', title: 'INV-2026-001', amount: '$450.00', date: '2026-02-18', client: 'Acme Corp', match: 'Found in OCR text: "Server maintenance Q1"' },
    { id: 2, type: 'Expense', title: 'Adobe Creative Cloud', amount: '$54.99', date: '2026-02-20', client: 'Internal', match: 'Matched category: Software Subscriptions' },
    { id: 3, type: 'Statement', title: 'Jan 2026 Bank Statement', amount: 'N/A', date: '2026-02-01', client: 'TechFlow Inc', match: 'Found in document title' },
];

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filteredResults, setFilteredResults] = useState(MOCK_RESULTS);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            const results = MOCK_RESULTS.filter(
                (r) => r.title.toLowerCase().includes(lowerQuery) ||
                    r.client.toLowerCase().includes(lowerQuery) ||
                    r.match.toLowerCase().includes(lowerQuery)
            );
            setFilteredResults(results);
            setIsSearching(false);
        }, 600);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Invoice': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'Expense': return <CreditCard className="w-5 h-5 text-red-500" />;
            case 'Statement': return <LayoutDashboard className="w-5 h-5 text-emerald-500" />;
            default: return <FileText className="w-5 h-5 text-neutral-500" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Smart Search</h1>
                    <p className="text-neutral-500 font-medium mt-1">Search through millions of transactions, invoices, and OCR data instantly.</p>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-3xl">
                <div className="relative flex items-center">
                    <SearchIcon className="absolute left-4 w-6 h-6 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for an amount, client name, or text within a receipt..."
                        className="w-full pl-14 pr-32 py-4 rounded-2xl border-2 border-neutral-100 bg-white focus:border-emerald-500 focus:ring-0 text-lg transition-colors shadow-sm"
                    />
                    <div className="absolute right-3 flex items-center gap-2">
                        <button type="button" aria-label="Filters" className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm">
                            Search
                        </button>
                    </div>
                </div>
            </form>

            {/* Search Filters */}
            <div className="flex flex-wrap gap-2">
                {['All', 'Invoices', 'Expenses', 'Statements', 'Clients', 'OCR Text'].map((filter) => (
                    <button key={filter} className="px-4 py-2 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
                        {filter}
                    </button>
                ))}
            </div>

            {/* Results Area */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        {isSearching ? 'Searching...' : query ? `Results for "${query}"` : 'Recent Activity'}
                    </h3>
                </div>

                <div className="divide-y divide-neutral-100">
                    {filteredResults.length === 0 ? (
                        <div className="p-12 text-center text-neutral-500">No results found for "{query}".</div>
                    ) : filteredResults.map((result) => (
                        <div key={result.id} className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer group flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl border border-neutral-100 shadow-sm group-hover:scale-110 transition-transform">
                                {getIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-lg font-bold text-neutral-900 truncate">{result.title}</h4>
                                    <span className="font-mono font-medium text-neutral-900">{result.amount}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-neutral-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {result.date}</span>
                                    <span>•</span>
                                    <span>{result.client}</span>
                                    <span>•</span>
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium">{result.type}</span>
                                </div>
                                <p className="mt-2 text-sm text-neutral-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                                    {result.match}
                                </p>
                            </div>
                            <div className="self-center pl-4">
                                <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>

                {!isSearching && !query && (
                    <div className="p-6 bg-neutral-50 text-center border-t border-neutral-100">
                        <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors">
                            View Search History
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
