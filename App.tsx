import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Loader2, Download, Bell, BellRing } from 'lucide-react';
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

  // PWA & Notifications State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

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

  // 3. Handle PWA Install Prompt & Notifications
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Daily 6:30 AM Notification Check (Local simulation)
    const checkDailyNotification = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      // Check if it's 6:30 AM (approximate)
      if (now.getHours() === 6 && now.getMinutes() === 30) {
         const title = "Daily NeoCount Update";
         const body = events.length > 0 
           ? `You have ${events.length} active countdowns ticking away!` 
           : "Start your day by adding a new countdown.";
         
         new Notification(title, {
           body: body,
           icon: 'https://api.iconify.design/lucide:hourglass.svg?color=%23121212'
         });
      }
    };

    // Check every minute
    const interval = setInterval(checkDailyNotification, 60000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, [events]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      new Notification("NeoCount Notifications Enabled", {
        body: "You will receive daily updates at 6:30 AM if the app is open.",
      });
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const fetchEvents = async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('target_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
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
          
          <div className="flex items-center gap-2 md:gap-3">
             {/* Install Button (Mobile/Desktop) */}
             {isInstallable && (
               <button
                  onClick={handleInstallClick}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neo-blue border-2 border-neo-black rounded-md font-bold text-xs hover:bg-blue-300 transition-colors"
               >
                 <Download className="w-4 h-4" /> Install
               </button>
             )}

             {/* Notifications Button */}
             <button
                onClick={requestNotificationPermission}
                className={`p-2 rounded-md border-2 transition-all ${notificationPermission === 'granted' ? 'bg-neo-green border-neo-black' : 'border-transparent hover:bg-gray-200 hover:border-neo-black'}`}
                title={notificationPermission === 'granted' ? "Notifications On" : "Enable Notifications"}
             >
               {notificationPermission === 'granted' ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
             </button>

             <span className="hidden md:block text-xs font-bold uppercase bg-gray-200 px-2 py-1 rounded border border-neo-black truncate max-w-[150px]">
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
            className="md:hidden w-10 h-10 bg-neo-yellow border-2 border-neo-black shadow-neo flex items-center justify-center rounded-lg active:translate-y-1 active:shadow-none transition-all ml-2"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Install Banner if available */}
      <AnimatePresence>
        {isInstallable && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-neo-blue border-b-4 border-neo-black px-4 py-3"
          >
             <div className="flex items-center justify-between">
               <span className="font-bold text-sm">Install App for offline use?</span>
               <button onClick={handleInstallClick} className="bg-white border-2 border-neo-black px-3 py-1 rounded text-xs font-bold shadow-sm">
                 Install
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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