import React, { createContext, useContext } from "react";
import theme from "./theme";

const ThemeContext = createContext(theme);

export const ThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);