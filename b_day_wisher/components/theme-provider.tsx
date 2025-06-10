"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme } from "react-native"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const initialState: ThemeContextType = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
}

const ThemeContext = createContext<ThemeContextType>(initialState)

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const colorScheme = useColorScheme()
  const resolvedTheme = theme === "system" ? colorScheme || "light" : theme

  useEffect(() => {
    // You could add AsyncStorage here to persist theme preference
  }, [theme])

  const value = {
    theme,
    setTheme,
    resolvedTheme: resolvedTheme as "light" | "dark",
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
