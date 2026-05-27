'use client';

import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '@/context/ShopContext';
import { FileText, ArrowLeft, Calendar, User } from 'lucide-react';

export default function CustomPageView({ slug, onBackToHome }) {
  const { API_URL } = useContext(ShopContext);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/pages/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Page not found or unable to load.');
        }
        return res.json();
      })
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, API_URL]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-bold">Loading page content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full">
          <FileText size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">{error || "The page you are looking for doesn't exist or is not published yet."}</p>
        <button
          onClick={onBackToHome}
          className="px-6 py-2.5 bg-blue-600 text-white font-black rounded-xl text-sm transition hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb / Back Button */}
      <button
        onClick={onBackToHome}
        className="mb-8 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 hover:text-slate-900 transition inline-flex items-center gap-1.5 shadow-xs"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {page.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 border-b border-slate-100 pb-6">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-slate-400" />
              Published: {new Date(page.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <User size={14} className="text-slate-400" />
              Author: Admin
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div 
          className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed sm:text-base space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
