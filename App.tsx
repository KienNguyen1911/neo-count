import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Loader2 } from 'lucide-react';
import { NeoButton } from './components/ui/NeoComponents';
import { AddEventDrawer } from './components/AddEventDrawer';
import { EventCard } from './components/EventCard';
import { CountdownEvent } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import { AuthPage } from './components/AuthPage';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CountdownEvent | null>(null);

  // 1. Check Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Data from Supabase when Session exists
  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      // Map DB fields to Typescript interface (snake_case to camelCase mapping handled manually if needed, 
      // but here we matched DB columns to JSON mostly, except for snake_case columns)
      const mappedEvents: CountdownEvent[] = data.map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        targetDate: e.target_date,
        icon: e.icon,
        color: e.color,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
        isDetailedNotes: e.is_detailed_notes,
        notes: e.notes
      }));
      setEvents(mappedEvents);
    }
    setIsLoadingData(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setEvents([]);
  };

  const handleSaveEvent = async (eventData: Partial<CountdownEvent>) => {
    if (!session?.user) return;

    // Prepare payload for DB (snake_case)
    const payload = {
      name: eventData.name,
      description: eventData.description,
      target_date: eventData.targetDate,
      icon: eventData.icon,
      color: eventData.color,
      is_detailed_notes: eventData.isDetailedNotes,
      notes: eventData.notes, // Supabase handles JSONB conversion
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };

    if (eventData.id) {
      // Update
      const { error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', eventData.id);

      if (error) {
        console.error("Error updating:", error);
        return;
      }
      
      // Optimistic update or Refetch
      fetchEvents();
    } else {
      // Create
      const { error } = await supabase
        .from('events')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);

      if (error) {
        console.error("Error creating:", error);
        return;
      }
      
      fetchEvents();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting:", error);
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const openCreate = () => {
    setEditingEvent(null);
    setIsDrawerOpen(true);
  };

  const openEdit = (event: CountdownEvent) => {
    setEditingEvent(event);
    setIsDrawerOpen(true);
  };

  // Render Loading State
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-neo-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neo-black" />
      </div>
    );
  }

  // Render Auth Page if not logged in
  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-neo-bg text-neo-black font-sans selection:bg-neo-yellow selection:text-black">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-30 bg-neo-bg/90 backdrop-blur-sm border-b-4 border-neo-black px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-black text-neo-white flex items-center justify-center font-bold text-xl rounded-md">N</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">NeoCount</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="hidden md:block text-xs font-bold uppercase bg-gray-200 px-2 py-1 rounded border border-neo-black">
               {session.user.email}
             </span>
             <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-red-100 rounded-md border-2 border-transparent hover:border-neo-black transition-all"
                title="Sign Out"
             >
                <LogOut className="w-5 h-5" />
             </button>
             <NeoButton onClick={openCreate} className="hidden md:flex gap-2 ml-2">
               <Plus className="w-5 h-5" /> New Event
             </NeoButton>
          </div>

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
        
        {isLoadingData ? (
           <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-neo-black" />
           </div>
        ) : events.length === 0 ? (
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