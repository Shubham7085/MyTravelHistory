import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Photo } from '../types';
import { Camera, MapPin, X, Loader2, Maximize2, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SafeImage } from '../components/SafeImage';

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Realtime subscription to photos collection
  useEffect(() => {
    setLoading(true);
    const photosQuery = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(photosQuery, 
      (snapshot) => {
        const fetchedPhotos = snapshot.docs.map(doc => ({
          ...doc.data()
        } as Photo));
        setPhotos(fetchedPhotos);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to photos collection:", err);
        setError("Failed to stream gallery photos. Check connection and Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="gallery-page-container">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-left"
      >
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-bold block mb-2">Visual Memories</span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
          Photo Gallery
        </h1>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          High-resolution snapshots from our wanderings across India. Dynamically routed from connected Google Drive accounts to Firestore in real-time.
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3 text-red-400">
          <span className="font-bold text-xs font-mono">Error:</span>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24" id="gallery-loading">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin mb-4" />
          <span className="text-gray-400 font-mono text-xs tracking-wider uppercase">Loading photography collection...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {photos.length === 0 ? (
            /* Empty State */
            <motion.div 
              key="empty-gallery"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
            >
              <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-white text-lg font-bold mb-2">No Visuals Captured Yet</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Our camera shutters are ready, but no photos have been synced to the database yet. Head to the Admin panel to upload and sync snapshots.
              </p>
            </motion.div>
          ) : (
            /* Pinterest-style masonry layout using CSS column-count */
            <motion.div 
              key="gallery-masonry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 [column-fill:_balance]"
            >
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="break-inside-avoid bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative group mb-4 cursor-zoom-in shadow-lg hover:border-[#00E5FF]/40 transition-all duration-300"
                >
                  {/* Photo image */}
                  <SafeImage 
                    src={photo.url} 
                    alt={photo.caption} 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-[0.9] group-hover:brightness-[1.0]"
                    loading="lazy"
                  />
                  
                  {/* Hover Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    {/* Maximize icon for affordance */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    <p className="text-white text-sm font-bold leading-tight font-sans mb-1">{photo.caption}</p>
                    <div className="flex items-center gap-1 text-gray-300 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0" />
                      <span className="truncate">{photo.location}</span>
                    </div>

                    {photo.createdAt && (
                      <span className="text-[10px] text-gray-500 font-mono mt-2 block">
                        {new Date(photo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Immersive Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-zoom-out"
            id="lightbox-backdrop"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all z-10"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl w-full flex flex-col items-center cursor-default"
            >
              <div className="relative bg-white/5 border border-white/10 p-2 rounded-3xl overflow-hidden max-h-[75vh] flex items-center justify-center shadow-2xl">
                <SafeImage 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption} 
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-full object-contain rounded-2xl"
                />
              </div>

              {/* Caption details bottom sheet */}
              <div className="w-full max-w-2xl mt-6 text-center">
                <h3 className="text-white text-xl font-bold tracking-tight mb-2">
                  {selectedPhoto.caption}
                </h3>
                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#00E5FF]" />
                    {selectedPhoto.location}
                  </span>
                  {selectedPhoto.createdAt && (
                    <span className="flex items-center gap-1 font-mono text-xs">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {new Date(selectedPhoto.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

