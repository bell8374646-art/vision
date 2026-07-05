'use client';

import React from 'react';
import { Twitter, Github, Linkedin, ShieldCheck } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  avatarBg: string;
  twitter: string;
  github: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Arthur Pendelton",
    role: "Co-Founder & CEO",
    bio: "Former Principal Architect of GPU fabrics at NVIDIA. 15+ years experience in hardware virtualization.",
    initials: "AP",
    avatarBg: "bg-gradient-to-tr from-cyan-600 to-vision-cyan",
    twitter: "#",
    github: "#"
  },
  {
    name: "Dr. Sarah Chen",
    role: "Co-Founder & CTO",
    bio: "Ph.D. in Cryptography from MIT. Former senior researcher on zero-knowledge execution protocols.",
    initials: "SC",
    avatarBg: "bg-gradient-to-tr from-purple-600 to-vision-purple",
    twitter: "#",
    github: "#"
  },
  {
    name: "Marcus Vane",
    role: "Head of DeFi Architecture",
    bio: "Former smart contract engineering lead at Aave, specializing in yield vault design and collateral limits.",
    initials: "MV",
    avatarBg: "bg-gradient-to-tr from-blue-600 to-indigo-500",
    twitter: "#",
    github: "#"
  },
  {
    name: "Elena Rostova",
    role: "Lead GPU Compiler Architect",
    bio: "Pioneered distributed frame rendering schedules at Epic Games, leading Unreal Engine pipeline compilers.",
    initials: "ER",
    avatarBg: "bg-gradient-to-tr from-teal-600 to-emerald-400",
    twitter: "#",
    github: "#"
  }
];

export default function TeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-vision-cyan uppercase tracking-wider">Protocol Builders</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Meet the VISION Core Team
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">
          We are a team of distributed systems engineers, compiler specialists, and cryptographers focused on scaling zero-knowledge computing.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {TEAM.map((member, idx) => (
          <div key={idx} className="p-6 border glass-panel border-white/10 rounded-2xl flex flex-col items-center text-center space-y-4 bg-black/40">
            
            {/* Styled Avatar Placeholder */}
            <div className={`w-24 h-24 rounded-full ${member.avatarBg} flex items-center justify-center text-2xl font-black text-black shadow-lg border-2 border-white/10`}>
              {member.initials}
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-xs font-semibold text-vision-cyan uppercase tracking-wider">{member.role}</p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed px-2 flex-grow">
              {member.bio}
            </p>

            {/* Social handles */}
            <div className="flex gap-4 text-gray-500 pt-2">
              <a href={member.twitter} className="hover:text-vision-cyan transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={member.github} className="hover:text-vision-cyan transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-vision-cyan transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Advisory Notice */}
      <div className="flex gap-3 p-4 border glass-panel border-white/10 max-w-2xl mx-auto rounded-xl bg-white/[0.01]">
        <ShieldCheck className="w-6 h-6 text-vision-cyan flex-shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Security Protocol Note:</strong> Team members will never contact you directly requesting your seed phrases or requesting manual deposits. All pre-sales and staking must occur exclusively via the official pre-sale dashboard.
        </p>
      </div>

    </div>
  );
}
