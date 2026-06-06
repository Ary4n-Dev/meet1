"use client";

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search people, roles or companies...",
  filterOptions = [],
  selectedFilter = "All",
  onFilterChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Input container */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-6 text-text-sub" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full 
            pl-14 
            pr-12 
            py-5 
            bg-white/60 
            backdrop-blur-md 
            border 
            border-white/40 
            rounded-custom-md 
            text-[16px] 
            text-text-main
            placeholder-text-sub 
            shadow-premium-soft 
            focus:outline-none 
            focus:border-black/20 
            focus:bg-white/80 
            transition-all 
            duration-300
          "
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-6 p-1 text-text-sub hover:text-text-main transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-text-sub text-[14px] font-medium mr-2">
            <SlidersHorizontal size={14} />
            <span>Filter:</span>
          </div>
          {filterOptions.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`
                  px-5 
                  py-2 
                  rounded-full 
                  text-[14px] 
                  font-medium 
                  whitespace-nowrap 
                  transition-all 
                  duration-200
                  border
                  ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white/60 text-text-sub border-white/40 hover:bg-white/80 hover:text-text-main'
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
