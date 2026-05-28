'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { ShopContext, getImageUrl, formatPrice } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, ShoppingCart, Send, X, AlertCircle, ArrowLeft } from 'lucide-react';

const getYouTubeId = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  // Try clean URL matching
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  if (match && match[2] && match[2].trim().length === 11) {
    return match[2].trim();
  }
  
  // Robust search query parameter / pathname parsing fallback
  try {
    const urlObj = new URL(cleanUrl);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname.startsWith('/shorts/')) {
        return urlObj.pathname.split('/')[2];
      }
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.substring(1);
    }
  } catch (err) {}
  
  return null;
};

export default function VideoReelsView({ onBackToHome, onBuyNow }) {
  const { API_URL, addToCart, currencySymbol } = useContext(ShopContext);
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  
  // Interactive stats states (per video id)
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});
  const [shares, setShares] = useState({});
  
  // Comments drawer states
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  // Infinite Scroll & Play/Pause states
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [pausedVideos, setPausedVideos] = useState({});
  const videoRefs = useRef({});
  const iframeRefs = useRef({});
  const reelRefs = useRef({});
  const originalVideosCountRef = useRef(0);

  // Fetch videos on mount
  useEffect(() => {
    fetch(`${API_URL}/videos`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setVideos(data || []);
        originalVideosCountRef.current = (data || []).length;
        if (data && data.length > 0) {
          setActiveVideoId(data[0]._id);
        }
        
        // Initialize likes and shares maps
        const likesMap = {};
        const sharesMap = {};
        const commentsMap = {};
        data.forEach((vid) => {
          likesMap[vid._id] = vid.likes || 0;
          sharesMap[vid._id] = vid.shares || 0;
          commentsMap[vid._id] = vid.comments || [];
        });
        setLikes(likesMap);
        setShares(sharesMap);
        setComments(commentsMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  // Scroll handler for infinite TikTok loop
  const handleContainerScroll = (e) => {
    const container = e.target;
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 300) {
      setVideos((prev) => {
        const originalList = prev.slice(0, originalVideosCountRef.current);
        return [
          ...prev,
          ...originalList.map((v) => ({
            ...v,
            _id: `${v._id}-loop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          }))
        ];
      });
    }
  };

  // IntersectionObserver for video autoplaying & pausing on scroll
  useEffect(() => {
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.dataset.videoid;
          const url = entry.target.dataset.videourl;
          const ytId = getYouTubeId(url);

          if (entry.isIntersecting) {
            setActiveVideoId(videoId);
            
            if (!pausedVideos[videoId]) {
              if (ytId) {
                const iframe = iframeRefs.current[videoId];
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }
              } else {
                const video = videoRefs.current[videoId];
                if (video) {
                  video.play().catch(() => {});
                }
              }
            }
          } else {
            if (ytId) {
              const iframe = iframeRefs.current[videoId];
              if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
              }
            } else {
              const video = videoRefs.current[videoId];
              if (video) {
                video.pause();
              }
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    videos.forEach((vid) => {
      const el = reelRefs.current[vid._id];
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos, pausedVideos]);

  const togglePlayPause = (videoId) => {
    const isCurrentlyPaused = !!pausedVideos[videoId];
    setPausedVideos((prev) => ({ ...prev, [videoId]: !isCurrentlyPaused }));
    
    const targetVid = videos.find((v) => v._id === videoId);
    if (!targetVid) return;

    const ytId = getYouTubeId(targetVid.videoUrl);
    if (ytId) {
      const iframe = iframeRefs.current[videoId];
      if (iframe && iframe.contentWindow) {
        const command = isCurrentlyPaused ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), '*');
      }
    } else {
      const video = videoRefs.current[videoId];
      if (video) {
        if (isCurrentlyPaused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    }
  };

  const handleLike = async (videoId) => {
    if (liked[videoId]) return; // Already liked in this session
    
    // Optimistic UI update
    setLikes((prev) => ({ ...prev, [videoId]: (prev[videoId] || 0) + 1 }));
    setLiked((prev) => ({ ...prev, [videoId]: true }));

    try {
      await fetch(`${API_URL}/videos/${videoId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleShare = async (videoId) => {
    setShares((prev) => ({ ...prev, [videoId]: (prev[videoId] || 0) + 1 }));
    try {
      await fetch(`${API_URL}/videos/${videoId}/share`, { method: 'POST' });
      navigator.clipboard.writeText(window.location.href);
      alert(t('linkCopied'));
    } catch {}
  };

  const openComments = (videoId) => {
    setCurrentVideoId(videoId);
    setCommentDrawerOpen(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentVideoId) return;

    const commentText = newComment;
    setNewComment('');

    // Optimistic update
    const guestComment = { _id: `temp-${Date.now()}`, name: 'Guest User', comment: commentText, createdAt: new Date() };
    setComments((prev) => ({
      ...prev,
      [currentVideoId]: [...(prev[currentVideoId] || []), guestComment]
    }));

    try {
      const res = await fetch(`${API_URL}/videos/${currentVideoId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Guest User', comment: commentText }),
      });
      if (res.ok) {
        const updatedVideo = await res.json();
        setComments((prev) => ({
          ...prev,
          [currentVideoId]: updatedVideo.comments || []
        }));
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="h-[90vh] bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        <p className="text-sm font-bold opacity-75">{t('loadingVideos')}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-[90vh] bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="absolute top-4 left-4 z-40 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 active:scale-90 transition"
            title={t('backToHome')}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <AlertCircle size={48} className="text-slate-500" />
        <h3 className="text-lg font-black">{t('noVideosAvailable')}</h3>
        <p className="text-xs text-slate-400 max-w-xs">{t('noVideosNote')}</p>
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-black text-white relative overflow-hidden flex justify-center">
      {/* Back Button */}
      {onBackToHome && (
        <button 
          onClick={onBackToHome}
          className="absolute top-4 left-4 z-40 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 active:scale-90 transition"
          title={t('backToHome')}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Mute controller banner at top */}
      <button 
        onClick={() => setMuted(!muted)}
        className="absolute top-4 right-4 z-40 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/60 active:scale-90 transition"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Vertical Reels Container */}
      <div 
        onScroll={handleContainerScroll}
        className="w-full max-w-[480px] h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative bg-neutral-950"
      >
        {videos.map((vid) => {
          const prod = vid.product;
          const finalPrice = prod ? prod.price * (1 - (prod.discountPercent || 0) / 100) : 0;
          return (
            <div 
              key={vid._id} 
              ref={(el) => { reelRefs.current[vid._id] = el; }}
              data-videoid={vid._id}
              data-videourl={vid.videoUrl}
              className="w-full h-full snap-start snap-always relative flex flex-col justify-end"
            >
              {/* Play/Pause Overlay Click Trigger */}
              <div 
                onClick={() => togglePlayPause(vid._id)} 
                className="absolute inset-0 z-10 cursor-pointer"
              />

              {/* Visual Pause Icon overlay */}
              {pausedVideos[vid._id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                  <div className="p-4 bg-black/60 rounded-full animate-pulse">
                    <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Video Player (HTML Video or YouTube Embed) */}
              {(() => {
                const ytId = getYouTubeId(vid.videoUrl);
                if (ytId) {
                  return (
                    <iframe
                      ref={(el) => { iframeRefs.current[vid._id] = el; }}
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    ref={(el) => { videoRefs.current[vid._id] = el; }}
                    src={vid.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    autoPlay
                    playsInline
                    muted={muted}
                  />
                );
              })()}
              
              {/* Dark Gradient bottom shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

              {/* Sidebar Action Buttons overlay */}
              <div className="absolute right-3.5 bottom-32 z-20 flex flex-col gap-5 items-center">
                
                {/* Like Action */}
                <button 
                  onClick={() => handleLike(vid._id)}
                  className="flex flex-col items-center gap-1 group active:scale-75 transition-transform duration-200"
                >
                  <div className={`p-3 rounded-full backdrop-blur-md transition ${liked[vid._id] ? 'bg-red-500 text-white' : 'bg-black/35 border border-white/10 hover:bg-black/50'}`}>
                    <Heart size={22} fill={liked[vid._id] ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-shadow-sm">{likes[vid._id] || 0}</span>
                </button>

                {/* Comment Action */}
                <button 
                  onClick={() => openComments(vid._id)}
                  className="flex flex-col items-center gap-1 group active:scale-75 transition"
                >
                  <div className="p-3 bg-black/35 border border-white/10 backdrop-blur-md rounded-full hover:bg-black/50 transition">
                    <MessageCircle size={22} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-shadow-sm">{(comments[vid._id] || []).length}</span>
                </button>

                {/* Share Action */}
                <button 
                  onClick={() => handleShare(vid._id)}
                  className="flex flex-col items-center gap-1 group active:scale-75 transition"
                >
                  <div className="p-3 bg-black/35 border border-white/10 backdrop-blur-md rounded-full hover:bg-black/50 transition">
                    <Share2 size={22} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-shadow-sm">{shares[vid._id] || 0}</span>
                </button>

              </div>

              {/* Bottom Details & Tagged Product Overlay */}
              <div className="w-full p-4 z-20 space-y-4">
                
                {/* Title & description */}
                <div className="space-y-1 bg-black/10 p-2 rounded-xl backdrop-blur-xs max-w-[80%]">
                  <h4 className="font-extrabold text-sm text-white line-clamp-1">{vid.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{vid.description}</p>
                </div>

                {/* Tagged Product Box */}
                {prod && (
                  <div className="w-full bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xl">
                    <div className="flex gap-2.5 items-center">
                      <img 
                        src={getImageUrl(prod.image)} 
                        alt={prod.name} 
                        className="w-12 h-12 object-cover rounded-xl bg-white flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white line-clamp-1">{prod.name}</div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-amber-400">{formatPrice(finalPrice, currencySymbol)}</span>
                          {prod.discountPercent > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">{formatPrice(prod.price, currencySymbol)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onBuyNow ? onBuyNow(prod, 1) : addToCart(prod, 1)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl transition flex items-center gap-1 flex-shrink-0 active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                      <ShoppingCart size={12} />
                      {t('buyNow')}
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Comments overlay drawer (bottom sheet) */}
      {commentDrawerOpen && currentVideoId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setCommentDrawerOpen(false)} />
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl w-full max-w-[480px] mx-auto h-[60%] flex flex-col justify-between relative z-10 p-5 shadow-2xl animate-fade-in">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <span className="font-extrabold text-sm text-slate-200">{t('comments')} ({(comments[currentVideoId] || []).length})</span>
              <button 
                onClick={() => setCommentDrawerOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {(comments[currentVideoId] || []).map((c, i) => (
                <div key={i} className="text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-400">{c.name}</span>
                    <span className="text-[9px] text-slate-500">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">{c.comment}</p>
                </div>
              ))}
              {(comments[currentVideoId] || []).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
                  {t('noComments')}
                </div>
              )}
            </div>

            {/* Write comment input */}
            <form onSubmit={handleAddComment} className="mt-3 flex gap-2 border-t border-slate-800 pt-3">
              <input 
                type="text" 
                placeholder={t('writeCommentPlaceholder')} 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition flex items-center justify-center"
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
