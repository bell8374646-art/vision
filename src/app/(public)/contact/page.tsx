'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { HelpCircle, ChevronDown, Send, MessageSquare, Twitter, Github, Compass, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactAndFaqPage() {
  const { faqItems, fetchFaqsAndCms, submitContactForm } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFaqsAndCms();
  }, [fetchFaqsAndCms]);

  const categories = ['All', 'Presale', 'Staking', 'Wallet', 'KYC', 'Security'];

  const filteredFaqs = faqItems.filter((item) => {
    return selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    if (!email.includes('@') || email.length < 5) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    const success = await submitContactForm(name, email, message);
    setLoading(false);

    if (success) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setErrorMsg('Failed to log message. Please try again.');
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4" /> FAQ & Support Terminal
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Find instant answers regarding staking parameters, KYC reviews, pre-sale tokens, and distributed GPU hardware setups.
        </p>
      </div>

      {/* Main Grid: FAQ list (Left) and Contact (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* FAQ Accordion Column (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'border-vision-cyan text-vision-cyan bg-vision-cyan/5'
                    : 'border-white/5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs italic">
                No questions found in this category.
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = activeFaqId === faq.id;
                
                return (
                  <div
                    key={faq.id}
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      isOpen 
                        ? 'border-vision-cyan/30 bg-white/[0.03]' 
                        : 'border-white/5 bg-white/[0.01]'
                    }`}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-white hover:text-vision-cyan transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-vision-cyan' : ''}`} />
                    </button>

                    {/* Accordion Content */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-white/5 bg-black/40"
                        >
                          <p className="p-4 text-xs sm:text-sm text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Contact Form Column (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-vision-cyan" /> Submit a Ticket
          </h3>

          <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-6">
            {submitted ? (
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white">Ticket Submitted</h4>
                <p className="text-xs text-gray-400 leading-normal">
                  Thank you! Your message has been successfully saved in our mock database log. An administrator will review your ticket.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Message Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we assist you with staking, pre-sales, or validator node setup?"
                    className="w-full px-4 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-vision-cyan transition-colors resize-none"
                  />
                </div>

                {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-bold bg-gradient-vision text-black flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>

              </form>
            )}
          </div>
          
          {/* Social connections */}
          <div className="p-4 border glass-panel border-white/10 rounded-2xl bg-white/[0.01] flex items-center justify-around">
            <a href="#" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-vision-cyan transition-colors">
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>
            <a href="https://t.me/Vision_57" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-vision-cyan transition-colors">
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-vision-cyan transition-colors">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
