"use client";

import React, { useState, useMemo } from 'react';
import { Wallet, Home, Car, Landmark, ArrowUpRight, ArrowDownRight, Plus, PieChart, X } from 'lucide-react';

type ItemType = 'Asset' | 'Liability';

import { useAccountantStore, FinancialItem } from '@/store/useAccountantStore';

const getIconForComponent = (iconName: string) => {
    switch (iconName) {
        case 'Home': return Home;
        case 'Car': return Car;
        case 'Landmark': return Landmark;
        case 'PieChart': return PieChart;
        default: return PieChart;
    }
};

export default function NetWorthDashboard() {
    const assets = useAccountantStore(state => state.assets);
    const addAsset = useAccountantStore(state => state.addAsset);

    const liabilities = useAccountantStore(state => state.liabilities);
    const addLiability = useAccountantStore(state => state.addLiability);

    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newItemType, setNewItemType] = useState<ItemType>('Asset');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');
    const [newItemValue, setNewItemValue] = useState('');

    const totalAssets = useMemo(() => assets.reduce((sum, item) => sum + item.value, 0), [assets]);
    const totalLiabilities = useMemo(() => liabilities.reduce((sum, item) => sum + item.value, 0), [liabilities]);
    const netWorth = totalAssets - totalLiabilities;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseInt(newItemValue.replace(/[^0-9]/g, ''), 10);
        if (!newItemName || isNaN(value)) return;

        const newItem: FinancialItem = {
            id: Date.now(),
            name: newItemName,
            category: newItemCategory || 'Other',
            value: value,
            icon: newItemType === 'Asset' ? Landmark : PieChart,
            color: newItemType === 'Asset' ? 'blue' : 'red'
        };

        if (newItemType === 'Asset') {
            addAsset(newItem);
        } else {
            addLiability(newItem);
        }

        setShowModal(false);
        setNewItemName('');
        setNewItemCategory('');
        setNewItemValue('');
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Net Worth Tracker</h1>
                    <p className="text-neutral-500 font-medium mt-1">A complete picture of your assets, liabilities, and true business value.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm w-fit"
                >
                    <Plus className="w-5 h-5" /> Add Asset/Liability
                </button>
            </div>

            {/* Total Net Worth Hero Card */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-400" /> Total Net Worth
                        </p>
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tight">{formatCurrency(netWorth)}</h2>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-500/30">
                                <ArrowUpRight className="w-4 h-4" /> Updating dynamically
                            </span>
                            <span className="text-sm font-medium text-neutral-400">Live Calculation</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assets Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            Total Assets
                        </h3>
                        <span className="text-2xl font-black text-emerald-600">{formatCurrency(totalAssets)}</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-neutral-100">
                            {assets.length === 0 ? (
                                <div className="p-8 text-center text-neutral-400">No assets recorded.</div>
                            ) : assets.map((asset) => (
                                <div key={asset.id} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${asset.color}-50 text-${asset.color}-600`}>
                                            {React.createElement(getIconForComponent(asset.icon), { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{asset.name}</h4>
                                            <p className="text-sm text-neutral-500 font-medium">{asset.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg text-neutral-900">{formatCurrency(asset.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Liabilities Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                            Total Liabilities
                        </h3>
                        <span className="text-2xl font-black text-red-600">{formatCurrency(totalLiabilities)}</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-neutral-100">
                            {liabilities.length === 0 ? (
                                <div className="p-8 text-center text-neutral-400">No liabilities recorded.</div>
                            ) : liabilities.map((liability) => (
                                <div key={liability.id} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${liability.color}-50 text-${liability.color}-600`}>
                                            {React.createElement(getIconForComponent(liability.icon), { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900">{liability.name}</h4>
                                            <p className="text-sm text-neutral-500 font-medium">{liability.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg text-neutral-900">{formatCurrency(liability.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">Add Item</h2>
                            <button onClick={() => setShowModal(false)} aria-label="Close" className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Item Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewItemType('Asset')}
                                        className={`py-3 rounded-xl text-sm font-bold transition-colors border-2 ${newItemType === 'Asset' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                                    >
                                        Asset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewItemType('Liability')}
                                        className={`py-3 rounded-xl text-sm font-bold transition-colors border-2 ${newItemType === 'Liability' ? 'border-red-600 bg-red-50 text-red-700' : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                                    >
                                        Liability
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder={newItemType === 'Asset' ? "e.g., Savings Account" : "e.g., Credit Card Debt"}
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={newItemCategory}
                                    onChange={(e) => setNewItemCategory(e.target.value)}
                                    placeholder={newItemType === 'Asset' ? "e.g., Cash, Property" : "e.g., Loan, Credit"}
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Value ($)</label>
                                <input
                                    type="number"
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    placeholder="0"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-colors shadow-sm mt-4">
                                Save {newItemType}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
