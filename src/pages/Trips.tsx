import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Trip } from '../types';
import FeaturedTripCard from '../components/FeaturedTripCard';
import { Search, X, Compass, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Trips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search input state
  const searchInputVal = searchParams.get('search') || '';

  // Realtime subscription to trips
  useEffect(() => {
    setLoading(true);
    const tripsQuery = query(collection(db, 'trips'), orderBy('startDate', 'desc'));
    
    const unsubscribe = onSnapshot(tripsQuery, 
      (snapshot) => {
        const fetchedTrips = snapshot.docs.map(doc => ({
          ...doc.data()
        } as Trip));
        setTrips(fetchedTrips);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to trips collection:", err);
        setError("Failed to stream journeys. Check Firestore permission settings or offline status.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ search: val });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  // Filter trips based on search query
  const filteredTrips = trips.filter(trip => {
    if (!searchInputVal.trim()) return true;
    const q = searchInputVal.toLowerCase();
    return (
      trip.title?.toLowerCase().includes(q) ||
      trip.location?.toLowerCase().includes(q) ||
      trip.state?.toLowerCase().includes(q) ||
      trip.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="trips-page-container">
      {/* Header section with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-bold block mb-2">Expedition Logs</span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
          Travel Journals & Expeditions
        </h1>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          Follow my wanders through mountain passes, lush green tea valleys, and vibrant states of India. Every document is securely linked with high-fidelity storage configurations.
        </p>
      </motion.div>

      {/* Dynamic Search bar controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative max-w-md mb-12"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchInputVal}
          onChange={handleSearchChange}
          placeholder="Search by state, title, location or tags..."
          className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/30 text-white rounded-2xl text-sm transition-all placeholder-gray-500 font-sans backdrop-blur-md"
        />
        {searchInputVal && (
          <button 
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Firestore Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24" id="trips-loading">
          <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin mb-4" />
          <span className="text-gray-400 font-mono text-xs tracking-wider uppercase">Streaming journeys in real-time...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* Empty State */}
          {trips.length === 0 ? (
            <motion.div 
              key="empty-no-uploads"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
            >
              <Compass className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-white text-lg font-bold mb-2">No Journeys Discovered Yet</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                No trips have been uploaded to the Firestore catalog yet. Authenticated admins can populate trips in real-time from the dashboard workspace.
              </p>
            </motion.div>
          ) : filteredTrips.length === 0 ? (
            <motion.div 
              key="empty-no-search-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto backdrop-blur-md shadow-2xl"
            >
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-bold mb-2">No Matching Expeditions</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We couldn't find any journeys matching "<span className="text-[#00E5FF] font-medium">{searchInputVal}</span>". Try refining your search query.
              </p>
              <button 
                onClick={clearSearch}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs uppercase font-mono tracking-wider font-bold rounded-xl border border-white/10 transition-all"
              >
                Reset Search Filters
              </button>
            </motion.div>
          ) : (
            /* Trips Grid showing the fetched real-time trips */
            <motion.div 
              key="trips-grid-present"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredTrips.map((trip) => (
                <FeaturedTripCard key={trip.id} trip={trip} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

