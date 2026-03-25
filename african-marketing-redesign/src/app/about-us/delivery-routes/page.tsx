import { Truck } from "lucide-react";

export default function DeliveryRoutesPage() {
  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-white shadow-xl shadow-brand-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-stone-100">
          <Truck className="w-10 h-10 text-brand-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8">Nationwide Delivery</h1>
        <p className="text-xl text-stone-600 leading-relaxed font-light mb-8 shadow-sm bg-white p-8 rounded-2xl border border-stone-100">
          We bring a comprehensive basket of quality products right to the “door-step” of the customer all over Namibia. Our massive fleet of temperature-controlled vehicles ensure that the best quality is perfectly retained upon delivery.
        </p>
      </div>
    </div>
  );
}
