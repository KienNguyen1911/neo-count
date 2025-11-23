import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

// --- CONFIGURATION ---
const ITEM_HEIGHT = 48; // Height of a single item in pixels
const VISIBLE_ITEMS = 5; // How many items to show (must be odd for centering)
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
// Padding calculations to ensure the first/last item can snap to center
// The center line is at CONTAINER_HEIGHT / 2
// The item center is at ITEM_HEIGHT / 2
// So padding top/bottom needs to be: (CONTAINER_HEIGHT / 2) - (ITEM_HEIGHT / 2)
const PADDING_Y = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

interface ScrollPickerProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const ScrollColumn: React.FC<ScrollPickerProps> = ({ items, value, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Initial scroll position
  useEffect(() => {
    const index = items.indexOf(value);
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTop = index * ITEM_HEIGHT;
      setHighlightedIndex(index);
    }
  }, [value, items]); // Only re-run if external value changes significantly

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    
    // Clamp index
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (clampedIndex !== highlightedIndex) {
      setHighlightedIndex(clampedIndex);
    }

    // Debounced onChange to prevent state thrashing while scrolling rapidly
    // Real "selection" happens when scroll ends visually, but we update state for UI feedback
    if (!isScrolling.current) {
       // Optional: Add debounce logic here if performance suffers
    }
  };
  
  // Snap confirmation on scroll end
  const handleScrollEnd = () => {
     const selectedItem = items[highlightedIndex];
     if (selectedItem && selectedItem !== value) {
        onChange(selectedItem);
     }
  };

  // Determine styles for 3D effect based on distance from center
  const getItemStyle = (index: number) => {
    const distance = Math.abs(index - highlightedIndex);
    const isSelected = index === highlightedIndex;
    
    return cn(
      "h-[48px] flex items-center justify-center transition-all duration-200 select-none cursor-pointer",
      isSelected ? "text-neo-black font-black text-2xl scale-110" : "text-gray-400 font-medium text-lg scale-95",
      distance > 2 ? "opacity-20" : distance > 1 ? "opacity-40" : distance > 0 ? "opacity-70" : "opacity-100"
    );
  };

  return (
    <div className="flex flex-col items-center">
      {label && <span className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>}
      <div className="relative border-2 border-neo-black bg-neo-white rounded-lg overflow-hidden shadow-neo-sm">
        
        {/* Selection Highlight (The "Glass" over the center) */}
        <div 
          className="absolute left-0 right-0 z-10 pointer-events-none border-y-2 border-neo-black/10 bg-neo-yellow/20"
          style={{ 
            height: ITEM_HEIGHT, 
            top: PADDING_Y 
          }}
        />

        {/* Scroll Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseUp={handleScrollEnd}
          onTouchEnd={handleScrollEnd}
          // We use onScroll capture for real-time updates but logic relies on CSS snapping
          className="overflow-y-scroll no-scrollbar scroll-smooth w-20"
          style={{
            height: CONTAINER_HEIGHT,
            scrollSnapType: 'y mandatory',
            paddingTop: PADDING_Y,
            paddingBottom: PADDING_Y,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item}
              onClick={() => {
                 if(containerRef.current) {
                    containerRef.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
                    onChange(item);
                 }
              }}
              className={getItemStyle(i)}
              style={{ scrollSnapAlign: 'center' }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const ScrollDatePicker: React.FC<DatePickerProps> = ({ date, onDateChange }) => {
  
  // Memoize arrays
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  }, []);

  // Helpers to update specific parts of the date
  const updateDate = (type: 'month' | 'day' | 'year', val: string) => {
    const newDate = new Date(date);
    if (type === 'month') newDate.setMonth(parseInt(val) - 1);
    if (type === 'day') newDate.setDate(parseInt(val));
    if (type === 'year') newDate.setFullYear(parseInt(val));
    onDateChange(newDate);
  };

  const currentMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const currentDay = date.getDate().toString().padStart(2, '0');
  const currentYear = date.getFullYear().toString();

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-2 border-neo-black border-dashed rounded-xl">
      <ScrollColumn 
        label="Month" 
        items={months} 
        value={currentMonth} 
        onChange={(v) => updateDate('month', v)} 
      />
      <div className="pt-6 font-black text-2xl text-neo-black">/</div>
      <ScrollColumn 
        label="Day" 
        items={days} 
        value={currentDay} 
        onChange={(v) => updateDate('day', v)} 
      />
      <div className="pt-6 font-black text-2xl text-neo-black">/</div>
      <ScrollColumn 
        label="Year" 
        items={years} 
        value={currentYear} 
        onChange={(v) => updateDate('year', v)} 
      />
    </div>
  );
};
