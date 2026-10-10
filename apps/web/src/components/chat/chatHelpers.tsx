"use client";

import React from "react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const dummyChats = [
  { name: "Budi Santoso", ts: Date.now() - 15 * 86400000, msg: "Halo bro, apa kabar? Udah la...", isOnline: false, status: "read" },
  { name: "Siti Aminah", ts: Date.now() - 3 * 86400000, msg: "Project kemarin gimana kelanjutannya?", isOnline: true, status: "sent" },
  { name: "Agus Pratama", ts: Date.now() - 2 * 86400000, msg: "Wkwk siap bro ntar malam ya", isOnline: true, status: "failed" },
  { name: "Dewi Lestari", ts: Date.now() - 6 * 86400000, msg: "Oke, dokumennya udah aku kirim ke email.", isOnline: false, status: "sending" },
  { name: "Andi Wijaya", ts: Date.now() - 4 * 86400000, msg: "Jadi nongkrong nggak nih hari ini?", isOnline: true },
  { name: "Rina Kusuma", ts: Date.now() - 5 * 86400000, msg: "Thanks ya buat bantuannya kemarin!", isOnline: false },
  { name: "Fajar Nugroho", ts: Date.now() - 3 * 86400000, msg: "Jangan lupa meeting jam 2 siang bro.", isOnline: true },
  { name: "Maya Indah", ts: Date.now() - 1 * 86400000, msg: "Sipp, nanti aku kabarin lagi.", isOnline: false },
  { name: "Reza Pahlevi", ts: Date.now() - 1 * 86400000, msg: "Tugas bagian backend udah aman?", isOnline: true },
  { name: "Nina Marlina", ts: Date.now() - 16 * 86400000, msg: "Wah mantap tuh idenya, boleh dicoba.", isOnline: false },
  { name: "Eko Susilo", ts: Date.now() - 17 * 86400000, msg: "Kirim aja linknya kesini bro", isOnline: true },
  { name: "Fitri Yani", ts: Date.now() - 18 * 86400000, msg: "Haha bener banget", isOnline: false },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function formatChatDate(ts: number, locale: string): string {
  const now = Date.now();
  const diff = now - ts;
  const oneDay = 86400000;
  const sevenDays = 7 * oneDay;
  const date = new Date(ts);
  if (diff < oneDay && new Date(now).getDate() === date.getDate()) {
    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
  } else if (diff < sevenDays) {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  } else {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(date);
  }
}

// ─── Components ───────────────────────────────────────────────────────────────

export const ChatStatusMark = ({ status }: { status?: string }) => {
  if (!status) return null;
  let src = "";
  let colorClass = "";
  switch (status) {
    case "failed":  src = "/mark/tidak-terkirim.svg"; colorClass = "bg-red-500";    break;
    case "sending": src = "/mark/pending.svg";        colorClass = "bg-orange-500"; break;
    case "sent":    src = "/mark/terkirim.svg";       colorClass = "bg-[#2D88FF]";  break;
    case "read":    src = "/mark/diliat.svg";         colorClass = "bg-[#31A24C]";  break;
  }
  if (!src) return null;
  return (
    <span
      className={`w-[14px] h-[14px] shrink-0 inline-block align-text-bottom mr-1 `+ colorClass}
      style={{
        maskImage: `url('`+src+`')`,
        WebkitMaskImage: `url('`+src+`')`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
};

export const MessageDropdownMenu = ({ isIncoming, t }: { isIncoming?: boolean; t: any }) => (
  <div className="w-48 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-gray-100 dark:border-[#3E4042] py-2 flex flex-col z-50">
    <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-left text-[15px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
      {t("chat.reply")}
    </button>
    <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-left text-[15px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
      {t("chat.copy")}
    </button>
    <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-left text-[15px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
      {t("chat.forward")}
    </button>
    <div className="h-[1px] bg-gray-200 dark:bg-[#3E4042] my-1" />
    <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-left text-[15px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
      {t("chat.select")}
    </button>
    <div className="h-[1px] bg-gray-200 dark:bg-[#3E4042] my-1" />
    <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#3A3B3C] text-left text-[15px] font-medium text-black dark:text-[#E4E6EB] transition-colors">
      {t("chat.delete")}
    </button>
  </div>
);
