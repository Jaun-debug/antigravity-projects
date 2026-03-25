import ClientRepository from '@/components/ClientRepository';
import { Folder } from 'lucide-react';

export default function ClientsPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-serif text-neutral-900 tracking-tight flex items-center gap-4">
                        <Folder className="w-10 h-10 text-emerald-600" />
                        Client Directory
                    </h1>
                    <p className="text-neutral-500 font-light mt-2 tracking-wide">Manage your clients, view your segregated statements and data repositories.</p>
                </div>
            </div>

            <ClientRepository />
        </div>
    );
}
