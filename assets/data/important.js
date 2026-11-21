// Important Questions 2027 — clean structured version (JAC pattern, NCERT syllabus)
window.IMPORTANT = {
  board: "JAC",
  exam: "Feb 2027",
  passMarks: "33%",
  pattern: [
    { subj: "Maths", hi: "गणित", theory: 80, internal: 20, total: 100, time: "3 hrs", pass: 33 },
    { subj: "Science", hi: "विज्ञान", theory: 80, internal: 20, total: 100, time: "3 hrs", pass: 33 },
    { subj: "Social Science", hi: "सामाजिक विज्ञान", theory: 80, internal: 20, total: 100, time: "3 hrs", pass: 33 },
    { subj: "Hindi", hi: "हिंदी", theory: 80, internal: 20, total: 100, time: "3 hrs", pass: 33 },
    { subj: "English", hi: "अंग्रेज़ी", theory: 80, internal: 20, total: 100, time: "3 hrs", pass: 33 }
  ],
  patternNote: "MCQ (1 अंक) + Very Short (2 अंक) + Short (3 अंक) + Long (5 अंक)। Internal assessment = project + periodic tests।",
  sections: [
    {
      id: "maths", title: "गणित", en: "Mathematics",
      groups: [
        {
          title: "MCQ Section (1 अंक each)", type: "mcq",
          items: [
            { q: "यदि α और β द्विघात समीकरण x² - 5x + 6 = 0 के मूल हों, तो α + β = ?", opts: ["5", "6", "-5", "-6"], ans: "A" },
            { q: "AP 2, 5, 8, 11, … का 10वाँ पद = ?", opts: ["29", "32", "28", "31"], ans: "A" },
            { q: "sin²45° + cos²45° = ?", opts: ["0", "1", "2", "1/2"], ans: "B" },
            { q: "बिंदु (3, 4) की मूल बिंदु से दूरी = ?", opts: ["5", "7", "25", "1"], ans: "A" },
            { q: "यदि P(E) = 0.3 तो P(not E) = ?", opts: ["0.3", "0.7", "1.3", "0"], ans: "B" }
          ]
        },
        {
          title: "Subjective — 5 अंक के पक्के प्रश्न", type: "write",
          items: [
            { q: "आधारभूत आनुपातिकता प्रमेय (BPT) सिद्ध कीजिए।", note: "हर साल" },
            { q: "पाइथागोरस प्रमेय सिद्ध कीजिए।", note: "alternate year" },
            { q: "द्विघात समीकरण का word problem — आयु / चाल / क्षेत्रफल प्रकार का।", note: "अंक: 5" },
            { q: "ऊँचाई-दूरी का प्रश्न — मीनार / भवन की ऊँचाई (त्रिकोणमिति)।", note: "अंक: 5" },
            { q: "समांतर श्रेढ़ी का word problem — बचत / क्रम प्रकार का।", note: "अंक: 5" },
            { q: "Ogive बनाइए (संचयी बारंबारता बाहुल्य तोरण) — ग्राफ प्रश्न।", note: "अंक: 5" },
            { q: "शंकु / बेलन का संयुक्त ठोस — पृष्ठीय क्षेत्रफल और आयतन।", note: "अंक: 5" }
          ]
        },
        {
          title: "Formulas याद रखो", type: "formula",
          items: [
            { q: "द्विघात समीकरण का मूल", f: "x = [-b ± √(b² - 4ac)] / 2a" },
            { q: "AP का nth पद", f: "aₙ = a + (n - 1)d" },
            { q: "AP का योग", f: "Sₙ = n/2 [2a + (n - 1)d]" },
            { q: "दो बिंदुओं के बीच दूरी", f: "√[(x₂ - x₁)² + (y₂ - y₁)²]" },
            { q: "खंड अनुपात (Section formula)", f: "(m₁x₂ + m₂x₁) / (m₁ + m₂)" },
            { q: "माध्यिका (Median)", f: "l + [(n/2 - cf) / f] × h" },
            { q: "शंकु का अनुप्रस्थ पृष्ठीय क्षेत्रफल", f: "πrl" },
            { q: "बेलन का संपूर्ण पृष्ठीय क्षेत्रफल", f: "2πr(r + h)" }
          ]
        }
      ]
    },
    {
      id: "science", title: "विज्ञान", en: "Science",
      groups: [
        {
          title: "MCQ Section (1 अंक each)", type: "mcq",
          items: [
            { q: "संतुलित रासायनिक समीकरण: 2Mg + O₂ → ?", opts: ["MgO", "2MgO", "Mg₂O", "MgO₂"], ans: "B" },
            { q: "pH < 7 वाला पदार्थ = ?", opts: ["क्षार", "अम्ल", "लवण", "जल"], ans: "B" },
            { q: "दर्पण सूत्र = ?", opts: ["1/f = 1/v + 1/u", "1/f = 1/v - 1/u", "f = v + u", "f = v - u"], ans: "A" },
            { q: "मेंडल ने किस पौधे पर प्रयोग किया?", opts: ["गुलाब", "मटर", "गेहूँ", "चावल"], ans: "B" },
            { q: "V = IR यह किसका नियम है?", opts: ["Newton", "Ohm", "Faraday", "Mendel"], ans: "B" }
          ]
        },
        {
          title: "Physics — पक्के प्रश्न", type: "write",
          items: [
            { q: "अवतल दर्पण का किरण आरेख — 6 cases बनाइए।", note: "5 अंक" },
            { q: "विद्युत parallel circuit का numerical (Ohm का नियम)।", note: "5 अंक" },
            { q: "दृष्टि दोष — निकट व दूर दृष्टि दोष + निवारण।", note: "5 अंक" },
            { q: "विद्युत मोटर का diagram + working।", note: "5 अंक" },
            { q: "Fleming का Left Hand Rule व Right Hand Rule।", note: "3 अंक" }
          ]
        },
        {
          title: "Chemistry — पक्के प्रश्न", type: "write",
          items: [
            { q: "रासायनिक अभिक्रियाओं के 5 प्रकार + उदाहरण।", note: "5 अंक" },
            { q: "धातु का निष्कर्षण (भर्जन, निस्तापन, अपचयन)।", note: "5 अंक" },
            { q: "अम्ल-क्षार: pH scale + indicators।", note: "5 अंक" },
            { q: "कार्बन यौगिक: साबुनीकरण + एस्टरीकरण।", note: "3-5 अंक" },
            { q: "आवर्त सारणी: आवर्त में गुणों में विवर्तन।", note: "5 अंक" }
          ]
        },
        {
          title: "Biology — पक्के प्रश्न", type: "write",
          items: [
            { q: "मानव हृदय का diagram + दोहरा परिसंचरण।", note: "5 अंक (हर साल)" },
            { q: "Nephron का diagram + मूत्र निर्माण की प्रक्रिया।", note: "5 अंक" },
            { q: "मेंडल का cross + Punnett square।", note: "5 अंक" },
            { q: "पुष्प का diagram + परागण व निषेचन।", note: "5 अंक" },
            { q: "प्रकाश संश्लेषण का समीकरण + diagram।", note: "3-5 अंक" }
          ]
        }
      ]
    },
    {
      id: "sst", title: "सामाजिक विज्ञान", en: "Social Science",
      groups: [
        {
          title: "इतिहास (History) — ~20 अंक", type: "write",
          items: [
            { q: "असहयोग आंदोलन — कारण, कार्यक्रम व समाप्ति।", note: "5 अंक (हर साल)" },
            { q: "सविनय अवज्ञा — दांडी मार्च और उसका महत्व।", note: "5 अंक" },
            { q: "फ्रांसीसी क्रांति — कारण और प्रभाव।", note: "5 अंक" },
            { q: "जर्मनी / इटली का एकीकरण।", note: "5 अंक" },
            { q: "भारतीय राष्ट्रवाद में गांधीजी का योगदान।", note: "5 अंक" }
          ]
        },
        {
          title: "भूगोल (Geography) — ~20 अंक", type: "write",
          items: [
            { q: "मिट्टी के प्रकार — जलोढ़, काली, लेटराइट, लाल।", note: "5 अंक" },
            { q: "खनिज: लौह व अलौह + उनका वितरण।", note: "5 अंक" },
            { q: "कृषि: रबी व खरीफ + समस्याएँ।", note: "5 अंक" },
            { q: "ऊर्जा: परंपरागत व गैर-परंपरागत स्रोत।", note: "5 अंक" },
            { q: "Map work: खनिज, बाँध, फसल।", note: "3-5 अंक" }
          ]
        },
        {
          title: "नागरिकशास्त्र (Civics) — ~20 अंक", type: "write",
          items: [
            { q: "बेल्जियम बनाम श्रीलंका — सत्ता की साझेदारी।", note: "5 अंक का सवाल" },
            { q: "संघीय व्यवस्था — Union / State / Concurrent list।", note: "5 अंक" },
            { q: "राजनीतिक दलों की भूमिका और चुनौतियाँ।", note: "5 अंक" },
            { q: "लोकतंत्र के परिणाम।", note: "5 अंक" },
            { q: "विकेंद्रीकरण — Panchayati Raj।", note: "3-5 अंक" }
          ]
        },
        {
          title: "अर्थशास्त्र (Economics) — ~20 अंक", type: "write",
          items: [
            { q: "प्राथमिक / द्वितीयक / तृतीयक क्षेत्रक — उदाहरण सहित।", note: "5 अंक" },
            { q: "वैश्वीकरण — MNC, WTO और प्रभाव।", note: "5 अंक" },
            { q: "मुद्रा और साख — formal व informal credit।", note: "5 अंक" },
            { q: "विकास — HDI और per capita income की तुलना।", note: "3-5 अंक" },
            { q: "उपभोक्ता अधिकार — COPRA।", note: "3-5 अंक" }
          ]
        }
      ]
    },
    {
      id: "hindi", title: "हिंदी", en: "Hindi",
      groups: [
        {
          title: "लेखन खंड", type: "write",
          items: [
            { q: "निबंध: पर्यावरण प्रदूषण / डिजिटल भारत / स्वच्छ भारत।", note: "5-7 अंक" },
            { q: "पत्र: प्रधानाचार्य को छुट्टी पत्र / संपादक को पत्र।", note: "4-5 अंक" }
          ]
        },
        {
          title: "व्याकरण", type: "write",
          items: [
            { q: "संधि — 5 प्रकार (स्वर, व्यंजन, विसर्ग)।", note: "8-10 अंक" },
            { q: "समास — 6 प्रकार।", note: "8-10 अंक" }
          ]
        },
        {
          title: "गद्य व पद्य", type: "write",
          items: [
            { q: "गद्य व्याख्या — reference to context।", note: "5 अंक" },
            { q: "पद्य भावार्थ।", note: "5 अंक" }
          ]
        }
      ]
    },
    {
      id: "english", title: "अंग्रेज़ी", en: "English",
      groups: [
        {
          title: "Writing", type: "write",
          items: [
            { q: "Letter Writing — formal complaint / application।", note: "5 अंक" },
            { q: "Paragraph Writing on given topic।", note: "5 अंक" }
          ]
        },
        {
          title: "Grammar", type: "write",
          items: [
            { q: "Tense transformation, Active-Passive voice।", note: "8-10 अंक" }
          ]
        },
        {
          title: "Reading", type: "write",
          items: [
            { q: "Prose comprehension — reference to context।", note: "5 अंक" },
            { q: "Unseen passage — factual + inferential questions।", note: "8-10 अंक" }
          ]
        }
      ]
    }
  ],
  strategy: [
    { week: "Week 1-2", work: "Chapter-wise revision — high weightage वाले अध्याय पहले" },
    { week: "Week 3-4", work: "Previous year papers solve — हर subject से कम से कम 3" },
    { week: "Week 5-6", work: "Mock tests — timed practice" },
    { week: "Week 7-8", work: "Final revision — formulas, diagrams, key points" }
  ],
  timetable: [
    { subj: "Maths", time: "2 hrs", focus: "Numericals + Proofs" },
    { subj: "Science", time: "2 hrs", focus: "Diagrams + Formulas + Numericals" },
    { subj: "SST", time: "1.5 hrs", focus: "Points notes + Map work" },
    { subj: "Hindi", time: "1 hr", focus: "Grammar + Writing" },
    { subj: "English", time: "1 hr", focus: "Reading + Grammar" }
  ],
  tips: [
    "NCERT ही पूरा स्रोत है — 90%+ प्रश्न सीधे NCERT से आते हैं।",
    "Diagrams = मुफ्त अंक — Science में 15-20 अंक diagrams से आते हैं।",
    "रोज़ 20 MCQ हर subject से solve करो।",
    "Hindi/English के letters और essays weekly लिखो।",
    "SST/Geography के maps रोज़ 10 मिनट बनाओ।",
    "Mistake diary रखो — गलतियाँ note करो, दोबारा मत करो।"
  ],
  faq: [
    { q: "JAC pattern CBSE जैसा है?", a: "काफी similar — NCERT syllabus एक जैसा, theory अंक भी। JAC का paper आमतौर पर CBSE से थोड़ा आसान। फिर भी NCERT अच्छी तरह करो — दोनों boards में top आ जाएगा।" },
    { q: "Pass marks 33% का मतलब कितने अंक?", a: "Theory + internal के 100 अंकों में 33 अंक = pass। पर सिर्फ pass का target मत रखो — 60%+ का aim करो।" },
    { q: "Science में MCQ और subjective का ratio?", a: "लगभग 20 अंक MCQ (1 अंक प्रत्येक) + 60 अंक subjective (2, 3, 5 अंक)। MCQ आसान अंक हैं — सब attempt करो।" },
    { q: "SST का syllabus बहुत बड़ा है — कैसे manage करें?", a: "4 sections = History, Geography, Civics, Economics — हर एक ~20 अंक। Important chapters पर focus करो और points-format notes बनाओ, paragraph मत पढ़ो।" },
    { q: "Previous year papers कहाँ मिलेंगे?", a: "JAC की official website, school के teachers से, और online PDF sources से। कम से कम 3-5 साल के papers solve करो — repeat pattern समझ आ जाएगा।" }
  ]
};
