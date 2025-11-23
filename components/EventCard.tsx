import React, { useEffect, useState } from 'react';
import { CountdownEvent, CATEGORY_COLORS } from '../types';
import { calculateTimeLeft, cn } from '../lib/utils';
import { Trash2, Edit2 } from 'lucide-react';

interface EventCardProps {
  event: CountdownEvent;
  onDelete: (id: string) => void;
  onEdit: (event: CountdownEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(event.targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(event.targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.targetDate]);

  const colorClass = CATEGORY_COLORS[event.color] || CATEGORY_COLORS.yellow;

  return (
    <div className={cn(
      "group relative flex flex-col p-5 h-full min-h-[220px] rounded-xl border-4 border-neo-black bg-neo-white transition-all hover:-translate-y-1 hover:shadow-neo-hover shadow-neo",
    )}>
      
      {/* Top Bar */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-12 h-12 flex items-center justify-center text-2xl border-2 border-neo-black rounded-lg shadow-neo-sm", colorClass)}>
          {event.icon}
        </div>
        
        {/* Actions (Visible on hover on desktop, always visible on mobile if needed, but keeping clean) */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(event)}
            className="p-1.5 hover:bg-neo-yellow border-2 border-transparent hover:border-neo-black rounded-md transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
            className="p-1.5 hover:bg-neo-red hover:text-white border-2 border-transparent hover:border-neo-black rounded-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-end">
        <h3 className="text-xl font-bold leading-tight mb-1 truncate">{event.name}</h3>
        {event.description && (
          <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4">{event.description}</p>
        )}
        
        {/* Countdown Display */}
        <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-300">
           {timeLeft.isPast ? (
             <div className="text-center py-2 bg-gray-100 border-2 border-gray-300 rounded-lg font-bold text-gray-400">
               COMPLETED
             </div>
           ) : (
             <div className="grid grid-cols-4 gap-1 text-center">
                <TimeBox val={timeLeft.days} label="DAYS" highlight />
                <TimeBox val={timeLeft.hours} label="HRS" />
                <TimeBox val={timeLeft.minutes} label="MIN" />
                <TimeBox val={timeLeft.seconds} label="SEC" />
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const TimeBox: React.FC<{ val: number, label: string, highlight?: boolean }> = ({ val, label, highlight }) => (
  <div className="flex flex-col items-center">
    <span className={cn(
      "text-2xl font-black leading-none",
      highlight ? "text-neo-black" : "text-gray-800"
    )}>
      {val}
    </span>
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
  </div>
);