// BoardPrep notes — सभी subjects को एक जगह जोड़ता है
// (notes.js को हमेशा सभी group files के BAAD में script लगाओ — पहले लगाओ तो arrays खाली मिलती हैं)
window.NOTES = {
  science: (window.NOTES_SCIENCE || []).concat(window.NOTES_SCIENCE2 || []),
  maths: (window.NOTES_MATHS || []).concat(window.NOTES_MATHS2 || []),
  sst_history: window.NOTES_SST_HISTORY || [],
  sst_geo: window.NOTES_SST_GEO || [],
  sst_civics: window.NOTES_SST_CIVICS || [],
  sst_econ: window.NOTES_SST_ECON || [],
  sst_jharkhand: window.NOTES_JHARKHAND || [],
  hindi: window.NOTES_HINDI || [],
  english: window.NOTES_ENGLISH || [],
  sanskrit: window.NOTES_SANSKRIT || []
};
