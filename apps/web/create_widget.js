const fs = require('fs');
const content = fs.readFileSync('chat_jsx.txt', 'utf8');
let fixedContent = content.trim();
if(fixedContent.endsWith('</>')) {
  fixedContent = fixedContent.slice(0, -3);
}

const widgetCode = `"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface FloatingChatWidgetProps {
  currentUser: any;
  dummyChats: any[];
  formatChatDate: (ts: number, locale: string) => string;
  ChatStatusMark: React.FC<{status?: string}>;
  MessageDropdownMenu: React.FC<{isIncoming?: boolean, t: any}>;
  t: any;
  locale: string;
  activeTab?: string;
}

export default function FloatingChatWidget({
  currentUser,
  dummyChats,
  formatChatDate,
  ChatStatusMark,
  MessageDropdownMenu,
  t,
  locale,
  activeTab
}: FloatingChatWidgetProps) {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(true);
  const [isChatMoreMenuOpen, setIsChatMoreMenuOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isChatListSettingsOpen, setIsChatListSettingsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isTempMessageOn, setIsTempMessageOn] = useState(false);
  const [isChatFilterOpen, setIsChatFilterOpen] = useState(false);
  const [chatListFilter, setChatListFilter] = useState<'semua' | 'belum_dibaca' | 'grup'>('semua');
  const [activeChatMenu, setActiveChatMenu] = useState<number | null>(null);
  const [activeFloatingChatIdx, setActiveFloatingChatIdx] = useState<number | null>(null);
  const floatingChatFilterRef = useRef<HTMLDivElement>(null);
  const [isFloatingChatFilterOpen, setIsFloatingChatFilterOpen] = useState(false);
  const [isFloatingChatInfoOpen, setIsFloatingChatInfoOpen] = useState(false);
  const [floatingChatMessage, setFloatingChatMessage] = useState("");

  useEffect(() => {
    if (activeTab === "chat") {
      setActiveFloatingChatIdx(null);
    }
  }, [activeTab]);

  return (
    <>
${fixedContent}
    </>
  );
}`;

fs.writeFileSync('src/components/FloatingChatWidget.tsx', widgetCode);
console.log('Wrote widget');
