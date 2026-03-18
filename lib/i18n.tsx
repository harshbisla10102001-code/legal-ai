"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "hi";

const translations: Record<string, Record<Locale, string>> = {
  // Sidebar
  "nav.brand": { en: "LegalAI", hi: "LegalAI" },
  "nav.role": { en: "Lawyer", hi: "वकील" },
  "nav.ai_chat": { en: "AI Chat", hi: "AI चैट" },
  "nav.document_review": { en: "Document Review", hi: "दस्तावेज़ समीक्षा" },
  "nav.contract_generator": { en: "Contract Generator", hi: "अनुबंध जनरेटर" },
  "nav.legal_research": { en: "Legal Research", hi: "कानूनी अनुसंधान" },
  "nav.risk_analysis": { en: "Risk Analysis", hi: "जोखिम विश्लेषण" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स" },
  "nav.sign_out": { en: "Sign out", hi: "साइन आउट" },

  // Header
  "header.subtitle": { en: "Lawyer dashboard", hi: "वकील डैशबोर्ड" },
  "header.welcome": { en: "Welcome,", hi: "स्वागत है," },

  // Theme toggle
  "theme.label": { en: "Theme", hi: "थीम" },
  "theme.dark": { en: "Dark", hi: "डार्क" },
  "theme.light": { en: "Light", hi: "लाइट" },

  // Language toggle
  "lang.label": { en: "Lang", hi: "भाषा" },

  // Dashboard home
  "home.welcome": { en: "Welcome", hi: "स्वागत है" },
  "home.choose_tool": {
    en: "Choose a tool from the sidebar to begin.",
    hi: "शुरू करने के लिए साइडबार से एक टूल चुनें।",
  },
  "home.ai_chat_desc": {
    en: "Ask questions about a matter with citations and context.",
    hi: "उद्धरण और संदर्भ के साथ किसी मामले के बारे में प्रश्न पूछें।",
  },
  "home.doc_review_desc": {
    en: "Upload and OCR documents for fast issue spotting.",
    hi: "तेज़ समस्या पहचान के लिए दस्तावेज़ अपलोड और OCR करें।",
  },
  "home.contract_gen_desc": {
    en: "Generate structured clauses and checklists.",
    hi: "संरचित खंड और चेकलिस्ट तैयार करें।",
  },
  "home.legal_research_desc": {
    en: "Organize research notes and summarize authorities.",
    hi: "शोध नोट्स व्यवस्थित करें और प्राधिकरणों का सारांश बनाएं।",
  },

  // AI Chat
  "chat.title": { en: "AI Chat", hi: "AI चैट" },
  "chat.disclaimer": {
    en: "Conversations are not legal advice. Review outputs before relying on them.",
    hi: "बातचीत कानूनी सलाह नहीं है। उन पर भरोसा करने से पहले आउटपुट की समीक्षा करें।",
  },
  "chat.sessions": { en: "Chats", hi: "चैट्स" },
  "chat.new": { en: "New", hi: "नई" },
  "chat.new_chat": { en: "+ New Chat", hi: "+ नई चैट" },
  "chat.loading": { en: "Loading…", hi: "लोड हो रहा है…" },
  "chat.no_conversations": { en: "No conversations yet", hi: "अभी तक कोई बातचीत नहीं" },
  "chat.start_new": { en: "Start a new conversation", hi: "एक नई बातचीत शुरू करें" },
  "chat.empty_hint": {
    en: "Start by describing a matter, pasting a clause, or asking for a checklist.",
    hi: "किसी मामले का वर्णन करके, एक खंड पेस्ट करके, या चेकलिस्ट माँगकर शुरू करें।",
  },
  "chat.placeholder": {
    en: "Ask a question, paste a clause, or describe a task…",
    hi: "एक प्रश्न पूछें, एक खंड पेस्ट करें, या कार्य का वर्णन करें…",
  },
  "chat.placeholder_disabled": {
    en: "Create a new chat to get started…",
    hi: "शुरू करने के लिए एक नई चैट बनाएं…",
  },
  "chat.send": { en: "Send", hi: "भेजें" },
  "chat.thinking": { en: "Thinking…", hi: "सोच रहा है…" },
  "chat.failed": { en: "Failed to send message", hi: "संदेश भेजने में विफल" },
  "chat.error_fallback": { en: "Something went wrong", hi: "कुछ गलत हो गया" },

  // Placeholder pages
  "contract.title": { en: "Contract Generator", hi: "अनुबंध जनरेटर" },
  "contract.desc": {
    en: "Coming next: clause templates and AI-assisted drafting.",
    hi: "जल्द आ रहा है: खंड टेम्पलेट और AI-सहायता प्राप्त ड्राफ्टिंग।",
  },
  "docreview.title": { en: "Document Review", hi: "दस्तावेज़ समीक्षा" },
  "docreview.desc": {
    en: "Coming next: upload + OCR (Tesseract.js) and issue spotting.",
    hi: "जल्द आ रहा है: अपलोड + OCR (Tesseract.js) और समस्या पहचान।",
  },
  "research.title": { en: "Legal Research", hi: "कानूनी अनुसंधान" },
  "research.desc": {
    en: "Coming next: research workspace and summaries.",
    hi: "जल्द आ रहा है: अनुसंधान कार्यक्षेत्र और सारांश।",
  },
  "risk.title": { en: "Risk Analysis", hi: "जोखिम विश्लेषण" },
  "risk.desc": {
    en: "Coming next: risk scoring and charts (Recharts).",
    hi: "जल्द आ रहा है: जोखिम स्कोरिंग और चार्ट (Recharts)।",
  },
  "settings.title": { en: "Settings", hi: "सेटिंग्स" },
  "settings.desc": {
    en: "Coming next: profile settings and role-aware admin controls.",
    hi: "जल्द आ रहा है: प्रोफ़ाइल सेटिंग्स और भूमिका-आधारित व्यवस्थापक नियंत्रण।",
  },
};

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("locale") as Locale) || "en";
    }
    return "en";
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", l);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[locale] ?? key;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
