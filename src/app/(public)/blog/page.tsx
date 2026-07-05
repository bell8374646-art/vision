'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Search, Calendar, User, ArrowRight, Rss } from 'lucide-react';

export default function BlogListPage() {
  const { blogPosts, fetchBlogPosts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const categories = ['All', 'Technology', 'Staking', 'Presale'];

  // Client-side filter
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      post.category.toLowerCase() === selectedCategory.toLowerCase();
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Rss className="w-4 h-4" /> Announcements & Tech Insights
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          VISION Technical Journal
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Insights into zero-knowledge rendering proofs, decentralized GPU pooling networks, and network growth milestones.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 border glass-panel border-white/10 rounded-2xl bg-black/40">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-vision-cyan transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'border-vision-cyan text-vision-cyan bg-vision-cyan/5'
                  : 'border-white/5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of articles */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm italic">
          No articles match your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="p-6 border glass-panel border-white/10 rounded-2xl flex flex-col justify-between h-full bg-black/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-vision-cyan font-bold uppercase tracking-wider">{post.category}</span>
                  <span className="text-gray-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white hover:text-vision-cyan transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-4">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 mt-6 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> By {post.author}
                </span>
                
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-vision-cyan transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

    </div>
  );
}
