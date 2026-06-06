"use client";

import React from 'react';
import { AlertCircle, Sliders, CheckCircle2, HelpCircle, ClipboardList } from 'lucide-react';
import { Memory, MemoryType } from '@/lib/types';
import GlassCard from './GlassCard';

interface MemoryCardProps {
  memory: Memory;
  delay?: number;
}

export default function MemoryCard({ memory, delay = 0 }: MemoryCardProps) {
  const configMap: Record<
    MemoryType,
    {
      label: string;
      colorClass: string;
      bgClass: string;
      borderClass: string;
      icon: React.ReactNode;
    }
  > = {
    concern: {
      label: 'Concern',
      colorClass: 'text-accent-orange',
      bgClass: 'bg-accent-orange/10',
      borderClass: 'border-accent-orange/20',
      icon: <AlertCircle size={16} className="text-accent-orange" />,
    },
    preference: {
      label: 'Preference',
      colorClass: 'text-accent-blue',
      bgClass: 'bg-accent-blue/10',
      borderClass: 'border-accent-blue/20',
      icon: <Sliders size={16} className="text-accent-blue" />,
    },
    promise: {
      label: 'Promise',
      colorClass: 'text-accent-green',
      bgClass: 'bg-accent-green/10',
      borderClass: 'border-accent-green/20',
      icon: <CheckCircle2 size={16} className="text-accent-green" />,
    },
    request: {
      label: 'Request',
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50 border-purple-100',
      borderClass: 'border-purple-200',
      icon: <HelpCircle size={16} className="text-purple-600" />,
    },
    action_item: {
      label: 'Action Item',
      colorClass: 'text-gray-700',
      bgClass: 'bg-gray-100',
      borderClass: 'border-gray-200',
      icon: <ClipboardList size={16} className="text-gray-700" />,
    },
  };

  const config = configMap[memory.type] || configMap.action_item;

  return (
    <GlassCard hoverable={false} delay={delay} className="p-6 rounded-custom-md border-white/50 select-none">
      <div className="flex flex-col gap-4">
        {/* Memory Tag Header */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[12px] font-bold ${config.colorClass} ${config.bgClass} ${config.borderClass}`}>
            {config.icon}
            <span>{config.label}</span>
          </div>

          {/* Confidence Indicator */}
          {memory.confidence && (
            <span className="text-[11px] font-semibold text-text-sub uppercase tracking-wider">
              {Math.round(memory.confidence * 100)}% Confidence
            </span>
          )}
        </div>

        {/* Memory Statement Content */}
        <p className="text-[15px] font-semibold text-text-main leading-relaxed">
          {memory.content}
        </p>

        {/* Date Recorded */}
        {memory.created_at && (
          <span className="text-[11px] text-text-sub font-medium self-end">
            Recorded {new Date(memory.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
