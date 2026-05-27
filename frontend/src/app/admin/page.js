'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shop_admin_token');
    if (!token) {
      router.push('/admin/login');
      // Keep checking true so we don't flash content before redirect
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminDashboard onTabChange={(tab) => { if (tab === 'home') router.push('/'); }} />
    </div>
  );
}
