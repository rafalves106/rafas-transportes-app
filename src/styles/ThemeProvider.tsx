import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { lightTheme } from "./Temas";
import { darkTheme } from "./Temas";
import { type Theme } from "./Temas";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentThemeName: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState<"light" | "dark">(
    () => {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "dark" ? "dark" : "light";
    }
  );

  const theme = currentThemeName === "light" ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setCurrentThemeName((prevTheme) =>
      prevTheme === "light" ? "dark" : "light"
    );
  };

  useEffect(() => {
    localStorage.setItem("theme", currentThemeName);

    const root = document.documentElement;

    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value);
    }
  }, [theme, currentThemeName]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
