const API_BASE = '/api';

export const api = {
    fetchStatements: async () => {
        const res = await fetch(`${API_BASE}/statements`);
        if (!res.ok) throw new Error('Failed to fetch statements');
        return res.json();
    },

    uploadStatement: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/statements`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload statement');
        return res.json();
    },

    deleteStatement: async (filename: string) => {
        const res = await fetch(`${API_BASE}/statements/${filename}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete statement');
        return res.json();
    },

    analyzeStatement: async (file: File, keywords: string, listName: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('keywords', keywords);
        formData.append('listName', listName);
        const res = await fetch(`${API_BASE}/analyze-statement`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to analyze statement');
        return res.json();
    },

    saveTransactions: async (data: {
        clientName: string;
        listName: string;
        transactions: any[];
        transactionType: string;
    }) => {
        const res = await fetch(`${API_BASE}/save-separated-transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to save transactions');
        return res.json();
    },

    fetchClients: async () => {
        const res = await fetch(`${API_BASE}/clients`);
        if (!res.ok) throw new Error('Failed to fetch clients');
        return res.json();
    },

    deleteClient: async (clientName: string) => {
        const res = await fetch(`${API_BASE}/clients/${clientName}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete client');
        return res.json();
    },

    deleteFile: async (clientName: string, type: string, filename: string) => {
        const res = await fetch(`${API_BASE}/clients/${clientName}/files?type=${type}&filename=${filename}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete file');
        return res.json();
    },

    readCSV: async (client: string, type: string, file: string) => {
        const res = await fetch(`${API_BASE}/read-csv?client=${client}&type=${type}&file=${file}`);
        if (!res.ok) throw new Error('Failed to read CSV');
        return res.json();
    },
};
