import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Globe, ArrowRight, Instagram, Youtube, Send } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message features are optimized for static feedback. Your note was compiled successfully!');
  };

  return (
    <div className="pt-24 md:pt-28 pb-16 px-4 max-w-7xl mx-auto min-h-screen" id="contact-page-container">
      {/* Header section with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-[0.2em] font-bold block mb-2">Get In Touch</span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white mb-4">
          Connect With Me
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Have queries about custom routes, permissions, drone regulations, or media collabs? Drop me a line directly.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        {/* Contact info cards */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#00E5FF]" /> Email Channel
            </h3>
            <p className="text-gray-400 text-sm mb-2">For business inquiries and sponsorship opportunities:</p>
            <a href="mailto:shubhamnagvanshi84823@gmail.com" className="text-[#00E5FF] hover:underline text-sm font-mono break-all font-bold">
              shubhamnagvanshi84823@gmail.com
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00E5FF]" /> Digital Hubs
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#00E5FF]/20 border border-white/10 text-white hover:text-[#00E5FF] transition-all flex items-center justify-center"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#00E5FF]/20 border border-white/10 text-white hover:text-[#00E5FF] transition-all flex items-center justify-center"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Your Name</label>
              <input 
                type="text" 
                required
                placeholder="Enter name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/30 text-white rounded-xl text-sm transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="Enter email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/30 text-white rounded-xl text-sm transition-all font-sans"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Message</label>
              <textarea 
                rows={4}
                required
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/30 text-white rounded-xl text-sm transition-all font-sans resize-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-[#00E5FF] hover:bg-[#00B0FF] text-[#050816] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Transmission
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

