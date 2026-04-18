export const darkBlueTheme = {
  primary: '#1E3A8A',        // Dark blue primary
  primaryLight: 'rgba(30, 58, 138, 0.1)',  // For avatar bg
  bg: '#F1F5F9',             // Slate 50 light bg
  card: '#FFFFFF',           // White cards
  textPrimary: '#1E293B',    // Slate 800 headings/values
  textSecondary: '#64748B',  // Slate 500 labels
  accent: '#3B82F6',         // Blue 500 for highlights
  success: '#10B981',        // Emerald 500
  error: '#EF4444',          // Red 500
  warning: '#F59E0B',        // Amber
  border: '#E2E8F0',         // Slate 200
  inactive: '#94A3B8',       // Slate 400 tab inactive
  shadow: '#00000020',       // Shadow color
};

export const lightGreenTheme = {
  primary: '#10B981',        // Emerald primary
  primaryLight: 'rgba(16, 185, 129, 0.1)',  // Avatar
  bg: '#F0FDF4',             // Emerald 50
  card: '#FFFFFF',
  textPrimary: '#065F46',    // Emerald 800
  textSecondary: '#6B7280',  // Gray 500
  accent: '#059669',         // Emerald 600
  success: '#10B981',
  error: '#DC2626',          // Red 600
  warning: '#D97706',        // Amber 700
  border: '#D1D5DB',         // Gray 300
  inactive: '#9CA3AF',       // Gray 400
  shadow: '#00000020',
};

// Default theme export for easy import
export const themes = {
  darkBlue: darkBlueTheme,
  lightGreen: lightGreenTheme,
};
