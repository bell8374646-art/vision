import React from 'react';
import { readDb } from '@/data/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Simple Markdown Parser for styling blog bodies without heavy npm packages
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.JSX.Element[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  
  lines.forEach((line, index) => {
    // Fenced Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${index}`} className="p-4 rounded-xl bg-black/60 border border-white/5 overflow-x-auto font-mono text-xs text-vision-cyan leading-relaxed my-4">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      } else {
        inCodeBlock = true;
      }
      return;
    }
    
    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();
    
    // Headers (##)
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-6 mb-3">
          {trimmed.substring(3)}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-white tracking-tight mt-4 mb-2">
          {trimmed.substring(4)}
        </h3>
      );
      return;
    }

    // Unordered List Items (*)
    if (trimmed.startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-4 list-disc text-sm text-gray-300 leading-relaxed mb-1.5">
          {trimmed.substring(2)}
        </li>
      );
      return;
    }

    // Standard Paragraphs
    if (trimmed !== '') {
      elements.push(
        <p key={index} className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }
  });

  return elements;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const db = await readDb();
  
  const post = db.blogPosts.find((p) => p.slug === slug);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-vision-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Article Header Card */}
      <div className="p-6 sm:p-8 border glass-panel border-white/10 rounded-2xl bg-black/40 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="text-[10px] font-bold text-vision-cyan border border-vision-cyan/30 px-2.5 py-0.5 rounded-full uppercase bg-vision-cyan/5">
            {post.category}
          </span>
          
          <div className="flex items-center gap-4 text-gray-500 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              5 min read
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-white/5 pt-4">
          <div className="w-7 h-7 rounded-full bg-vision-cyan/10 border border-vision-cyan/20 flex items-center justify-center font-bold text-[10px] text-vision-cyan uppercase">
            {post.author.substring(0, 2)}
          </div>
          <span>Published by: <strong>{post.author}</strong></span>
        </div>
      </div>

      {/* Article Body */}
      <article className="px-1 py-4">
        <div className="space-y-4 prose prose-invert max-w-none">
          {renderMarkdown(post.body)}
        </div>
      </article>

      {/* Footer Card */}
      <div className="p-6 border glass-panel border-white/10 rounded-2xl bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-white">Interested in the VISION ecosystem?</h4>
          <p className="text-xs text-gray-400">Lock VSN tokens into our vaults and claim continuous rewards.</p>
        </div>
        <Link
          href="/staking"
          className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-vision text-black hover:opacity-90 transition-opacity"
        >
          Open Staking Vaults
        </Link>
      </div>

    </div>
  );
}
