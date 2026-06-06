"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-black/5 rounded-custom-sm ${className}`}
    />
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-panel p-8 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="w-14 h-14 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <SkeletonBlock className="h-4 w-1/4" />
            <SkeletonBlock className="h-8 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PersonProfileSkeleton() {
  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Header Profile Summary */}
      <div className="glass-panel p-10 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <SkeletonBlock className="w-24 h-24 rounded-full border-4 border-white shadow-sm" />
          <div className="flex flex-col gap-3 items-center md:items-start">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-5 w-36" />
          </div>
        </div>
        <SkeletonBlock className="w-28 h-28 rounded-full" />
      </div>

      {/* Two Column details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel p-8 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col gap-4">
            <SkeletonBlock className="h-6 w-1/3" />
            <SkeletonBlock className="h-4 w-full mt-2" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4" />
          </div>
          <div className="glass-panel p-8 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col gap-4">
            <SkeletonBlock className="h-6 w-1/3" />
            <div className="flex flex-col gap-4 mt-4">
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="glass-panel p-8 rounded-custom-lg border border-white/40 shadow-premium-soft flex flex-col gap-4">
            <SkeletonBlock className="h-6 w-1/2" />
            <div className="flex flex-col gap-3 mt-4">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-5/6" />
              <SkeletonBlock className="h-5 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
