import React, { useState, useEffect } from 'react';
import { CustomSheet } from './ui/CustomSheet';
import { NeoButton, NeoInput, NeoLabel } from './ui/NeoComponents';
import { ScrollDatePicker } from './ScrollDatePicker';
import { CountdownEvent, DEFAULT_ICONS, CATEGORY_COLORS } from '../types';
import { cn } from '../lib/utils';
import { Sparkles } from 'lucide-react';

interface AddEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CountdownEvent>) => void;
  initialData?: CountdownEvent | null;
}

export const AddEventDrawer: React.FC<AddEventDrawerProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState<keyof typeof CATEGORY_COLORS>('yellow');

  // Reset or Load Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setDate(new Date(initialData.targetDate));
        setSelectedIcon(initialData.icon);
        setSelectedColor(initialData.color);
      } else {
        setName('');
        setDescription('');
        setDate(new Date());
        setSelectedIcon(DEFAULT_ICONS[0]);
        setSelectedColor('yellow');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      name,
      description,
      targetDate: date.toISOString(),
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  return (
    <CustomSheet isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Countdown" : "New Countdown"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-28 md:pb-24">
        
        {/* Name Section */}
        <div className="space-y-4">
          <div>
            <NeoLabel htmlFor="name">Event Name</NeoLabel>
            <NeoInput 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Bali Trip"
              required
              autoFocus
            />
          </div>

           <div>
            <NeoLabel htmlFor="description">Description (Optional)</NeoLabel>
            <div className="relative">
              <NeoInput 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Details about the event..."
              />
               <div className="absolute right-2 top-2">
                 {/* Visual hint of AI integration, fully functional placeholder */}
                 <button type="button" className="p-1 hover:bg-neo-purple/20 rounded-md transition-colors text-neo-purple" title="Generate with AI">
                    <Sparkles className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Custom Wheel Date Picker */}
        <div>
          <NeoLabel>Target Date</NeoLabel>
          <ScrollDatePicker date={date} onDateChange={setDate} />
        </div>

        {/* Styling Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Icons */}
          <div>
            <NeoLabel>Icon</NeoLabel>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all",
                    selectedIcon === icon 
                      ? "bg-neo-black border-neo-black text-white shadow-neo-sm translate-x-[1px] translate-y-[1px]" 
                      : "bg-white border-gray-200 hover:border-neo-black hover:shadow-sm"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <NeoLabel>Color Theme</NeoLabel>
            <div className="flex gap-3">
              {(Object.keys(CATEGORY_COLORS) as Array<keyof typeof CATEGORY_COLORS>).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    CATEGORY_COLORS[color],
                    selectedColor === color ? "border-neo-black scale-125 ring-2 ring-offset-2 ring-gray-200" : "border-transparent opacity-70 hover:opacity-100 hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t-2 border-neo-black flex justify-center z-50 md:absolute">
           <NeoButton type="submit" className="w-full md:w-auto md:min-w-[200px]">
             {initialData ? 'Update Countdown' : 'Start Countdown'}
           </NeoButton>
        </div>

      </form>
    </CustomSheet>
  );
};