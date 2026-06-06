"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'default';
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'default',
  delay = 0,
}: StatCardProps) {
  const colorMap = {
    blue: 'text-accent-blue bg-accent-blue/10',
    green: 'text-accent-green bg-accent-green/10',
    orange: 'text-accent-orange bg-accent-orange/10',
    red: 'text-accent-red bg-accent-red/10',
    default: 'text-black bg-black/5',
  };

  return (
    <GlassCard delay={delay} hoverable={true}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-text-sub uppercase tracking-wider">{title}</p>
          <h3 className="text-[38px] font-bold mt-2 text-text-main leading-tight tracking-tight">{value}</h3>
          
          {(description || trend) && (
            <div className="flex items-center gap-2 mt-3 text-[14px]">
              {trend && (
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full text-[12px] ${
                    trend.isPositive ? 'text-accent-green bg-accent-green/10' : 'text-accent-red bg-accent-red/10'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {description && <span className="text-text-sub">{description}</span>}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-custom-sm ${colorMap[color]}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </GlassCard>
  );
}
