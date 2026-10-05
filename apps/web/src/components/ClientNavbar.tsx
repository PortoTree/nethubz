"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useUser } from "@/contexts/UserContext";

export default function ClientNavbar({ activeTab = "project" }: { activeTab?: string }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const { currentUser } = useUser();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, themeLoaded]);



  if (!themeLoaded) return null;

  return (
    <Navbar 
      activeTab={activeTab} 
      setActiveTab={() => {}} 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      themeLoaded={themeLoaded}
      currentUser={currentUser} 
    />
  );
}
