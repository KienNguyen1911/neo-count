import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { NeoButton } from './components/ui/NeoComponents';
import { AddEventDrawer } from './components/AddEventDrawer';
import { EventCard } from './components/EventCard';
import { CountdownEvent } from './types';
import { AnimatePresence, motion } from 'framer-motion';

// Mock initial data
const MOCK_EVENTS: CountdownEvent[] = [
  {
    id: '1',
    name: 'Japan Trip 🇯🇵',
    description: 'Visiting Tokyo, Kyoto and Osaka.',
    targetDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
    icon: '✈️',
    color: 'red',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Product Launch',
    description: 'Q3 Feature Release',
    targetDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    icon: '🚀',
    color: 'blue',
    createdAt: new Date().toISOString(),
  }
];

export default function App() {
  const [events, setEvents] = useState<CountdownEvent[]>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem('neo-events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CountdownEvent | null>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem('neo-events', JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (eventData: Partial<CountdownEvent>) => {
    if (eventData.id) {
      // Update
      setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as CountdownEvent : e));
    } else {
      // Create
      const newEvent: CountdownEvent = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name: eventData.name!,
        targetDate: eventData.targetDate!,
        icon: eventData.icon || '📅',
        color: eventData.color || 'yellow',
        description: eventData.description
      };
      setEvents(prev => [newEvent, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const openCreate = () => {
    setEditingEvent(null);
    setIsDrawerOpen(true);
  };

  const openEdit = (event: CountdownEvent) => {
    setEditingEvent(event);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-black font-sans selection:bg-neo-yellow selection:text-black">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-30 bg-neo-bg/90 backdrop-blur-sm border-b-4 border-neo-black px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-black text-neo-white flex items-center justify-center font-bold text-xl rounded-md">N</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">NeoCount</h1>
          </div>
          <NeoButton onClick={openCreate} className="hidden md:flex gap-2">
            <Plus className="w-5 h-5" /> New Event
          </NeoButton>
          <button 
            onClick={openCreate}
            className="md:hidden w-10 h-10 bg-neo-yellow border-2 border-neo-black shadow-neo flex items-center justify-center rounded-lg active:translate-y-1 active:shadow-none transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        
        {events.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[60vh] text-center">
             <div className="text-6xl mb-4">🕸️</div>
             <h2 className="text-2xl font-bold mb-2">No Countdowns Yet</h2>
             <p className="text-gray-500 mb-6 max-w-xs">Time is ticking! create your first brutally honest countdown.</p>
             <NeoButton onClick={openCreate}>Create First Event</NeoButton>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventCard 
                    event={event} 
                    onDelete={handleDelete}
                    onEdit={openEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Add New Card (Ghost) */}
            <motion.button
              layout
              onClick={openCreate}
              className="group flex flex-col items-center justify-center min-h-[220px] rounded-xl border-4 border-dashed border-gray-300 hover:border-neo-black hover:bg-white transition-all text-gray-400 hover:text-neo-black"
            >
              <Plus className="w-12 h-12 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold uppercase tracking-wider">Add New</span>
            </motion.button>
          </div>
        )}
      </main>

      {/* Drawer */}
      <AddEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={handleSaveEvent}
        initialData={editingEvent}
      />
    </div>
  );
}