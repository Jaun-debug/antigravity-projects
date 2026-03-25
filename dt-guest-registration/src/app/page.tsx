"use client";

import { useState } from "react";
import { Camera, CheckCircle2, User, FileText, PlusCircle, Heart, UserPlus, Trash2, X } from "lucide-react";

export default function GuestRegistration() {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Group Details State
    const [groupName, setGroupName] = useState("");
    const [tourType, setTourType] = useState("Self-Drive Safari");

    const [nextId, setNextId] = useState(2);
    // Multiple Guests State
    const [guests, setGuests] = useState([
        { id: "guest-1", passportObj: null as File | null, licenseObj: null as File | null }
    ]);

    const handleAddGuest = () => {
        setGuests([...guests, { id: `guest-${nextId}`, passportObj: null, licenseObj: null }]);
        setNextId(nextId + 1);
    };

    const handleRemoveGuest = (id: string) => {
        if (guests.length > 1) {
            setGuests(guests.filter(g => g.id !== id));
        }
    };

    const updateGuestFile = async (id: string, type: 'passport' | 'license', file: File | null) => {
        if (!file) {
            setGuests(guests.map(g => {
                if (g.id === id) {
                    return { ...g, [type === 'passport' ? 'passportObj' : 'licenseObj']: null };
                }
                return g;
            }));
            return;
        }

        // Lightweight frontend compression trick to prevent 4.5MB Vercel payload limits & 10s function limits
        const compressedFile = await new Promise<File>((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 1200; // Shrink to 1200px max

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                        } else {
                            resolve(file); // fallback
                        }
                    }, "image/jpeg", 0.7);
                };
            };
        });

        setGuests(guests.map(g => {
            if (g.id === id) {
                return { ...g, [type === 'passport' ? 'passportObj' : 'licenseObj']: compressedFile };
            }
            return g;
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const form = e.currentTarget;

        try {
            // Submit each guest sequentially so they don't timeout the server
            for (let i = 0; i < guests.length; i++) {
                const guest = guests[i];
                const formData = new FormData();

                // Group info
                formData.set("groupName", groupName);
                formData.set("tourType", tourType);
                formData.set("Guest Index", `Guest ${i + 1} of ${guests.length}`);

                // Guest specific info from the form
                formData.set("guestName", (form.elements.namedItem(`guestName_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("dob", (form.elements.namedItem(`dob_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("nationality", (form.elements.namedItem(`nationality_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("passportNumber", (form.elements.namedItem(`passportNumber_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("passportExpiry", (form.elements.namedItem(`passportExpiry_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("mobile", (form.elements.namedItem(`mobile_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("weight", (form.elements.namedItem(`weight_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("insurance", (form.elements.namedItem(`insurance_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("dietary", (form.elements.namedItem(`dietary_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("medical", (form.elements.namedItem(`medical_${guest.id}`) as HTMLInputElement)?.value || "");
                formData.set("emergencyContact", (form.elements.namedItem(`emergencyContact_${guest.id}`) as HTMLInputElement)?.value || "");

                // Files
                if (guest.passportObj) formData.set("passportFile", guest.passportObj);
                if (guest.licenseObj) formData.set("licenseFile", guest.licenseObj);

                const res = await fetch("/api/registration", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error("Failed to securely upload documents for a guest.");
                }
            }

            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Network error or upload failed. Please try again.");
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
                        Your group&apos;s registrations and documents have been successfully encrypted and uploaded. We look forward to hosting your African safari.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
            <header className="bg-white border-b border-[#ebe6df] py-8 text-center sticky top-0 z-50 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-serif text-[#214352] tracking-[0.2em] uppercase">Desert Tracks</h1>
                <p className="text-[#bfa182] text-xs font-bold tracking-widest uppercase mt-2">Secure Guest Registration</p>
            </header>

            <main className="max-w-3xl mx-auto px-6 mt-12">
                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Primary Details (Applies to all) */}
                    <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3]">
                        <h2 className="flex items-center gap-3 text-xl font-serif text-[#bfa182] mb-8 uppercase tracking-widest">
                            <User className="w-5 h-5" /> Booking Reference
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Group Name</label>
                                <input required value={groupName} onChange={e => setGroupName(e.target.value)} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. KRAUS" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Tour Type</label>
                                <select required value={tourType} onChange={e => setTourType(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none">
                                    <option>Self-Drive Safari</option>
                                    <option>Fly-In Safari</option>
                                    <option>Guided Safari</option>
                                    <option>Luxury Safari</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Guests Loop */}
                    {guests.map((guest, index) => (
                        <div key={guest.id} className="space-y-12 relative border-l-4 border-[#bfa182] pl-4 md:pl-8 ml-2">
                            {/* Guest Divider */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-serif text-[#214352] tracking-widest uppercase">
                                    Guest {index + 1}
                                </h3>
                                {guests.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveGuest(guest.id)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
                                        <Trash2 className="w-4 h-4" /> Remove Guest
                                    </button>
                                )}
                            </div>

                            {/* Guest Profile */}
                            <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3]">
                                <h2 className="flex items-center gap-3 text-xl font-serif text-[#bfa182] mb-8 uppercase tracking-widest">
                                    <FileText className="w-5 h-5" /> Guest Profile
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Full Name & Title</label>
                                        <input required name={`guestName_${guest.id}`} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. Mr. Sebastian Kraus" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Date of Birth</label>
                                            <input required name={`dob_${guest.id}`} type="date" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Nationality</label>
                                            <input required name={`nationality_${guest.id}`} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. German" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Passport Number</label>
                                            <input required name={`passportNumber_${guest.id}`} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Passport Expiry</label>
                                            <input required name={`passportExpiry_${guest.id}`} type="date" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Mobile / WhatsApp Number</label>
                                            <input required name={`mobile_${guest.id}`} type="tel" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Contact when travelling" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Body Weight (KG)</label>
                                            <input name={`weight_${guest.id}`} type="number" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="(Required for Fly-In Safari only)" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Travel Insurance Name & Policy #</label>
                                        <input name={`insurance_${guest.id}`} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Include provider and policy number" />
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
                                        <input name={`dietary_${guest.id}`} type="text" className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="e.g. Vegetarian, Gluten-Free, None" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Medical Conditions we should know?</label>
                                        <textarea name={`medical_${guest.id}`} rows={3} className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Please list any allergies or conditions..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#647c87] tracking-wider uppercase">Emergency Family Contact</label>
                                        <textarea required name={`emergencyContact_${guest.id}`} rows={2} className="w-full bg-[#FAFAFA] border border-[#ebe6df] p-3 focus:outline-none focus:border-[#bfa182] transition-colors rounded-none" placeholder="Name, Relationship, and Contact #" />
                                    </div>
                                </div>
                            </section>

                            {/* Safe Document Upload (CELLPHONE CAMERA TRIGGER) */}
                            <section className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-[#f0ebe3] ring-2 ring-[#bfa182]/20">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                                    <div>
                                        <h2 className="flex items-center gap-3 text-xl font-serif text-[#214352] uppercase tracking-widest mb-2">
                                            <Camera className="w-6 h-6 text-[#d87a4d]" /> Secure Document Capture (Guest {index + 1})
                                        </h2>
                                        <p className="text-sm text-[#647c87]">Tap below to open your phone&apos;s camera and securely snap photos of your documents.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Passport Image Upload */}
                                    <label htmlFor={`passportInput_${guest.id}`} className="block relative border-2 border-dashed border-[#bfa182] bg-[#FDFBF7] p-8 text-center rounded-lg hover:bg-white transition-colors cursor-pointer">
                                        <input
                                            id={`passportInput_${guest.id}`} type="file" required accept="image/*" className="sr-only"
                                            onChange={(e) => e.target.files && updateGuestFile(guest.id, 'passport', e.target.files[0])}
                                        />
                                        {guest.passportObj ? (
                                            <div className="flex flex-col items-center text-[#214352] relative">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); updateGuestFile(guest.id, 'passport', null); }}
                                                    className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                                    title="Remove Passport"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
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
                                    </label>

                                    {/* Driver License Upload */}
                                    <label htmlFor={`licenseInput_${guest.id}`} className="block relative border-2 border-dashed border-[#bfa182] bg-[#FDFBF7] p-8 text-center rounded-lg hover:bg-white transition-colors cursor-pointer">
                                        <input
                                            id={`licenseInput_${guest.id}`} type="file" accept="image/*" className="sr-only"
                                            onChange={(e) => e.target.files && updateGuestFile(guest.id, 'license', e.target.files[0])}
                                        />
                                        {guest.licenseObj ? (
                                            <div className="flex flex-col items-center text-[#214352] relative">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); updateGuestFile(guest.id, 'license', null); }}
                                                    className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                                    title="Remove License"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
                                                <span className="font-bold text-sm uppercase tracking-wide">License Attached</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center opacity-80 pointer-events-none">
                                                <PlusCircle className="w-10 h-10 text-[#bfa182] mb-4" />
                                                <span className="font-bold text-[#bfa182] uppercase tracking-widest text-sm mb-1">Driver&apos;s License</span>
                                                <span className="text-xs text-[#647c87]">Only if self-drive</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </section>
                        </div>
                    ))}

                    <div className="pt-4 flex justify-center">
                        <button type="button" onClick={handleAddGuest} className="flex items-center gap-2 bg-[#FDFBF7] border-2 border-[#bfa182] text-[#214352] py-4 px-8 font-bold tracking-widest uppercase text-sm rounded-full hover:bg-[#bfa182] hover:text-white transition-colors">
                            <UserPlus className="w-5 h-5" /> Add Another Guest Profile
                        </button>
                    </div>

                    <button disabled={submitting} type="submit" className="w-full bg-[#214352] text-white py-5 px-8 font-bold tracking-widest uppercase text-lg shadow-xl hover:bg-[#1a3541] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-12">
                        {submitting ? "Encrypting & Uploading Group..." : "Submit Registration Group"}
                    </button>

                </form>
            </main>
        </div>
    );
}
