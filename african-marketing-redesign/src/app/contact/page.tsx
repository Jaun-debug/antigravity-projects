import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Let's Talk</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">Become a Customer</h1>
          <p className="text-lg text-stone-600 leading-relaxed font-light">
            We love a challenge. Our basket is constantly adapted according to customer demand. Get in touch with us to set up an account and start ordering today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Form Side */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Send us a message</h2>
            <form className="flex flex-col gap-6" action="#">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-stone-700">First Name *</label>
                  <input type="text" id="firstName" className="p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-stone-400" placeholder="John" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-stone-700">Last Name *</label>
                  <input type="text" id="lastName" className="p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-stone-400" placeholder="Doe" required />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="company" className="text-sm font-medium text-stone-700">Company Name</label>
                <input type="text" id="company" className="p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-stone-400" placeholder="Your Business Ltd." />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-stone-700">Email Address *</label>
                <input type="email" id="email" className="p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-stone-400" placeholder="john@example.com" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-stone-700">Message / Inquiry *</label>
                <textarea id="message" rows={5} className="p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y placeholder:text-stone-400" placeholder="How can we help your business?" required></textarea>
              </div>

              <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-brand-900/20 mt-2">
                Submit Inquiry
              </button>
            </form>
          </div>

          {/* Details Side */}
          <div className="flex flex-col gap-12 pt-8">
            
            <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-xl font-serif font-bold mb-6">Windhoek (Head Office)</h3>
               <ul className="flex flex-col gap-5 text-stone-300">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center shrink-0 text-brand-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block mb-1">Address</span>
                      5 von Braun Street, Southern Industria<br />Windhoek
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center shrink-0 text-brand-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block mb-1">Phone</span>
                      +264 83 3383 800
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center shrink-0 text-brand-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block mb-1">Email</span>
                      info@african-marketing.com
                    </div>
                  </li>
               </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
               <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Walvis Bay Branch</h3>
               <ul className="flex flex-col gap-5 text-stone-600">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 text-brand-600 border border-stone-100">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-1">Address</span>
                      Corner of 12th Street & Circumferential Road<br />Walvis Bay
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 text-brand-600 border border-stone-100">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-1">Phone</span>
                      +264 83 3383 800
                    </div>
                  </li>
               </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
