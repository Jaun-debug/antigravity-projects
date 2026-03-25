import React, { useState, useEffect, useRef } from 'react';
import { Calculator, FileSpreadsheet, TrendingUp, AlertCircle, Download, Search, FileText, Upload, Filter, CheckCircle, Trash2, Folder, ChevronRight, ChevronDown, X, Eye, Receipt } from 'lucide-react';

const AccountancyProgram = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Statements State
    const [statements, setStatements] = useState([]);
    const [loadingStatements, setLoadingStatements] = useState(false);

    // Extraction State
    const [statementFile, setStatementFile] = useState(null);
    const [keywords, setKeywords] = useState('');
    const [listName, setListName] = useState('');
    const [clientName, setClientName] = useState('');
    const [extractionResults, setExtractionResults] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [savingText, setSavingText] = useState(null);
    const [transactionType, setTransactionType] = useState('auto'); // 'auto', 'debit', 'credit'

    // Clients State
    const [clients, setClients] = useState([]);
    const [viewingFile, setViewingFile] = useState(null); // { client, type, filename, data: { headers, rows } }
    const [expandedSections, setExpandedSections] = useState({}); // { 'ClientName-debits': true/false }


    // Refs for Inputs
    const extractionInputRef = useRef(null);
    const statementListInputRef = useRef(null);

    // Load statements on mount or tab change
    useEffect(() => {
        if (activeTab === 'statements') {
            fetchStatements();
        }
        if (activeTab === 'overview') {
            fetchClients();
        }
    }, [activeTab]);

    const fetchStatements = async () => {
        setLoadingStatements(true);
        try {
            const res = await fetch('http://localhost:3000/api/statements');
            if (res.ok) {
                const data = await res.json();
                setStatements(data);
            }
        } catch (error) {
            console.error("Failed to load statements", error);
        } finally {
            setLoadingStatements(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/clients');
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Failed to load clients", error);
        }
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const toggleSection = (clientName, type) => {
        const key = `${clientName}-${type}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleStatementUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:3000/api/statements', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                fetchStatements(); // Refresh list
            } else {
                alert("Failed to upload file");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        }
    };

    const handleDeleteStatement = async (filename) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/api/statements/${filename}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setStatements(statements.filter(s => s.id !== filename));
            } else {
                alert("Failed to delete file");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const handleDownload = (filename) => {
        window.open(`http://localhost:3000/api/statements/${filename}`, '_blank');
    };

    // AI Extraction Logic (File Based)
    const handleExtract = async () => {
        if (!statementFile) {
            alert("Please select a statement file (PDF/Image) to analyze.");
            return;
        }

        setIsExtracting(true);
        setExtractionResults(null);

        const formData = new FormData();
        formData.append('file', statementFile);
        formData.append('keywords', keywords);
        formData.append('listName', listName);

        try {
            const res = await fetch('http://localhost:3000/api/analyze-statement', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const results = await res.json();
                setExtractionResults(results);
            } else {
                console.error("Extraction failed");
                const errorData = await res.json().catch(() => ({}));
                alert(`Extraction failed: ${errorData.error || 'Check server/console'}`);
            }
        } catch (error) {
            console.error("Extraction error", error);
            alert("Extraction error - ensure backend is running.");
        } finally {
            setIsExtracting(false);
        }
    };

    const generateCSV = () => {
        if (!extractionResults?.transactions) return '';
        const headers = ['Date', 'Description', 'Amount'];
        const rows = extractionResults.transactions.map(t => [t.date || '', t.description || '', t.amount || '']);
        const total = extractionResults.transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')),
            `"","TOTAL","${total.toFixed(2)}"`
        ].join('\n');
        return csvContent;
    };

    const handleDownloadCSV = () => {
        const csvContent = generateCSV();
        if (!csvContent) return;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${(listName || 'transactions').replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToClient = async () => {
        if (!clientName) {
            alert("Please enter a Client Name first.");
            return;
        }

        if (!extractionResults?.transactions) {
            alert("No transactions extracted.");
            return;
        }

        setSavingText('Separating & Saving...');

        try {
            const res = await fetch('http://localhost:3000/api/save-separated-transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName,
                    listName: listName || 'Extracted',
                    transactions: extractionResults.transactions,
                    transactionType // Send override type
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Success: ${data.message}`);
                fetchClients();
            } else {
                const err = await res.json();
                alert(`Failed to save: ${err.error}`);
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Failed to connect to server.");
        } finally {
            setSavingText(null);
        }
    };

    const handleDeleteClient = async (clientName) => {
        if (!confirm(`Permanently delete all data for ${clientName}?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/api/clients/${clientName}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setClients(clients.filter(c => c.name !== clientName));
            } else {
                alert("Failed to delete client.");
            }
        } catch (error) {
            console.error("Delete client error", error);
        }
    };

    const handleDeleteFile = async (e, clientName, type, filename) => {
        e.stopPropagation(); // Prevent opening file
        if (!confirm(`Permanently delete ${filename}?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/api/clients/${clientName}/files?type=${type}&filename=${filename}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // Update state locally to remove file
                setClients(clients.map(c => {
                    if (c.name !== clientName) return c;
                    return {
                        ...c,
                        [type.toLowerCase()]: c[type.toLowerCase()].filter(f => f.name !== filename)
                    };
                }));
            } else {
                alert("Failed to delete file.");
            }
        } catch (error) {
            console.error("Delete file error", error);
        }
    };

    const handleFileClick = async (clientName, type, filename) => {
        try {
            const res = await fetch(`http://localhost:3000/api/read-csv?client=${clientName}&type=${type}&file=${filename}`);
            if (res.ok) {
                const data = await res.json();
                setViewingFile({ client: clientName, type, filename, data });
            } else {
                alert("Failed to read file.");
            }
        } catch (error) {
            console.error("Read file error", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col relative w-full">

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-light text-neutral-800 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Calculator className="w-6 h-6 text-emerald-600" />
                        </div>
                        Accountancy Program
                    </h2>
                    <p className="text-neutral-500 mt-1">Financial management, statements, and intelligent analysis.</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Client Repository
                    </button>
                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'statements' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Statements
                    </button>
                    <button
                        onClick={() => setActiveTab('extraction')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'extraction' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        AI Extraction
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: CLIENT REPOSITORY (OVERVIEW) */}
            {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-100 h-full overflow-y-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-neutral-900">Client Folders</h3>
                        <div className="text-sm text-neutral-400">
                            {clients.length} Clients Found
                        </div>
                    </div>

                    {clients.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No client folders created yet.</p>
                            <p className="text-sm mt-2">Use the AI Extraction tab to save client data.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clients.map((client, idx) => {
                                const debitsKey = `${client.name}-debits`;
                                const creditsKey = `${client.name}-credits`;
                                const isDebitsOpen = expandedSections[debitsKey];
                                const isCreditsOpen = expandedSections[creditsKey];

                                return (
                                    <div key={idx} className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl hover:shadow-md transition-shadow flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-neutral-200 flex items-center justify-center">
                                                    <Folder className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <h4 className="font-semibold text-neutral-800">{client.name}</h4>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteClient(client.name)}
                                                className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                                                title="Delete Client"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            {/* Debits Section */}
                                            <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
                                                <div
                                                    onClick={() => toggleSection(client.name, 'debits')}
                                                    className="flex items-center gap-2 p-3 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100 transition-colors border-b border-transparent hover:border-neutral-100"
                                                >
                                                    <div className={`transition-transform duration-200 text-neutral-400 ${isDebitsOpen ? 'rotate-90' : ''}`}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                    <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Debits</span>
                                                    <span className="ml-auto text-xs text-neutral-400">{client.debits?.length || 0}</span>
                                                </div>

                                                {isDebitsOpen && (
                                                    <div className="p-2 space-y-2 border-t border-neutral-100 bg-white max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                                                        {client.debits && client.debits.map((file, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => handleFileClick(client.name, 'Debits', file.name)}
                                                                className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded cursor-pointer group border border-transparent hover:border-neutral-200 transition-all"
                                                            >
                                                                <div className="flex flex-col overflow-hidden max-w-[65%]">
                                                                    <div className="flex items-center gap-2">
                                                                        <Receipt className="w-4 h-4 text-neutral-400 group-hover:text-red-500 flex-shrink-0" />
                                                                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 truncate" title={file.displayName}>{file.displayName}</span>
                                                                    </div>
                                                                    {/* Display Companies */}
                                                                    {file.companies && file.companies.length > 0 && (
                                                                        <span className="text-xs text-neutral-400 ml-6 truncate block">{file.companies.join(', ')}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                                                                        {formatAmount(file.total)}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => handleDeleteFile(e, client.name, 'Debits', file.name)}
                                                                        className="p-1 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded transition-colors"
                                                                        title="Delete List"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!client.debits || client.debits.length === 0) && <span className="text-xs text-neutral-300 italic block text-center py-2">No debits</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Credits Section */}
                                            <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
                                                <div
                                                    onClick={() => toggleSection(client.name, 'credits')}
                                                    className="flex items-center gap-2 p-3 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100 transition-colors border-b border-transparent hover:border-neutral-100"
                                                >
                                                    <div className={`transition-transform duration-200 text-neutral-400 ${isCreditsOpen ? 'rotate-90' : ''}`}>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                    <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Credits</span>
                                                    <span className="ml-auto text-xs text-neutral-400">{client.credits?.length || 0}</span>
                                                </div>

                                                {isCreditsOpen && (
                                                    <div className="p-2 space-y-2 border-t border-neutral-100 bg-white max-h-64 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                                                        {client.credits && client.credits.map((file, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={() => handleFileClick(client.name, 'Credits', file.name)}
                                                                className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded cursor-pointer group border border-transparent hover:border-neutral-200 transition-all"
                                                            >
                                                                <div className="flex flex-col overflow-hidden max-w-[65%]">
                                                                    <div className="flex items-center gap-2">
                                                                        <Receipt className="w-4 h-4 text-neutral-400 group-hover:text-green-500 flex-shrink-0" />
                                                                        <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 truncate" title={file.displayName}>{file.displayName}</span>
                                                                    </div>
                                                                    {/* Display Companies */}
                                                                    {file.companies && file.companies.length > 0 && (
                                                                        <span className="text-xs text-neutral-400 ml-6 truncate block">{file.companies.join(', ')}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                                                                        {formatAmount(file.total)}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => handleDeleteFile(e, client.name, 'Credits', file.name)}
                                                                        className="p-1 hover:bg-red-50 text-neutral-300 hover:text-red-500 rounded transition-colors"
                                                                        title="Delete List"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!client.credits || client.credits.length === 0) && <span className="text-xs text-neutral-300 italic block text-center py-2">No credits</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: STATEMENTS */}
            {activeTab === 'statements' && (
                <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-neutral-900">Monthly Statements Repository</h3>
                        <div className="flex gap-2">
                            <div
                                onClick={() => statementListInputRef.current?.click()}
                                className="flex items-center gap-2 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 cursor-pointer transition-colors select-none"
                            >
                                <Upload className="w-4 h-4" /> Upload Statement
                            </div>
                            <input
                                ref={statementListInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleStatementUpload}
                                onClick={(e) => { e.target.value = null; }}
                            />
                            <button className="flex items-center gap-2 text-sm text-neutral-500 font-medium hover:text-neutral-900 px-3 py-2 border rounded-lg hover:bg-neutral-50">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {loadingStatements && (
                            <div className="p-12 text-center text-neutral-400">
                                <p>Loading statements...</p>
                            </div>
                        )}

                        {!loadingStatements && statements.length === 0 && (
                            <div className="p-12 text-center text-neutral-400">
                                <p>No statements uploaded yet.</p>
                            </div>
                        )}

                        {!loadingStatements && statements.map((item) => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-neutral-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-neutral-900">{item.month}</h4>
                                        <p className="text-xs text-neutral-500">Consolidated Financial Statement • {item.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                        {item.status}
                                    </span>
                                    <button
                                        onClick={() => handleDownload(item.id)}
                                        className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors"
                                        title="Download File"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStatement(item.id)}
                                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                        title="Delete Statement"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center">
                        <button className="text-sm text-neutral-500 hover:text-neutral-900 font-medium">View Archived Statements</button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: EXTRACTION */}
            {activeTab === 'extraction' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left: Input */}
                    <div className="bg-white p-6 rounded-xl border border-neutral-100 flex flex-col h-full">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-2">Statement Analysis</h3>
                            <p className="text-sm text-neutral-500">Upload your bank statement (PDF or Image) to extract specific transactions.</p>
                        </div>

                        {/* File Upload Area */}
                        <div className="flex-1 mb-6">
                            <div
                                onClick={() => extractionInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-neutral-200 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors group relative"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                                    <p className="mb-2 text-sm text-neutral-500"><span className="font-semibold">Click to upload statement</span></p>
                                    <p className="text-xs text-neutral-500">PDF, PNG, JPG (MAX. 20MB)</p>
                                    {statementFile && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1 shadow-sm">
                                            <CheckCircle className="w-3 h-3" /> {statementFile.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={extractionInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setStatementFile(e.target.files[0]);
                                    }
                                    e.target.value = null; // Clear input to allow re-selection
                                }}
                                accept=".pdf,image/*"
                            />
                        </div>

                        <div className="space-y-4">
                            {/* List Name Input */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">List Name (Optional)</label>
                                <input
                                    type="text"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    placeholder="e.g. Monthly Grocery Expenses"
                                    className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            {/* Client Name Input for Folder Organization */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">Client Folder (Important for saving)</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            {/* Keywords Input */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Keywords (comma separated)</label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g. SPAR, Checkers, Woolworths"
                                    className="w-full p-3 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            {/* Force Transaction Type Toggle */}
                            <div>
                                <label className="block text-xs font-semibold text-neutral-700 mb-2">Force Transaction Category</label>
                                <div className="flex bg-neutral-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTransactionType('auto')}
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${transactionType === 'auto' ? 'bg-white text-emerald-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Auto Detect
                                    </button>
                                    <button
                                        onClick={() => setTransactionType('debit')}
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${transactionType === 'debit' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Force Debit (Expense)
                                    </button>
                                    <button
                                        onClick={() => setTransactionType('credit')}
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${transactionType === 'credit' ? 'bg-white text-green-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                    >
                                        Force Credit (Income)
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleExtract}
                                disabled={isExtracting}
                                className={`w-full p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isExtracting ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                            >
                                {isExtracting ? 'Analyzing Statement...' : <><Search className="w-4 h-4" /> Analyze with AI</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Results */}
                    <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 flex flex-col h-full overflow-hidden">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center justify-between">
                            {extractionResults?.listName || "Extraction Results"}
                            {extractionResults?.transactions && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{extractionResults.transactions.length} items</span>}
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                            {!extractionResults ? (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3">
                                    <Search className="w-12 h-12 opacity-20" />
                                    <p className="text-sm">Upload a statement to see analysis.</p>
                                </div>
                            ) : extractionResults.transactions?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                                    <p>No matching transactions found.</p>
                                </div>
                            ) : (
                                extractionResults.transactions.map((result, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm flex justify-between items-center">
                                        <div>
                                            {result.date && <p className="text-xs text-neutral-400 font-medium mb-1">{result.date}</p>}
                                            <p className="text-sm text-neutral-800 font-medium">{result.description}</p>
                                        </div>
                                        {result.amount && <span className={`text-sm font-bold whitespace-nowrap ml-4 ${result.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatAmount(result.amount)}</span>}
                                    </div>
                                ))
                            )}
                        </div>

                        {extractionResults?.transactions?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-2 flex-col md:flex-row">
                                <button
                                    onClick={handleDownloadCSV}
                                    className="flex-1 py-2 bg-white border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download CSV
                                </button>
                                <button
                                    onClick={handleSaveToClient}
                                    disabled={!clientName || savingText}
                                    className="flex-1 py-2 bg-emerald-600 border border-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!clientName ? "Enter a Client Name to save" : "Save to server folder"}
                                >
                                    {savingText ? savingText : <><CheckCircle className="w-4 h-4" /> Split & Save</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FILE VIWER MODAL */}
            {viewingFile && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <div>
                                <h3 className="font-semibold text-neutral-900">{viewingFile.filename}</h3>
                                <p className="text-xs text-neutral-500">{viewingFile.client} • {viewingFile.type}</p>
                            </div>
                            <button onClick={() => setViewingFile(null)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 sticky top-0">
                                    <tr>
                                        {viewingFile.data.headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {viewingFile.data.rows.map((row, i) => (
                                        <tr key={i} className={`hover:bg-neutral-50 ${i === viewingFile.data.rows.length - 1 && row.includes("TOTAL") ? "bg-emerald-50 font-bold" : ""}`}>
                                            {row.map((cell, c) => (
                                                <td key={c} className="px-4 py-3 whitespace-nowrap">{cell?.replace(/"/g, '')}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-right">
                            <button onClick={() => setViewingFile(null)} className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-100 font-medium">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountancyProgram;
