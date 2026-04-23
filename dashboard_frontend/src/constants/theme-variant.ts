import { createContext, useContext } from "react";

// Theme types
export type Theme = "dark" | "light" | "system";

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Initial state
export const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

// Context
export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    {throw new Error("useTheme must be used within a ThemeProvider");}

  return context;
};
