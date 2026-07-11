import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Trip, Photo, Video } from '../types';
import { Compass, Calendar, MapPin, Navigation, Clock, Image, Video as VideoIcon, ArrowLeft, Loader2, AlertCircle, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SafeImage } from '../components/SafeImage';

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // 1. Subscribe to the Trip document
    const tripRef = doc(db, 'trips', id);
    const unsubTrip = onSnapshot(tripRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
          setError(null);
        } else {
          setError("This journey journal could not be located in the database.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to trip document:", err);
        setError("Database access restriction or connection timeout.");
        setLoading(false);
      }
    );

    // 2. Subscribe to Photos for this trip
    const photosQuery = query(collection(db, 'photos'), where('tripId', '==', id));
    const unsubPhotos = onSnapshot(photosQuery, (snapshot) => {
      const fetchedPhotos = snapshot.docs.map(d => ({ ...d.data() } as Photo));
      setPhotos(fetchedPhotos);
    });

    // 3. Subscribe to Videos for this trip
    const videosQuery = query(collection(db, 'videos'), where('tripId', '==', id));
    const unsubVideos = onSnapshot(videosQuery, (snapshot) => {
      const fetchedVideos = snapshot.docs.map(d => ({ ...d.data() } as Video));
      setVideos(fetchedVideos);
    });

    return () => {
      unsubTrip();
      unsubPhotos();
      unsubVideos();
    };
  }, [id]);

  const allPhotoUrls = [
    ...photos.map(p => p.url),
    ...(trip?.photos || [])
  ].filter((url, index, self) => self.indexOf(url) === index);

  const handleNextPhoto = () => {
    setActivePhotoIndex(prev => 
      prev !== null ? (prev + 1) % allPhotoUrls.length : null
    );
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex(prev => 
      prev !== null ? (prev - 1 + allPhotoUrls.length) % allPhotoUrls.length : null
    );
  };

  useEffect(() => {
    if (activePhotoIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, allPhotoUrls.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24" id="trip-details-loading">
        <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin mb-4" />
        <span className="text-gray-400 font-mono text-xs tracking-wider uppercase">Loading Journey Details...</span>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-lg mx-auto text-center min-h-screen" id="trip-details-error">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white text-lg font-bold mb-2">Journey Not Found</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {error || "The requested expedition document has been removed or is no longer reachable."}
          </p>
          <Link 
            to="/trips"
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl border border-white/10 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back To Journeys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="trip-details-container">
      {/* Back button */}
      <Link 
        to="/trips" 
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#00E5FF] text-xs font-mono uppercase tracking-wider transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Journeys
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Pane */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Hero Frame */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl group">
            <SafeImage 
              src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'} 
              alt={trip.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[#00E5FF] font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20 inline-block mb-3">
                {trip.state}
              </span>
              <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white leading-tight">
                {trip.title}
              </h1>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#00E5FF]" /> Expedition Summary
            </h2>
            <p className="text-gray-300 leading-relaxed font-sans text-sm whitespace-pre-wrap">
              {trip.description}
            </p>
          </div>

          {/* Connected Galleries */}
          {allPhotoUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-[#00E5FF]" /> Expedition Photography ({allPhotoUrls.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allPhotoUrls.map((photoUrl, index) => (
                  <div 
                    key={photoUrl} 
                    onClick={() => setActivePhotoIndex(index)}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 group shadow-lg cursor-zoom-in"
                  >
                    <SafeImage 
                      src={photoUrl} 
                      alt={`Snapshot ${index + 1}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-mono tracking-wider bg-black/60 px-3 py-1.5 rounded-full border border-white/10">VIEW FULLSCREEN</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Videos */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-[#00E5FF]" /> Expedition Cinematic Reels ({videos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map(video => (
                  <div key={video.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-[#00E5FF]/20 transition-all">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                      <SafeImage 
                        src={video.thumbnail || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=150&q=80'} 
                        alt={video.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-bold truncate">{video.title}</h4>
                      <p className="text-gray-400 text-[10px] font-mono mt-1 uppercase">EST. DURATION: {video.duration || '0:15'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Expedition Metrics
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4.5 h-4.5 text-[#00E5FF] flex-shrink-0" />
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-mono block">Base Location</span>
                  <span className="font-medium text-white">{trip.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4.5 h-4.5 text-[#00E5FF] flex-shrink-0" />
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-mono block">Departure Date</span>
                  <span className="font-medium text-white">
                    {new Date(trip.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="w-4.5 h-4.5 text-[#00E5FF] flex-shrink-0" />
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-mono block">Duration</span>
                  <span className="font-medium text-white">{trip.duration}</span>
                </div>
              </div>

              {trip.distance > 0 && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Navigation className="w-4.5 h-4.5 text-[#00E5FF] flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase font-mono block">Odyssey Distance</span>
                    <span className="font-medium text-white">{trip.distance} KM</span>
                  </div>
                </div>
              )}
            </div>

            {trip.tags && trip.tags.length > 0 && (
              <div className="border-t border-white/5 pt-4 mt-4">
                <span className="text-gray-500 text-[10px] uppercase font-mono block mb-2">Adventure Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {trip.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[10px] font-mono text-gray-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Swipe Photo Gallery */}
      <AnimatePresence>
        {activePhotoIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 select-none"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 transition-all z-50 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous Arrow */}
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 transition-all z-50 cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 transition-all z-50 cursor-pointer"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Photo Slide Wrapper */}
            <div 
              className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage 
                src={allPhotoUrls[activePhotoIndex]} 
                alt={`Slide ${activePhotoIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/5"
              />

              {/* Progress Index Badge */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
                <span className="text-white/80 font-mono text-xs font-semibold tracking-wider">
                  {activePhotoIndex + 1} / {allPhotoUrls.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

