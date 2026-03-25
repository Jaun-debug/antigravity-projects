"use client";

import { useState } from "react";
import { Camera, CheckCircle2, User, FileText, Calendar, PlusCircle, AlertCircle, Heart } from "lucide-react";

export default function GuestRegistration() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [passportObj, setPassportObj] = useState<File | null>(null);
    const [licenseObj, setLicenseObj] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        if (passportObj) formData.set("passportFile", passportObj);
        if (licenseObj) formData.set("licenseFile", licenseObj);

        try {
            const res = await fetch("/api/registration", {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                alert("Failed to securely upload documents. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center">
                <div className="max-w-md bg-white p-8 md:p-12 shadow-2xl rounded-2xl border border-[#ebe6df] flex flex-col items-center">
                    <CheckCircle2 className="w-20 h-20 text-[#214352] mb-6 animate-pulse" />
                    <h2 className="text-3xl font-serif text-[#bfa182] uppercase tracking-widest mb-4">Secured</h2>
                    <p className="text-[#647c87] text-lg font-light leading-relaxed">
                        Your registration and documents have been successfully encrypted and uploaded. We look forward to hosting your African safari.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">

            {/* Header */}
            <header className="bg-white border-b border-[#ebe6df] py-8 text-center sticky top-0 z-50 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-serif text-[#214352] tracking-[0.2em] uppercase">Desert Tracks</h1>
                <p className="text-[#bfa182] text-xs font-bold tracking-widest uppercase mt-2">Secure Guest Registration</p>
            </header>

            <main className="max-w-3xl mx-auto px-6 mt-12">
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Primary Details */}
                    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3]">
                        <h2 className="flex items-center gap-3 text-xl font-serif text-[#bfa182] mb-8 uppercase tracking-widest">
                            <User className="w-5 h-5" /> Booking Reference
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Group Name</label>
                                <input required name="groupName" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. KRAUS" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Tour Type</label>
                                <select name="tourType" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none">
                                    <option>Self-Drive Safari</option>
                                    <option>Fly-In Safari</option>
                                    <option>Guided Safari</option>
                                    <option>Luxury Safari</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Guest Profile */}
                    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3]">
                        <h2 className="flex items-center gap-3 text-xl font-serif text-[#bfa182] mb-8 uppercase tracking-widest">
                            <FileText className="w-5 h-5" /> Guest Profile
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Full Name & Title</label>
                                <input required name="guestName" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. Mr. Sebastian Kraus" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Date of Birth</label>
                                    <input required name="dob" type="date" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Nationality</label>
                                    <input required name="nationality" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. German" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Passport Number</label>
                                    <input required name="passportNumber" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Passport Expiry</label>
                                    <input required name="passportExpiry" type="date" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Mobile / WhatsApp Number</label>
                                    <input required name="mobile" type="tel" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Contact when travelling" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Body Weight (KG)</label>
                                    <input name="weight" type="number" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="(Required for Fly-In Safari only)" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Travel Insurance Name & Policy #</label>
                                <input name="insurance" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Include provider and policy number" />
                            </div>
                        </div>
                    </section>

                    {/* Medical & Dietary */}
                    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3]">
                        <h2 className="flex items-center gap-3 text-xl font-serif text-[#bfa182] mb-8 uppercase tracking-widest">
                            <Heart className="w-5 h-5" /> Medical & Dietary
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Dietary Requirements</label>
                                <input name="dietary" type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. Vegetarian, Gluten-Free, None" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Medical Conditions we should know?</label>
                                <textarea name="medical" rows={3} className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Please list any allergies or conditions..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Emergency Family Contact</label>
                                <textarea required name="emergencyContact" rows={2} className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Name, Relationship, and Contact #" />
                            </div>
                        </div>
                    </section>

                    {/* Safe Document Upload (CELLPHONE CAMERA TRIGGER) */}
                    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3] ring-2 ring-[#bfa182]/20">
                        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                            <div>
                                <h2 className="flex items-center gap-3 text-xl font-serif text-[#214352] uppercase tracking-widest mb-2">
                                    <Camera className="w-6 h-6 text-[#d87a4d]" /> Secure Document Capture
                                </h2>
                                <p className="text-sm text-[#647c87]">Tap below to open your phone's camera and securely snap photos of your documents.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Passport Image Upload */}
                            <div className="relative border-2 border-dashed border-[#bfa182] bg-[#FDFBF7] p-8 text-center rounded-lg hover:bg-white transition-colors cursor-pointer"
                                onClick={() => document.getElementById("passportInput")?.click()}>
                                <input
                                    id="passportInput" type="file" required accept="image/*" capture="environment" className="hidden"
                                    onChange={(e) => e.target.files && setPassportObj(e.target.files[0])}
                                />
                                {passportObj ? (
                                    <div className="flex flex-col items-center text-[#214352]">
                                        <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
                                        <span className="font-bold text-sm uppercase tracking-wide">Passport Attached</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center opacity-80 pointer-events-none">
                                        <PlusCircle className="w-10 h-10 text-[#bfa182] mb-4" />
                                        <span className="font-bold text-[#bfa182] uppercase tracking-widest text-sm mb-1">Scan Passport</span>
                                        <span className="text-xs text-[#647c87]">Photo Page</span>
                                    </div>
                                )}
                            </div>

                            {/* Driver License Upload */}
                            <div className="relative border-2 border-dashed border-[#bfa182] bg-[#FDFBF7] p-8 text-center rounded-lg hover:bg-white transition-colors cursor-pointer"
                                onClick={() => document.getElementById("licenseInput")?.click()}>
                                <input
                                    id="licenseInput" type="file" required accept="image/*" capture="environment" className="hidden"
                                    onChange={(e) => e.target.files && setLicenseObj(e.target.files[0])}
                                />
                                {licenseObj ? (
                                    <div className="flex flex-col items-center text-[#214352]">
                                        <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
                                        <span className="font-bold text-sm uppercase tracking-wide">License Attached</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center opacity-80 pointer-events-none">
                                        <PlusCircle className="w-10 h-10 text-[#bfa182] mb-4" />
                                        <span className="font-bold text-[#bfa182] uppercase tracking-widest text-sm mb-1">Driver's License</span>
                                        <span className="text-xs text-[#647c87]">Only if self-drive</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded text-sm text-[#647c87]">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-400" />
                            <p>We use WordPress end-to-end encryption. Your identity documents are directly uploaded to a secure, private bucket and will never be shared.</p>
                        </div>
                    </section>

                    <button disabled={submitting} type="submit" className="w-full bg-[#214352] text-white py-5 px-8 font-bold tracking-widest uppercase text-lg shadow-xl hover:bg-[#1a3541] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? "Encrypting & Uploading..." : "Submit Registration"}
                    </button>

                </form>
            </main>
        </div>
    );
}
