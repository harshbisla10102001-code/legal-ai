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
  "home.overview": {
    en: "Your legal workspace at a glance.",
    hi: "आपका कानूनी कार्यक्षेत्र एक नज़र में।",
  },
  "home.total_docs": { en: "Documents Reviewed", hi: "समीक्षित दस्तावेज़" },
  "home.high_risk": { en: "High Risk", hi: "उच्च जोखिम" },
  "home.avg_risk": { en: "Avg. Risk Score", hi: "औसत जोखिम स्कोर" },
  "home.conversations": { en: "AI Conversations", hi: "AI बातचीत" },
  "home.risk_overview": { en: "Risk Distribution", hi: "जोखिम वितरण" },
  "home.needs_attention": { en: "Needs Attention", hi: "ध्यान चाहिए" },
  "home.all_clear": {
    en: "No high-risk documents found. All clear!",
    hi: "कोई उच्च-जोखिम दस्तावेज़ नहीं मिला। सब ठीक है!",
  },
  "home.recent_docs": { en: "Recent Documents", hi: "हाल के दस्तावेज़" },
  "home.recent_chats": { en: "Recent Conversations", hi: "हाल की बातचीत" },
  "home.view_all": { en: "View all", hi: "सभी देखें" },
  "home.no_data": {
    en: "No data yet. Upload a document or start a chat to get started.",
    hi: "अभी तक कोई डेटा नहीं। शुरू करने के लिए दस्तावेज़ अपलोड करें या चैट शुरू करें।",
  },
  "home.quick_actions": { en: "Quick Actions", hi: "त्वरित कार्य" },
  "home.upload_doc": { en: "Upload Document", hi: "दस्तावेज़ अपलोड करें" },
  "home.upload_doc_desc": {
    en: "Analyze contracts, FIRs, or court orders for risks",
    hi: "जोखिमों के लिए अनुबंध, FIR, या अदालत के आदेशों का विश्लेषण करें",
  },
  "home.new_chat": { en: "New AI Chat", hi: "नई AI चैट" },
  "home.new_chat_desc": {
    en: "Ask legal questions with citations and context",
    hi: "उद्धरण और संदर्भ के साथ कानूनी प्रश्न पूछें",
  },
  "home.export_reports": { en: "Export Reports", hi: "रिपोर्ट निर्यात करें" },
  "home.export_reports_desc": {
    en: "Download PDF reports for analyzed documents",
    hi: "विश्लेषित दस्तावेज़ों के लिए PDF रिपोर्ट डाउनलोड करें",
  },
  "home.risk_low": { en: "Low", hi: "कम" },
  "home.risk_medium": { en: "Medium", hi: "मध्यम" },
  "home.risk_high": { en: "High", hi: "उच्च" },
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
    en: "Upload and OCR documents for fast issue spotting.",
    hi: "तेज़ समस्या पहचान के लिए दस्तावेज़ अपलोड और OCR करें।",
  },
  "docreview.drop_hint": {
    en: "Drag and drop a file here, or click to browse",
    hi: "यहाँ फ़ाइल खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें",
  },
  "docreview.accepted_formats": {
    en: "PDF, DOCX, DOC, PNG, JPG (max 10MB)",
    hi: "PDF, DOCX, DOC, PNG, JPG (अधिकतम 10MB)",
  },
  "docreview.uploading": { en: "Uploading…", hi: "अपलोड हो रहा है…" },
  "docreview.step1": { en: "Upload to storage", hi: "स्टोरेज में अपलोड" },
  "docreview.step2": { en: "Extracting text", hi: "टेक्स्ट निकाल रहा है" },
  "docreview.step3": { en: "AI analysis", hi: "AI विश्लेषण" },
  "docreview.step4": { en: "Saving results", hi: "परिणाम सहेज रहा है" },
  "docreview.history": { en: "Documents", hi: "दस्तावेज़" },
  "docreview.new_doc": { en: "+ New Document", hi: "+ नया दस्तावेज़" },
  "docreview.new": { en: "New", hi: "नया" },
  "docreview.no_docs": { en: "No documents yet", hi: "अभी तक कोई दस्तावेज़ नहीं" },
  "docreview.start_new": { en: "Upload a document to get started", hi: "शुरू करने के लिए एक दस्तावेज़ अपलोड करें" },
  "docreview.uploaded_file": { en: "Uploaded file", hi: "अपलोड की गई फ़ाइल" },
  "docreview.risk_score": { en: "Risk score", hi: "जोखिम स्कोर" },
  "docreview.document_type": { en: "Document type", hi: "दस्तावेज़ प्रकार" },
  "docreview.parties": { en: "Parties", hi: "पक्ष" },
  "docreview.summary": { en: "Summary", hi: "सारांश" },
  "docreview.findings": { en: "Findings", hi: "निष्कर्ष" },
  "docreview.missing_clauses": { en: "Missing clauses", hi: "गायब खंड" },
  "docreview.positive_aspects": { en: "Positive aspects", hi: "सकारात्मक पहलू" },
  "docreview.export_pdf": { en: "Export PDF", hi: "PDF निर्यात करें" },
  "docreview.loading": { en: "Loading…", hi: "लोड हो रहा है…" },
  "docreview.error": { en: "Something went wrong", hi: "कुछ गलत हो गया" },
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
