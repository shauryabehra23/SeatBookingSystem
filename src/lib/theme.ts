// Government website color scheme
export const THEME = {
  // Primary colors
  primary: '#B86B6B',      // Rust/Terracotta - headers, buttons, accents
  primaryHover: '#a55d5d', // Darker rust for hover
  
  // Secondary colors
  secondary: '#4A6B7B',    // Navy - secondary buttons, badges
  
  // Neutral colors
  background: '#F8FAFC',   // Light gray - page background
  foreground: '#1E293B',   // Dark slate - primary text
  border: '#E2E8F0',       // Light gray - borders
  
  // Dark mode (if needed)
  darkPrimary: '#D4857D',
  darkSecondary: '#5A7B94',
  darkBackground: '#0F172A',
  darkForeground: '#F8FAFC',
} as const;

// Tailwind class mappings for semantic usage
export const THEME_CLASSES = {
  button: 'bg-[#B86B6B] text-white hover:bg-[#a55d5d]',
  buttonSecondary: 'bg-[#4A6B7B] text-white hover:bg-[#3a5b6b]',
  card: 'bg-white border border-[#E2E8F0]',
  input: 'border-[#E2E8F0] focus:ring-[#B86B6B]',
  text: 'text-[#1E293B]',
  textMuted: 'text-slate-600',
} as const;
