'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import AdminLoginForm from '@/components/AdminLoginForm';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shop_admin_token');
    if (token) {
      setAuthorized(true);
    }
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authorized) {
    return <AdminLoginForm onSuccess={() => { setAuthorized(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminDashboard onTabChange={(tab) => { if (tab === 'home') router.push('/'); }} />
    </div>
  );
}
