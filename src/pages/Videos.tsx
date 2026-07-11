import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Video } from '../types';
import { Video as VideoIcon, Play, Clock, X, Loader2, ArrowUpRight, ExternalLink, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SafeImage } from '../components/SafeImage';

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Realtime subscription to videos collection
  useEffect(() => {
    setLoading(true);
    const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(videosQuery, 
      (snapshot) => {
        const fetchedVideos = snapshot.docs.map(doc => ({
          ...doc.data()
        } as Video));
        setVideos(fetchedVideos);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to videos collection:", err);
        setError("Failed to stream video logs. Check connection and Firestore setup.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="videos-page-container">
      {/* Header section with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-left"
      >
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-bold block mb-2">Cinematic Logs</span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
          Atmospheric Video Journals
        </h1>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Stunning landscape reels, drone clips, and atmospheric motion journals captured across India. Synchronized instantly using our dynamic failover storage router.
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
        <div className="flex flex-col items-center justify-center py-24" id="videos-loading">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin mb-4" />
          <span className="text-gray-400 font-mono text-xs tracking-wider uppercase">Streaming video logs...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {videos.length === 0 ? (
            /* Empty State */
            <motion.div 
              key="empty-videos"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
            >
              <VideoIcon className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-white text-lg font-bold mb-2">No Cinematic Logs Found</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                There are currently no video logs published to the Firestore stream. Head to the Storage Workspace in the Admin panel to sync some dynamic clips!
              </p>
            </motion.div>
          ) : (
            /* Immersive Responsive Video Grid */
            <motion.div 
              key="videos-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  onClick={() => setSelectedVideo(video)}
                  className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative shadow-xl hover:border-[#00E5FF]/40 hover:shadow-[0_15px_35px_rgba(0,229,255,0.1)] transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Aspect Ratio 16:9 Thumbnail Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <SafeImage 
                      src={video.thumbnail || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'} 
                      alt={video.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-[0.8] group-hover:brightness-[0.95]"
                      loading="lazy"
                    />

                    {/* Black overlay mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Centered Premium Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#00E5FF] text-[#050816] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#00B0FF] transition-all duration-300">
                        <Play className="w-6 h-6 fill-[#050816] ml-1" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00E5FF]" />
                      <span>{video.duration || '0:15'}</span>
                    </div>
                  </div>

                  {/* Metadata and captions bottom strip */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-sans font-bold text-base leading-tight mb-2 group-hover:text-[#00E5FF] transition-colors duration-200 truncate">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed font-sans">
                        {video.caption || 'Cinematic drone journal synced safely on connected cloud drives.'}
                      </p>
                    </div>

                    {video.createdAt && (
                      <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                        <span>EST. SOURCE: Google Drive</span>
                        <span>{new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Immersive Cinematic Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 cursor-zoom-out"
            id="video-player-backdrop"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white transition-all z-10"
              title="Close Player"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Player Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full flex flex-col items-center cursor-default bg-[#050816]/60 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-2xl"
            >
              {/* Responsive Video Canvas with direct player support */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <video 
                  src={selectedVideo.url} 
                  controls 
                  className="w-full h-full object-contain"
                  autoPlay
                  poster={selectedVideo.thumbnail}
                >
                  Your browser does not support high-fidelity video streams.
                </video>
              </div>

              {/* Bottom Sheet description */}
              <div className="w-full mt-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[#00E5FF] font-mono text-[10px] uppercase tracking-[0.2em] font-extrabold bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                      Live Stream
                    </span>
                    <h3 className="text-white text-xl font-display font-black tracking-tight mt-2">
                      {selectedVideo.title}
                    </h3>
                  </div>

                  {/* External access button */}
                  <a 
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#00E5FF] hover:bg-[#00B0FF] text-[#050816] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Source Video
                  </a>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {selectedVideo.caption || 'Immersive motion journal synchronized in beautiful high definition from connected cloud targets.'}
                </p>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Estimated Duration: {selectedVideo.duration || '0:15'}
                  </span>
                  {selectedVideo.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      Uploaded: {new Date(selectedVideo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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

