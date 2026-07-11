import React from 'react';
import { motion } from 'motion/react';
import { Compass, Camera, Heart, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="about-page-container">
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-left"
      >
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-bold block mb-2">The Explorer</span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
          About Shubham Nagvanshi
        </h1>
        <p className="text-gray-400 max-w-2xl leading-relaxed">
          A passionate traveler, landscape photographer, and chronicler documenting the mesmerizing beauty of Indian landscapes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Biography Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl"
        >
          <h2 className="text-xl font-bold text-[#00E5FF] mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#00E5FF]" /> My Mission
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            I travel not just to tick off destinations, but to experience the diverse cultures, landscapes, and stories that make up the rich heritage of India. From the snow-capped Himalayan ridges in Himachal and Kashmir to the lush, wet green living-root bridges of Meghalaya, I seek out the authentic and off-beat.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Through this platform, I share raw video logs, high-fidelity landscape photographs, and curated travel itineraries so other adventure seekers can confidently plan their own expeditions. Everything you see here is dynamic, synced instantly using standard cloud-storage integrations.
          </p>
        </motion.div>

        {/* Quick Specs and Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00E5FF]" /> Gear & Focus
          </h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex gap-2 items-start">
              <span className="text-[#00E5FF] font-bold">✓</span>
              <div>
                <strong className="text-white">Aesthetic Focus:</strong> High-altitude alpine ridges, deep rainforests, and ethnic cultures.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-[#00E5FF] font-bold">✓</span>
              <div>
                <strong className="text-white">Imaging Rig:</strong> Sony Alpha series mirrorless bodies paired with G-Master prime glass.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-[#00E5FF] font-bold">✓</span>
              <div>
                <strong className="text-white">Motion Capture:</strong> 4K cinematic reels and drone sweeps for high scale altitude shots.
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

