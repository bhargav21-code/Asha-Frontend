import React, { createContext, useContext, useState, useEffect } from 'react';

export const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard', settings: 'Settings', signOut: 'Sign Out',
    language: 'Language', shareApp: 'Share Application',
    confirmSignOut: 'Are you sure you want to sign out?',
    yes: 'Yes, Sign Out', cancel: 'Cancel',
    shareMsg: 'ASHA Health Management System - Smart Rural Health Monitoring',
    copyLink: 'Copy Link', copied: 'Copied!',
    shareVia: 'Share via',
    reportSubmitted: 'Report Submitted', reportPending: 'Report Pending',
    totalWorkers: 'Total Workers', submitted: 'Submitted',
    pending: 'Pending', reviewed: 'Reviewed',
    viewReport: 'View Report', markReviewed: 'Mark Reviewed',
    homesVisited: 'Homes Visited', pregnantVisited: 'Pregnant Visited',
    childrenChecked: 'Children Checked', referralsMade: 'Referrals Made',
    sessionsConducted: 'Sessions Conducted', notes: 'Notes',
    village: 'Village', date: 'Date', search: 'Search',
    filterByDate: 'Filter by Date', filterByVillage: 'Filter by Village',
    filterByStatus: 'Filter by Status', allStatus: 'All Status',
    allWorkers: 'All Workers', noReportYet: 'No report submitted yet',
    reportDate: 'Report Date', worker: 'ASHA Worker',
    dailyReports: 'Daily ASHA Reports', reportMonitoring: 'Report Monitoring',
    english: 'English', hindi: 'Hindi', gujarati: 'Gujarati',
  },
  hi: {
    dashboard: 'डैशबोर्ड', settings: 'सेटिंग्स', signOut: 'साइन आउट',
    language: 'भाषा', shareApp: 'ऐप शेयर करें',
    confirmSignOut: 'क्या आप वाकई साइन आउट करना चाहते हैं?',
    yes: 'हाँ, साइन आउट', cancel: 'रद्द करें',
    shareMsg: 'आशा स्वास्थ्य प्रबंधन प्रणाली - ग्रामीण स्वास्थ्य निगरानी',
    copyLink: 'लिंक कॉपी करें', copied: 'कॉपी हो गया!',
    shareVia: 'शेयर करें',
    reportSubmitted: 'रिपोर्ट जमा हुई', reportPending: 'रिपोर्ट लंबित',
    totalWorkers: 'कुल कार्यकर्ता', submitted: 'जमा हुई',
    pending: 'लंबित', reviewed: 'समीक्षित',
    viewReport: 'रिपोर्ट देखें', markReviewed: 'समीक्षित करें',
    homesVisited: 'घर विज़िट', pregnantVisited: 'गर्भवती विज़िट',
    childrenChecked: 'बच्चे जाँचे', referralsMade: 'रेफरल',
    sessionsConducted: 'सत्र आयोजित', notes: 'नोट्स',
    village: 'गाँव', date: 'तारीख', search: 'खोजें',
    filterByDate: 'तारीख से फ़िल्टर', filterByVillage: 'गाँव से फ़िल्टर',
    filterByStatus: 'स्थिति से फ़िल्टर', allStatus: 'सभी',
    allWorkers: 'सभी कार्यकर्ता', noReportYet: 'अभी तक कोई रिपोर्ट नहीं',
    reportDate: 'रिपोर्ट तारीख', worker: 'आशा कार्यकर्ता',
    dailyReports: 'दैनिक आशा रिपोर्ट', reportMonitoring: 'रिपोर्ट निगरानी',
    english: 'अंग्रेज़ी', hindi: 'हिंदी', gujarati: 'ગુજरাती',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ', settings: 'સેટિંગ્સ', signOut: 'સાઇન આઉટ',
    language: 'ભાષા', shareApp: 'એપ શેર કરો',
    confirmSignOut: 'શું તમે ખરેખર સાઇન આઉટ કરવા માંગો છો?',
    yes: 'હા, સાઇન આઉટ', cancel: 'રદ કરો',
    shareMsg: 'આશા હેલ્થ મેનેજમેન્ટ સિસ્ટમ - ગ્રામીણ આરોગ્ય નિગરાણી',
    copyLink: 'લિંક કૉપિ કરો', copied: 'કૉપિ થઈ!',
    shareVia: 'શેર કરો',
    reportSubmitted: 'રિપોર્ટ સબમિટ', reportPending: 'રિપોર્ટ બાકી',
    totalWorkers: 'કુલ કાર્યકર', submitted: 'સબમિટ',
    pending: 'બાકી', reviewed: 'સમીક્ષિત',
    viewReport: 'રિપોર્ટ જુઓ', markReviewed: 'સમીક્ષિત કરો',
    homesVisited: 'ઘર મુલાકાત', pregnantVisited: 'ગર્ભવતી મુલાકાત',
    childrenChecked: 'બાળકો તપાસ', referralsMade: 'રેફરલ',
    sessionsConducted: 'સત્ર', notes: 'નોંધ',
    village: 'ગામ', date: 'તારીખ', search: 'શોધો',
    filterByDate: 'તારીખ ફિલ્ટર', filterByVillage: 'ગામ ફિલ્ટર',
    filterByStatus: 'સ્થિતિ ફિલ્ટર', allStatus: 'બધી',
    allWorkers: 'બધા કાર્યકર', noReportYet: 'હજી કોઈ રિપોર્ટ નથી',
    reportDate: 'રિપોર્ટ તારીખ', worker: 'આશા કાર્યકર',
    dailyReports: 'દૈનિક આશા રિપોર્ટ', reportMonitoring: 'રિપોર્ટ નિગરાણી',
    english: 'English', hindi: 'हिंदी', gujarati: 'ગુજરાતી',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('asha_lang') || 'en');

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('asha_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
