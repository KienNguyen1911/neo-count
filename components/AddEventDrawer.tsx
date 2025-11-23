import React, { useState, useEffect } from 'react';
import { CustomSheet } from './ui/CustomSheet';
import { NeoButton, NeoInput, NeoLabel } from './ui/NeoComponents';
import { ScrollDatePicker } from './ScrollDatePicker';
import { CountdownEvent, DEFAULT_ICONS, CATEGORY_COLORS, NotePage } from '../types';
import { cn } from '../lib/utils';
import { Sparkles, FileText, List, ChevronLeft, Calendar, Edit3, Plus, Save, StickyNote } from 'lucide-react';

interface AddEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CountdownEvent>) => void;
  initialData?: CountdownEvent | null;
}

type DrawerMode = 'view' | 'edit_config' | 'edit_note';

export const AddEventDrawer: React.FC<AddEventDrawerProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [mode, setMode] = useState<DrawerMode>('view');
  
  // Temporary state for the event being edited/viewed
  const [tempEvent, setTempEvent] = useState<Partial<CountdownEvent>>({});
  
  // State for specific note editing
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Initialization
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTempEvent(JSON.parse(JSON.stringify(initialData))); // Deep copy
        setMode('view');
      } else {
        // New Event Defaults
        setTempEvent({
          name: '',
          description: '',
          targetDate: new Date().toISOString(),
          icon: DEFAULT_ICONS[0],
          color: 'yellow',
          isDetailedNotes: false,
          notes: []
        });
        setMode('edit_config'); // Start in edit mode for new events
      }
      setActiveNoteId(null);
    }
  }, [isOpen, initialData]);

  // --- HANDLERS ---

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) {
      // Creating new event -> Save and Close
      onSave(tempEvent);
      onClose();
    } else {
      // Updating existing -> Save and return to View
      onSave(tempEvent);
      setMode('view');
    }
  };

  const handleSaveDescription = () => {
    onSave(tempEvent);
    // Optional: Show toast
  };

  const handleSwitchToDetailed = () => {
    // Convert existing description to a first note if it exists
    const newNotes: NotePage[] = tempEvent.notes || [];
    if (tempEvent.description && tempEvent.description.trim().length > 0) {
      newNotes.unshift({
        id: crypto.randomUUID(),
        title: 'General Notes',
        content: tempEvent.description,
        updatedAt: new Date().toISOString()
      });
    }

    setTempEvent(prev => ({
      ...prev,
      isDetailedNotes: true,
      notes: newNotes,
      description: '' // Clear simple description
    }));
    // We don't save immediately, user must interact
  };

  const handleOpenNote = (note?: NotePage) => {
    if (note) {
      setActiveNoteId(note.id);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setActiveNoteId(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setMode('edit_note');
  };

  const handleSaveNote = () => {
    const timestamp = new Date().toISOString();
    let updatedNotes = [...(tempEvent.notes || [])];

    if (activeNoteId) {
      // Update existing
      updatedNotes = updatedNotes.map(n => n.id === activeNoteId ? { ...n, title: noteTitle, content: noteContent, updatedAt: timestamp } : n);
    } else {
      // Create new
      updatedNotes.push({
        id: crypto.randomUUID(),
        title: noteTitle || 'Untitled Note',
        content: noteContent,
        updatedAt: timestamp
      });
    }

    const updatedEvent = { ...tempEvent, notes: updatedNotes };
    setTempEvent(updatedEvent);
    onSave(updatedEvent); // Persist immediately
    setMode('view');
  };

  // --- RENDERERS ---

  const renderViewMode = () => {
    const dateObj = new Date(tempEvent.targetDate || new Date());
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    const colorClass = CATEGORY_COLORS[tempEvent.color || 'yellow'];

    return (
      <div className="flex flex-col h-full pb-20">
        {/* Top: Read Only Info */}
        <div className="relative bg-neo-white border-2 border-neo-black rounded-xl p-6 shadow-neo-sm mb-8 group">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className={cn("w-16 h-16 flex items-center justify-center text-3xl border-2 border-neo-black rounded-lg", colorClass)}>
                {tempEvent.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase leading-none mb-2">{tempEvent.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setMode('edit_config')}
              className="p-2 border-2 border-neo-black rounded-md hover:bg-neo-yellow transition-colors shadow-neo-sm active:translate-y-[2px] active:shadow-none"
              title="Edit Configuration"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-0.5 flex-1 bg-neo-black/20" />
          <span className="font-black text-neo-black uppercase tracking-widest text-sm">Event Notes</span>
          <div className="h-0.5 flex-1 bg-neo-black/20" />
        </div>

        {/* Bottom: Notes */}
        <div className="flex-1 flex flex-col">
          {!tempEvent.isDetailedNotes ? (
            // SIMPLE MODE
            <div className="flex flex-col gap-4 h-full">
              <textarea
                value={tempEvent.description || ''}
                onChange={(e) => setTempEvent({ ...tempEvent, description: e.target.value })}
                placeholder="Write your notes here..."
                className="flex-1 w-full p-4 text-lg font-medium bg-white border-2 border-neo-black rounded-xl resize-none focus:outline-none focus:shadow-neo transition-shadow placeholder:text-gray-400"
              />
              <div className="flex flex-col md:flex-row gap-3">
                 <button
                  onClick={handleSwitchToDetailed}
                  className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-neo-black rounded-lg font-bold text-sm bg-gray-100 hover:bg-neo-white hover:shadow-neo-sm transition-all"
                >
                  <List className="w-4 h-4" />
                  Enable Detailed Notes Mode
                </button>
                 <NeoButton onClick={handleSaveDescription} className="md:ml-auto">
                   <Save className="w-4 h-4 mr-2" /> Save Notes
                 </NeoButton>
              </div>
            </div>
          ) : (
            // DETAILED MODE
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                {tempEvent.notes?.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleOpenNote(note)}
                    className="flex flex-col text-left p-4 bg-white border-2 border-neo-black rounded-lg hover:shadow-neo hover:-translate-y-1 transition-all group"
                  >
                    <span className="font-bold text-lg mb-1 group-hover:text-neo-blue transition-colors truncate w-full">{note.title}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2 font-medium">
                      {note.content || "No content..."}
                    </p>
                  </button>
                ))}
                
                {(!tempEvent.notes || tempEvent.notes.length === 0) && (
                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-400 font-bold">No pages yet.</p>
                   </div>
                )}
              </div>
              
              <NeoButton onClick={() => handleOpenNote()} variant="secondary" className="mt-2">
                <Plus className="w-5 h-5 mr-2" /> Add New Page
              </NeoButton>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditConfigMode = () => {
    return (
      <form onSubmit={handleSaveConfig} className="flex flex-col gap-8 pb-28">
        {initialData && (
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => setMode('view')} className="p-1 hover:bg-gray-200 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black uppercase">Configuration</h3>
          </div>
        )}

        {/* Name Section */}
        <div className="space-y-4">
          <div>
            <NeoLabel htmlFor="name">Event Name</NeoLabel>
            <NeoInput 
              id="name" 
              value={tempEvent.name || ''} 
              onChange={(e) => setTempEvent({...tempEvent, name: e.target.value})} 
              placeholder="e.g. Bali Trip"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Custom Wheel Date Picker */}
        <div>
          <NeoLabel>Target Date</NeoLabel>
          <ScrollDatePicker 
            date={new Date(tempEvent.targetDate || new Date())} 
            onDateChange={(d) => setTempEvent({...tempEvent, targetDate: d.toISOString()})} 
          />
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
                  onClick={() => setTempEvent({...tempEvent, icon})}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all",
                    tempEvent.icon === icon 
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
                  onClick={() => setTempEvent({...tempEvent, color})}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    CATEGORY_COLORS[color],
                    tempEvent.color === color ? "border-neo-black scale-125 ring-2 ring-offset-2 ring-gray-200" : "border-transparent opacity-70 hover:opacity-100 hover:scale-110"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Only show simple description field if we are creating a new event */}
          {!initialData && (
            <div>
               <NeoLabel htmlFor="desc">Quick Note (Optional)</NeoLabel>
               <NeoInput 
                  id="desc"
                  value={tempEvent.description || ''}
                  onChange={(e) => setTempEvent({...tempEvent, description: e.target.value})}
                  placeholder="Short description..."
               />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t-2 border-neo-black flex justify-center z-50 md:absolute rounded-b-3xl">
           <NeoButton type="submit" className="w-full md:w-auto md:min-w-[200px]">
             {initialData ? 'Update Configuration' : 'Start Countdown'}
           </NeoButton>
        </div>
      </form>
    );
  };

  const renderEditNoteMode = () => {
    return (
      <div className="flex flex-col h-full pb-20">
        <div className="flex items-center gap-4 mb-6 border-b-2 border-neo-black/10 pb-4">
           <button 
             onClick={() => setMode('view')} 
             className="p-2 hover:bg-gray-100 rounded-lg border-2 border-transparent hover:border-neo-black transition-all"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
           <h3 className="text-xl font-black uppercase">{activeNoteId ? 'Edit Page' : 'New Page'}</h3>
        </div>

        <div className="flex flex-col gap-6 flex-1">
          <div>
             <NeoLabel>Page Title</NeoLabel>
             <NeoInput 
               value={noteTitle}
               onChange={(e) => setNoteTitle(e.target.value)}
               placeholder="Untitled Page"
               className="font-bold text-xl"
               autoFocus
             />
          </div>
          <div className="flex-1 flex flex-col">
             <NeoLabel>Content</NeoLabel>
             <textarea 
               value={noteContent}
               onChange={(e) => setNoteContent(e.target.value)}
               placeholder="Type your notes here..."
               className="flex-1 w-full p-4 text-lg bg-white border-2 border-neo-black rounded-xl resize-none focus:outline-none focus:shadow-neo transition-all"
             />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t-2 border-neo-black flex justify-center z-50 md:absolute rounded-b-3xl">
           <NeoButton onClick={handleSaveNote} className="w-full md:w-auto md:min-w-[200px]">
             <Save className="w-4 h-4 mr-2" /> Save Page
           </NeoButton>
        </div>
      </div>
    );
  };

  return (
    <CustomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        mode === 'edit_config' && !initialData ? "New Countdown" :
        mode === 'edit_config' ? "Edit Config" :
        mode === 'edit_note' ? "Note Editor" : 
        "Details"
      }
    >
      {mode === 'view' && renderViewMode()}
      {mode === 'edit_config' && renderEditConfigMode()}
      {mode === 'edit_note' && renderEditNoteMode()}
    </CustomSheet>
  );
};