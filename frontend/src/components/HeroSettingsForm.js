import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HeroSettingsForm({ user }) {
  const [heroSettings, setHeroSettings] = useState({
    hero_badge: 'Summer Sale',
    hero_title: '50% OFF',
    hero_feature1_title: 'Free',
    hero_feature1_subtitle: 'Shipping Over $100',
    hero_feature2_title: '30 Days',
    hero_feature2_subtitle: 'Return & Money Back',
    hero_image: '',
    hero_feature1_image: '',
    hero_feature2_image: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFeature1, setUploadingFeature1] = useState(false);
  const [uploadingFeature2, setUploadingFeature2] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/settings/hero`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setHeroSettings(data);
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setHeroSettings({ ...heroSettings, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setHeroSettings({ ...heroSettings, hero_image: data.image });
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFeatureImageUpload = async (e, featureNumber) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const setUploading = featureNumber === 1 ? setUploadingFeature1 : setUploadingFeature2;
    const fieldName = featureNumber === 1 ? 'hero_feature1_image' : 'hero_feature2_image';

    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setHeroSettings(prev => ({ ...prev, [fieldName]: data.image }));
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(heroSettings),
      });
      if (res.ok) {
        alert('Hero settings saved successfully!');
      } else {
        alert('Failed to save hero settings');
      }
    } catch (err) {
      alert('Error saving hero settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 p-6 border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 space-y-4 shadow-xl mb-6">
      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Hero Section Fallback UI Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Badge Text (e.g., Summer Sale)</label>
          <input type="text" name="hero_badge" value={heroSettings.hero_badge} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Title Text (e.g., 50% OFF)</label>
          <input type="text" name="hero_title" value={heroSettings.hero_title} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 1 Title (e.g., Free)</label>
          <input type="text" name="hero_feature1_title" value={heroSettings.hero_feature1_title} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 1 Subtitle</label>
          <input type="text" name="hero_feature1_subtitle" value={heroSettings.hero_feature1_subtitle} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 2 Title (e.g., 30 Days)</label>
          <input type="text" name="hero_feature2_title" value={heroSettings.hero_feature2_title} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 2 Subtitle</label>
          <input type="text" name="hero_feature2_subtitle" value={heroSettings.hero_feature2_subtitle || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        
        {/* Feature 1 Image */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 1 Image (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => handleFeatureImageUpload(e, 1)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {uploadingFeature1 && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          {heroSettings.hero_feature1_image && (
            <div className="mt-2 relative inline-block">
              <img src={heroSettings.hero_feature1_image.startsWith('http') ? heroSettings.hero_feature1_image : `${API_URL}${heroSettings.hero_feature1_image}`} alt="Feature 1" className="h-16 rounded-lg object-contain bg-slate-100 border border-slate-200" />
              <button type="button" onClick={() => setHeroSettings({ ...heroSettings, hero_feature1_image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600">×</button>
            </div>
          )}
        </div>

        {/* Feature 2 Image */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Feature 2 Image (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => handleFeatureImageUpload(e, 2)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {uploadingFeature2 && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          {heroSettings.hero_feature2_image && (
            <div className="mt-2 relative inline-block">
              <img src={heroSettings.hero_feature2_image.startsWith('http') ? heroSettings.hero_feature2_image : `${API_URL}${heroSettings.hero_feature2_image}`} alt="Feature 2" className="h-16 rounded-lg object-contain bg-slate-100 border border-slate-200" />
              <button type="button" onClick={() => setHeroSettings({ ...heroSettings, hero_feature2_image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600">×</button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">Promo Image (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {uploadingImage && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          {heroSettings.hero_image && (
            <div className="mt-2 relative inline-block">
              <img src={heroSettings.hero_image.startsWith('http') ? heroSettings.hero_image : `${API_URL}${heroSettings.hero_image}`} alt="Promo" className="h-24 rounded-lg object-contain bg-slate-100 border border-slate-200" />
              <button type="button" onClick={() => setHeroSettings({ ...heroSettings, hero_image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600">×</button>
            </div>
          )}
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button type="button" onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50">
          <Save size={15} />
          {loading ? 'Saving...' : 'Save Hero Settings'}
        </button>
      </div>
    </div>
  );
}
