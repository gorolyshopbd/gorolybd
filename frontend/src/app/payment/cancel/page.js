'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
        <XCircle className="mx-auto text-red-500 w-20 h-20" />
        <h1 className="text-2xl font-black text-slate-800">Payment Cancelled</h1>
        <p className="text-slate-600 font-medium">Your payment was cancelled and your order was not processed.</p>
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Store
        </button>
      </div>
    </div>
  );
}
