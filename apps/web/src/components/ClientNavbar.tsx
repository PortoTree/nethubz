"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useUser } from "@/contexts/UserContext";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const pathname = usePathname();
  let activeTab = "home";
  if (pathname.includes("/project")) activeTab = "project";
  else if (pathname.includes("/product")) activeTab = "product";
  else if (pathname.includes("/obrolan") || pathname.includes("/chat")) activeTab = "chat";
  else if (pathname.includes("/friend")) activeTab = "friend";
  else if (pathname.includes("/community")) activeTab = "community";
  else if (pathname.includes("/search")) activeTab = "search";
  else if (pathname.includes("/saved")) activeTab = "saved";

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const { currentUser, isProfileLoading } = useUser();

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



  // if (!themeLoaded) return null;

  if (pathname.match(/^\/[^/]+\/project\/.+/)) return null;

  return (
    <>
      <Toaster position="bottom-center" />
      <Navbar
        activeTab={activeTab}
        setActiveTab={() => { }}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        themeLoaded={themeLoaded}
        currentUser={currentUser}
        isProfileLoading={isProfileLoading}
      />
    </>
  );
}
