'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const transactionId = searchParams.get('transaction_id')
      || searchParams.get('tran_id')
      || searchParams.get('trx_id')
      || searchParams.get('payment_id')
      || searchParams.get('txn_id')
      || searchParams.get('ref_id')
      || searchParams.get('id');
    const orderId = searchParams.get('orderId');

    if (!transactionId && !orderId) {
      setStatus('No transaction ID found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rupantorpay/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, orderId }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.success) {
          setSuccess(true);
          setStatus('Payment verified successfully!');
        } else {
          setStatus(data.message || 'Payment verification failed.');
        }
      } catch (err) {
        setStatus('Error verifying payment.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
      {success ? (
        <CheckCircle className="mx-auto text-emerald-500 w-20 h-20" />
      ) : (
        <XCircle className="mx-auto text-red-500 w-20 h-20" />
      )}
      <h1 className="text-2xl font-black text-slate-800">
        {success ? 'Payment Successful' : 'Payment Status'}
      </h1>
      <p className="text-slate-600 font-medium">{status}</p>
      <button
        onClick={() => router.push('/')}
        className="w-full py-3 bg-[#FF6600] text-white font-bold rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2"
      >
        Return to Store <ArrowRight size={16} />
      </button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
