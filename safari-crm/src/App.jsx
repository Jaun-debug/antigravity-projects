import React, { useState, useMemo } from 'react';
import { differenceInDays, addDays, subDays, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  ChevronRight,
  MoreVertical,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Plane,
  FileText
} from 'lucide-react';

// STAGES for the pipeline
const PIPELINE_STAGES = [
  'Enquiry',
  'Quote Sent',
  'Provisional',
  'Confirmed',
  'Traveling',
  'Completed'
];

// Helper to calculate days
const getTripLength = (start, end) => {
  if (!start || !end) return 0;
  return differenceInDays(parseISO(end), parseISO(start));
};

const getPaymentStatusColor = (status, date) => {
  if (status === 'Paid') return 'text-emerald-700 bg-emerald-100 border-emerald-200';
  if (!date) return 'text-gray-600 bg-gray-100 border-gray-200';
  const dueDate = parseISO(date);
  const now = new Date();
  if (isBefore(dueDate, now) && status !== 'Paid') return 'text-red-700 bg-red-100 border-red-200';
  if (isBefore(subDays(dueDate, 7), now)) return 'text-amber-700 bg-amber-100 border-amber-200';
  return 'text-blue-700 bg-blue-100 border-blue-200';
};

// Mock Data
const initialBookings = [
  {
    id: 'BK-001',
    stage: 'Confirmed',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@example.com',
    clientPhone: '+44 7712 345678',
    country: 'UK',
    travellers: 2,
    arrivalDate: addDays(new Date(), 15).toISOString().split('T')[0],
    departureDate: addDays(new Date(), 25).toISOString().split('T')[0],
    notes: 'Honeymoon couple. Requesting romantic private dinners.',
    itineraryLink: 'https://example.com/itinerary/bk001',
    sellingPrice: 12500,
    costPrice: 9800,
    depositAmount: 3750,
    depositInvoiceDate: subDays(new Date(), 30).toISOString().split('T')[0],
    depositPaidDate: subDays(new Date(), 28).toISOString().split('T')[0],
    depositStatus: 'Paid',
    finalPaymentDate: subDays(new Date(), 10).toISOString().split('T')[0],
    finalPaymentStatus: 'Pending',
    suppliers: [
      { id: 'S1', name: 'Desert Rhino Camp', type: 'Lodge', cost: 4500, status: 'Pending' },
      { id: 'S2', name: 'Wilderness Flights', type: 'Flight', cost: 1200, status: 'Paid' }
    ],
    activities: [
      { id: 'A1', name: 'Hot Air Balloon Safari', supplier: 'Namib Sky', cost: 800, selling: 1100, status: 'Pending' }
    ]
  },
  {
    id: 'BK-002',
    stage: 'Quote Sent',
    clientName: 'Michael Schmidt',
    clientEmail: 'm.schmidt@example.de',
    clientPhone: '+49 151 23456789',
    country: 'Germany',
    travellers: 4,
    arrivalDate: addDays(new Date(), 60).toISOString().split('T')[0],
    departureDate: addDays(new Date(), 74).toISOString().split('T')[0],
    notes: 'Family with 2 teenagers. Interested in Etosha and skeleton coast.',
    itineraryLink: 'https://example.com/itinerary/bk002',
    sellingPrice: 24000,
    costPrice: 18500,
    depositAmount: 7200,
    depositInvoiceDate: subDays(new Date(), 2).toISOString().split('T')[0],
    depositPaidDate: null,
    depositStatus: 'Pending',
    finalPaymentDate: null,
    finalPaymentStatus: 'Pending',
    suppliers: [
      { id: 'S3', name: 'Ongava Lodge', type: 'Lodge', cost: 6000, status: 'Pending' }
    ],
    activities: [
      { id: 'A2', name: 'Guided Etosha Drive', supplier: 'Ongava', cost: 400, selling: 600, status: 'Pending' }
    ]
  },
  {
    id: 'BK-003',
    stage: 'Enquiry',
    clientName: 'James Wilson',
    clientEmail: 'j.wilson@email.com',
    clientPhone: '+1 555 123 4567',
    country: 'USA',
    travellers: 2,
    arrivalDate: addDays(new Date(), 120).toISOString().split('T')[0],
    departureDate: addDays(new Date(), 130).toISOString().split('T')[0],
    notes: 'Looking for luxury lodges, first-time safari.',
    itineraryLink: '',
    sellingPrice: 0,
    costPrice: 0,
    depositAmount: 0,
    depositInvoiceDate: null,
    depositPaidDate: null,
    depositStatus: 'Pending',
    finalPaymentDate: null,
    finalPaymentStatus: 'Pending',
    suppliers: [],
    activities: []
  }
];

export default function App() {
  const [bookings, setBookings] = useState(initialBookings);
  const [view, setView] = useState('pipeline'); // 'pipeline', 'dashboard', 'calendar'
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Derived state
  const upcomingArrivals = useMemo(() => 
    bookings.filter(b => isAfter(parseISO(b.arrivalDate), subDays(new Date(), 1)) && isBefore(parseISO(b.arrivalDate), addDays(new Date(), 30)))
  , [bookings]);

  const awaitingDeposit = useMemo(() => 
    bookings.filter(b => b.depositStatus === 'Pending' && b.stage !== 'Enquiry')
  , [bookings]);

  const awaitingFinalPayment = useMemo(() => 
    bookings.filter(b => {
       const dueDate = subDays(parseISO(b.arrivalDate), 50);
       return b.depositStatus === 'Paid' && b.finalPaymentStatus === 'Pending' && isBefore(dueDate, addDays(new Date(), 30));
    })
  , [bookings]);

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-sand-900 min-h-screen p-6 text-sand-50 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-sand-500 flex items-center justify-center text-white font-bold">DT</div>
        <h1 className="text-xl font-bold tracking-wider">SAFARI CRM</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => { setView('dashboard'); setSelectedBooking(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-sand-800 text-white font-medium' : 'text-sand-300 hover:bg-sand-800/50 hover:text-white'}`}
        >
          <div className="w-5"><Search size={20} /></div>
          Dashboard
        </button>
        <button 
          onClick={() => { setView('pipeline'); setSelectedBooking(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'pipeline' ? 'bg-sand-800 text-white font-medium' : 'text-sand-300 hover:bg-sand-800/50 hover:text-white'}`}
        >
          <div className="w-5"><Filter size={20} /></div>
          Pipeline
        </button>
        <button 
          onClick={() => { setView('calendar'); setSelectedBooking(null); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'calendar' ? 'bg-sand-800 text-white font-medium' : 'text-sand-300 hover:bg-sand-800/50 hover:text-white'}`}
        >
          <div className="w-5"><Calendar size={20} /></div>
          Calendar
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-sand-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sand-800 border-2 border-sand-600 flex items-center justify-center font-medium">AG</div>
          <div>
            <div className="font-medium">Agent Desktop</div>
            <div className="text-xs text-sand-400">Namibia Travel</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Booking Card in Pipeline
  const BookingCard = ({ booking }) => {
    return (
      <div 
        onClick={() => setSelectedBooking(booking)}
        className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 cursor-pointer hover:border-sand-400 hover:shadow-md transition-all active:scale-[0.98]"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sand-900">{booking.clientName}</h4>
          <span className="text-xs font-medium text-sand-500 px-2 py-1 bg-sand-50 rounded-md border border-sand-100">{booking.id}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-sand-600 mb-3">
          <Plane size={12} className="text-sand-400" />
          <span>{booking.arrivalDate}</span>
          <span className="text-sand-300 px-1">•</span>
          <span>{booking.travellers} Pax</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-sand-100">
          {(booking.sellingPrice > 0) && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              ${booking.sellingPrice.toLocaleString()}
            </div>
          )}
          {booking.depositStatus === 'Pending' && booking.stage !== 'Enquiry' && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Deposit Due
            </div>
          )}
        </div>
      </div>
    );
  };

  const PipelineView = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-sand-900">Booking Pipeline</h2>
          <p className="text-sand-500 mt-1">Drag and drop bookings through stages (Visual Demo)</p>
        </div>
        <button className="flex items-center gap-2 bg-sand-900 text-white px-4 py-2.5 rounded-lg hover:bg-sand-800 transition-colors shadow-sm font-medium">
          <Plus size={18} />
          <span>New Booking</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-8 pt-4">
        <div className="flex gap-6 h-full items-start min-w-max">
          {PIPELINE_STAGES.map(stage => {
            const stageBookings = bookings.filter(b => b.stage === stage);
            return (
              <div key={stage} className="w-80 flex flex-col max-h-full">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-medium text-sand-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sand-400"></span>
                    {stage}
                  </h3>
                  <span className="text-xs font-semibold text-sand-500 bg-sand-200 px-2 py-0.5 rounded-full">{stageBookings.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 p-1 pb-10">
                  {stageBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                  {stageBookings.length === 0 && (
                    <div className="h-24 rounded-xl border-2 border-dashed border-sand-200 flex items-center justify-center text-sand-400 text-sm">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-sand-900 mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand-200 flex items-center justify-between">
          <div>
            <div className="text-sand-500 text-sm font-medium mb-1">Upcoming Arrivals (30d)</div>
            <div className="text-3xl font-semibold text-sand-900">{upcomingArrivals.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Plane size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand-200 flex items-center justify-between">
          <div>
            <div className="text-sand-500 text-sm font-medium mb-1">Awaiting Deposit</div>
            <div className="text-3xl font-semibold text-amber-700">{awaitingDeposit.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand-200 flex items-center justify-between">
          <div>
            <div className="text-sand-500 text-sm font-medium mb-1">Final Payment Due</div>
            <div className="text-3xl font-semibold text-red-700">{awaitingFinalPayment.length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sand-200 flex items-center justify-between">
          <div>
            <div className="text-sand-500 text-sm font-medium mb-1">Active Quotes</div>
            <div className="text-3xl font-semibold text-emerald-700">{bookings.filter(b => b.stage === 'Quote Sent').length}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-sand-100 flex justify-between items-center bg-sand-50/50">
            <h3 className="font-semibold text-sand-900">Client Payments Due</h3>
            <button className="text-sm text-sand-600 hover:text-sand-900 font-medium">View All</button>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-sand-50 text-sand-500 border-b border-sand-100">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {[...awaitingDeposit, ...awaitingFinalPayment].map(b => (
                  <tr key={b.id + 'pay'} className="hover:bg-sand-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-sand-900">{b.clientName}</td>
                    <td className="px-5 py-4 text-sand-600">{b.depositStatus === 'Pending' ? 'Deposit' : 'Final'}</td>
                    <td className="px-5 py-4 font-medium">${b.depositStatus === 'Pending' ? b.depositAmount : b.sellingPrice - b.depositAmount}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-red-700 bg-red-50 border border-red-100">Due Soon</span>
                    </td>
                  </tr>
                ))}
                {awaitingDeposit.length + awaitingFinalPayment.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-sand-500">No pending client payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-sand-100 flex justify-between items-center bg-sand-50/50">
            <h3 className="font-semibold text-sand-900">Supplier Payments Due</h3>
            <button className="text-sm text-sand-600 hover:text-sand-900 font-medium">View All</button>
          </div>
          <div className="p-0 flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-sand-50 text-sand-500 border-b border-sand-100">
                <tr>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {bookings.flatMap(b => b.suppliers.filter(s => s.status === 'Pending').map(s => (
                  <tr key={s.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-sand-900">{s.name}</td>
                    <td className="px-5 py-4 text-sand-600">{b.clientName}</td>
                    <td className="px-5 py-4 font-medium">${s.cost}</td>
                    <td className="px-5 py-4">
                      {subDays(parseISO(b.arrivalDate), 30).toISOString().split('T')[0]}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;
    const finalDate = subDays(parseISO(booking.arrivalDate), 50).toISOString().split('T')[0];
    const tripLength = getTripLength(booking.arrivalDate, booking.departureDate);
    const profit = booking.sellingPrice - booking.costPrice;
    const margin = booking.sellingPrice > 0 ? ((profit / booking.sellingPrice) * 100).toFixed(1) : 0;

    return (
      <div className="fixed inset-0 bg-sand-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-10">
        <div className="bg-sand-50 w-full max-w-5xl max-h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="bg-white border-b border-sand-200 p-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold tracking-widest text-sand-500 uppercase">{booking.id}</span>
                <span className="px-2.5 py-1 bg-sand-800 text-white text-xs font-semibold rounded-full">{booking.stage}</span>
              </div>
              <h2 className="text-2xl font-semibold text-sand-900">{booking.clientName}</h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sand-600 hover:bg-sand-100 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-sand-900 text-white rounded-lg font-medium hover:bg-sand-800 transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Info */}
              <div className="lg:col-span-1 space-y-6">
                
                <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-5">
                  <h3 className="font-semibold text-sand-900 mb-4 flex items-center gap-2">
                    <User size={18} className="text-sand-500" />
                    Client Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Email</label>
                      <div className="text-sm font-medium text-sand-900 flex items-center gap-2"><Mail size={14} className="text-sand-400"/> {booking.clientEmail}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Phone</label>
                      <div className="text-sm font-medium text-sand-900 flex items-center gap-2"><Phone size={14} className="text-sand-400"/> {booking.clientPhone}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Country</label>
                        <div className="text-sm font-medium text-sand-900">{booking.country}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Travellers</label>
                        <div className="text-sm font-medium text-sand-900">{booking.travellers} Pax</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-5">
                  <h3 className="font-semibold text-sand-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-sand-500" />
                    Trip Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Arrival</label>
                      <input type="date" value={booking.arrivalDate} readOnly className="w-full text-sm font-medium text-sand-900 bg-sand-50 border border-sand-200 rounded p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1 block">Departure</label>
                      <input type="date" value={booking.departureDate} readOnly className="w-full text-sm font-medium text-sand-900 bg-sand-50 border border-sand-200 rounded p-2 focus:outline-none" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-sand-100 flex justify-between items-center text-sm">
                    <span className="text-sand-600 font-medium">Duration</span>
                    <span className="text-sand-900 font-semibold bg-sand-100 px-2 py-1 rounded">{tripLength} Nights</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-5">
                  <h3 className="font-semibold text-sand-900 mb-2">Internal Notes</h3>
                  <textarea 
                    className="w-full bg-sand-50 border border-sand-200 rounded-lg p-3 text-sm text-sand-800 focus:outline-none focus:ring-1 focus:ring-sand-400 min-h-[100px] resize-none"
                    value={booking.notes}
                    readOnly
                  />
                </div>

              </div>

              {/* Right Column: Financials & Itinerary */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Financial Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-sand-200 overflow-hidden">
                  <div className="p-5 border-b border-sand-100 bg-sand-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-sand-900 flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-600" />
                      Quote & Financials
                    </h3>
                    {booking.itineraryLink && (
                      <a href={booking.itineraryLink} target="_blank" className="text-sm text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1">
                        View Itinerary
                      </a>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                        <div className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1">Selling Price</div>
                        <div className="text-2xl font-bold text-sand-900">${booking.sellingPrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-sand-50 p-4 rounded-xl border border-sand-100">
                        <div className="text-xs font-medium text-sand-500 uppercase tracking-wider mb-1">Cost Price</div>
                        <div className="text-2xl font-bold text-sand-700">${booking.costPrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">Profit ({margin}%)</div>
                        <div className="text-2xl font-bold text-emerald-700">${profit.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-sand-800 border-b border-sand-100 pb-2">Client Payments</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className={`p-4 rounded-xl border ${getPaymentStatusColor(booking.depositStatus, booking.depositInvoiceDate)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-semibold uppercase tracking-wider">Deposit</div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm">{booking.depositStatus}</span>
                          </div>
                          <div className="text-xl font-bold mb-3">${booking.depositAmount.toLocaleString()}</div>
                          <div className="text-xs space-y-1 opacity-90">
                            <div className="flex justify-between"><span>Invoiced:</span> <span className="font-medium">{booking.depositInvoiceDate || '-'}</span></div>
                            <div className="flex justify-between"><span>Paid Date:</span> <span className="font-medium">{booking.depositPaidDate || '-'}</span></div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border ${getPaymentStatusColor(booking.finalPaymentStatus, finalDate)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-semibold uppercase tracking-wider">Final Payment</div>
                            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm">{booking.finalPaymentStatus}</span>
                          </div>
                          <div className="text-xl font-bold mb-3">${(booking.sellingPrice - booking.depositAmount).toLocaleString()}</div>
                          <div className="text-xs space-y-1 opacity-90">
                            <div className="flex justify-between"><span>Due (50d before):</span> <span className="font-medium">{finalDate}</span></div>
                            <div className="flex justify-between"><span>Status:</span> <span className="font-medium">{booking.finalPaymentStatus}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suppliers */}
                <div className="bg-white rounded-xl shadow-sm border border-sand-200 overflow-hidden">
                  <div className="p-5 border-b border-sand-100 bg-sand-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-sand-900 flex items-center gap-2">
                      <MapPin size={18} className="text-sand-500" />
                      Supplier & Accommodations
                    </h3>
                    <button className="text-xs font-semibold text-sand-600 bg-white border border-sand-200 px-3 py-1.5 rounded shadow-sm hover:bg-sand-50">Add Supplier</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-sand-500 border-b border-sand-100 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-medium">Supplier</th>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Cost</th>
                          <th className="px-5 py-3 font-medium">Due Date (30d)</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-100">
                        {booking.suppliers.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-6 text-sand-400 italic">No suppliers added yet.</td></tr>
                        ) : booking.suppliers.map(s => (
                          <tr key={s.id} className="hover:bg-sand-50/50">
                            <td className="px-5 py-3 font-medium text-sand-800">{s.name}</td>
                            <td className="px-5 py-3 text-sand-600">{s.type}</td>
                            <td className="px-5 py-3 font-medium">${s.cost}</td>
                            <td className="px-5 py-3 text-sand-600">{subDays(parseISO(booking.arrivalDate), 30).toISOString().split('T')[0]}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${s.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activities Add-on */}
                <div className="bg-white rounded-xl shadow-sm border border-sand-200 overflow-hidden">
                  <div className="p-5 border-b border-sand-100 bg-sand-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-sand-900 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-sand-500" />
                      Activities & Add-ons
                    </h3>
                    <button className="text-xs font-semibold text-sand-600 bg-white border border-sand-200 px-3 py-1.5 rounded shadow-sm hover:bg-sand-50">Add Activity</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-sand-500 border-b border-sand-100 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-medium">Activity</th>
                          <th className="px-5 py-3 font-medium">Supplier</th>
                          <th className="px-5 py-3 font-medium">Cost / Sell</th>
                          <th className="px-5 py-3 font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-100">
                        {booking.activities.length === 0 ? (
                          <tr><td colSpan="4" className="text-center py-6 text-sand-400 italic">No activities added yet.</td></tr>
                        ) : booking.activities.map(a => (
                          <tr key={a.id} className="hover:bg-sand-50/50">
                            <td className="px-5 py-3 font-medium text-sand-800">{a.name}</td>
                            <td className="px-5 py-3 text-sand-600">{a.supplier}</td>
                            <td className="px-5 py-3 text-sand-600">${a.cost} / <span className="font-semibold text-sand-900">${a.selling}</span></td>
                            <td className="px-5 py-3 font-semibold text-emerald-600">
                              +${a.selling - a.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-sand-50 font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-sand-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 text-sand-400" size={16} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-sand-50 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-sand-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sand-500 hover:text-sand-900"><AlertCircle size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-sand-200 border border-sand-300"></div>
          </div>
        </header>

        {view === 'pipeline' && <PipelineView />}
        {view === 'dashboard' && <DashboardView />}
        {view === 'calendar' && (
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <Calendar size={48} className="mx-auto text-sand-300 mb-4" />
              <h2 className="text-2xl font-semibold text-sand-900 mb-2">Calendar View</h2>
              <p className="text-sand-500 max-w-md mx-auto">This calendar block sorts arrivals month by month visually to give agencies a full overview of touring schedules.</p>
            </div>
          </div>
        )}

        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      </main>
    </div>
  );
}
