// Pura subject list (saare boards ke liye). Board apna subset choose karta hai.
window.SUBJECTS = [
  { key: "hindi", name: "हिंदी", en: "Hindi", color: "#ef4444", icon: "अ" },
  { key: "english", name: "English", en: "English", color: "#3b82f6", icon: "A" },
  { key: "maths", name: "गणित", en: "Mathematics", color: "#f59e0b", icon: "∑" },
  { key: "science", name: "विज्ञान", en: "Science", color: "#10b981", icon: "⚗" },
  { key: "physics", name: "भौतिकी", en: "Physics", color: "#0ea5e9", icon: "⚛" },
  { key: "bio", name: "जीव विज्ञान", en: "Biology", color: "#22c55e", icon: "🧬" },
  { key: "sst", name: "सामाजिक विज्ञान", en: "Social Science", color: "#8b5cf6", icon: "◎" },
  { key: "sanskrit", name: "संस्कृत", en: "Sanskrit", color: "#ec4899", icon: "ॐ" },
  { key: "it", name: "सूचना तकनीक", en: "Information Technology", color: "#06b6d4", icon: "⌘" },
  { key: "punjabi", name: "ਪੰਜਾਬੀ", en: "Punjabi", color: "#f97316", icon: "ਅ" },
  { key: "marathi", name: "मराठी", en: "Marathi", color: "#dc2626", icon: "म" },
  { key: "kannada", name: "ಕನ್ನಡ", en: "Kannada", color: "#0d9488", icon: "ಅ" },
  { key: "malayalam", name: "മലയാളം", en: "Malayalam", color: "#16a34a", icon: "അ" },
  { key: "bengali", name: "বাংলা", en: "Bengali", color: "#7c3aed", icon: "অ" },
  { key: "gujarati", name: "ગુજરાતી", en: "Gujarati", color: "#db2777", icon: "અ" },
  { key: "telugu", name: "తెలుగు", en: "Telugu", color: "#ea580c", icon: "అ" },
  { key: "tamil", name: "தமிழ்", en: "Tamil", color: "#be123c", icon: "அ" },
  { key: "odia", name: "ଓଡ଼ିଆ", en: "Odia", color: "#0891b2", icon: "ଅ" },
  { key: "assamese", name: "অসমীয়া", en: "Assamese", color: "#b45309", icon: "অ" }
];
window.SUBJECT_MAP = Object.fromEntries(window.SUBJECTS.map(s => [s.key, s]));
