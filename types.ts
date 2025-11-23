export interface NotePage {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface CountdownEvent {
  id: string;
  name: string;
  description?: string;
  targetDate: string; // ISO String
  icon: string;
  color: 'yellow' | 'red' | 'blue' | 'purple' | 'green';
  createdAt: string;
  updatedAt?: string;
  
  // New fields for detailed notes
  isDetailedNotes?: boolean;
  notes?: NotePage[];
}

export const CATEGORY_COLORS = {
  yellow: 'bg-neo-yellow',
  red: 'bg-neo-red',
  blue: 'bg-neo-blue',
  purple: 'bg-neo-purple',
  green: 'bg-neo-green',
};

export const DEFAULT_ICONS = ['🎉', '✈️', '🎂', '📅', '🚀', '💍', '🎓', '🏖️'];