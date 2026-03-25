"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, TrendingUp, AlertCircle, Plus, X } from 'lucide-react';

type EventType = 'income' | 'expense' | 'alert';

import { useAccountantStore, CalendarEvent } from '@/store/useAccountantStore';

export default function FinancialCalendar() {
    const events = useAccountantStore(state => state.calendarEvents);
    const addCalendarEvent = useAccountantStore(state => state.addCalendarEvent);
    const deleteCalendarEvent = useAccountantStore(state => state.deleteCalendarEvent);

    const [showModal, setShowModal] = useState(false);

    // Calendar Navigation State
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Starts at Feb 2026

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToday = () => setCurrentDate(new Date());

    // Form State
    const [newEventDate, setNewEventDate] = useState<number>(1);
    const [newEventType, setNewEventType] = useState<EventType>('expense');
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventAmount, setNewEventAmount] = useState('');

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle || !newEventAmount) return;

        const val = parseFloat(newEventAmount.replace(/[^0-9.-]/g, ''));
        const numToFormat = isNaN(val) ? 0 : val;
        const parts = Math.abs(numToFormat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).split('.');
        const amtStr = parts[0].replace(/,/g, ' ') + ',' + parts[1];

        const newEvent: CalendarEvent = {
            id: Date.now(),
            date: newEventDate,
            title: newEventTitle,
            type: newEventType,
            amount: newEventType === 'income' ? `+N$${amtStr}` : (newEventType === 'alert' ? `N$${amtStr}` : `-N$${amtStr}`)
        };

        addCalendarEvent(newEvent);
        setShowModal(false);
        setNewEventTitle('');
        setNewEventAmount('');
        setNewEventDate(1);
    };

    const renderDays = () => {
        const days = [];
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

        // Helper to get event for a day
        const getEvent = (day: number) => {
            const isTargetMonth = currentDate.getMonth() === 1 && currentDate.getFullYear() === 2026; // match Initial events to Feb 2026
            const isNextMonth = currentDate.getMonth() === 2 && currentDate.getFullYear() === 2026; // match nextMonth events to Mar 2026

            return events.find(e =>
                e.date === day &&
                ((e.nextMonth && isNextMonth) || (!e.nextMonth && isTargetMonth))
            );
        };

        // Mock empty days for start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 p-3 border-r border-b border-neutral-100 bg-neutral-50/50" />);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const event = getEvent(i);
            const isToday = i === 18 && currentDate.getMonth() === 1 && currentDate.getFullYear() === 2026;

            days.push(
                <div key={i} className={`h-32 p-3 border-r border-b border-neutral-100 hover:bg-neutral-50 transition-colors group relative ${isToday ? 'bg-emerald-50/30' : 'bg-white'}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${isToday ? 'bg-emerald-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-neutral-500'}`}>
                            {i}
                        </span>
                        <button
                            onClick={() => {
                                setNewEventDate(i);
                                setShowModal(true);
                            }}
                            aria-label={`Add event to day ${i}`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-emerald-600 transition-all rounded hover:bg-neutral-100"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {event && (
                        <div className={`mt-2 p-2 rounded-lg text-xs font-medium border relative group/event
                            ${event.type === 'alert' ? 'bg-red-50 text-red-700 border-red-100' :
                                event.type === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    'bg-neutral-100 text-neutral-700 border-neutral-200'}`}
                        >
                            <div className="truncate mb-1">{event.title}</div>
                            <div className="font-bold flex items-center justify-between">
                                <span>{event.amount}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCalendarEvent(event.id);
                                    }}
                                    className="opacity-0 group-hover/event:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                                    title="Delete Event"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Financial Calendar</h1>
                    <p className="text-neutral-500 font-medium mt-1">Forecast cash flow and plan for upcoming expenses and tax deadlines.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter Events
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Event
                    </button>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Expected Income (Feb)</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">+N$18 500,00</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Planned Expenses</p>
                        <p className="text-3xl font-black text-neutral-900 mt-1">-N$8 240,00</p>
                    </div>
                    <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-600">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Upcoming Deadlines</p>
                        <p className="text-3xl font-black text-red-600 mt-1">2 Alerts</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Calendar UI */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-emerald-600" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} aria-label="Previous Month" className="p-2 border border-neutral-200 rounded-lg hover:bg-white bg-transparent transition-colors text-neutral-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToday} className="px-4 py-2 font-medium border border-neutral-200 rounded-lg hover:bg-white bg-transparent transition-colors text-neutral-700">
                            Today
                        </button>
                        <button onClick={nextMonth} aria-label="Next Month" className="p-2 border border-neutral-200 rounded-lg hover:bg-white bg-transparent transition-colors text-neutral-500">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-neutral-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-bold text-neutral-400 uppercase tracking-widest border-r border-neutral-100 last:border-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 bg-neutral-100 gap-[1px]">
                    {renderDays()}
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900">Add Event ({currentDate.toLocaleString('default', { month: 'short' })} {newEventDate})</h2>
                            <button onClick={() => setShowModal(false)} aria-label="Close" className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddEvent} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Event Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewEventType('income')}
                                        className={`py-3 rounded-xl text-sm font-bold transition-colors border-2 ${newEventType === 'income' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewEventType('expense')}
                                        className={`py-3 rounded-xl text-sm font-bold transition-colors border-2 ${newEventType === 'expense' ? 'border-red-600 bg-red-50 text-red-700' : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewEventType('alert')}
                                        className={`py-3 rounded-xl text-sm font-bold transition-colors border-2 ${newEventType === 'alert' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-neutral-100 bg-white text-neutral-500 hover:border-neutral-200'}`}
                                    >
                                        Alert
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    placeholder="e.g., Q1 VAT Tax Due"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={newEventAmount}
                                    onChange={(e) => setNewEventAmount(e.target.value)}
                                    placeholder="e.g., 4250.00"
                                    className="w-full p-4 bg-neutral-50 border-2 border-neutral-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-colors shadow-sm mt-4">
                                Save Event
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
