"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  animate?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className = '',
  onClick,
  hoverable = true,
  animate = true,
  delay = 0,
}: GlassCardProps) {
  const hoverVariants = hoverable && onClick
    ? { scale: 0.99, translateY: -2 }
    : hoverable
    ? { translateY: -4 }
    : {};

  const cardContent = (
    <div
      onClick={onClick}
      className={`
        glass-panel 
        rounded-custom-lg 
        p-8 
        shadow-premium-soft 
        border 
        border-white/40 
        transition-all 
        duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverable ? 'hover:shadow-premium-hover hover:border-white/60' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
        whileHover={hoverVariants}
        whileTap={onClick ? { scale: 0.97 } : undefined}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
