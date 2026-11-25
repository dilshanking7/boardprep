// Science diagrams — information for each part
window.DIAGRAMS = [
  { id: "eye", title: "Human Eye", hi: "मानव नेत्र", subj: "science",
    desc: "नेत्र एक कैमरा जैसा काम करता है। प्रकाश कॉर्निया और लेंस से गुजरकर रेटिना पर उल्टी तस्वीर बनाता है।",
    parts: [
      { id: "cornea", label: "Cornea", hi: "कॉर्निया", x: 50, y: 22, desc: "सामने का पारदर्शी झिल्ली, प्रकाश को मोड़ता है (अपवर्तन)। यही सबसे ज्यादा अपवर्तन करता है।" },
      { id: "iris", label: "Iris", hi: "आइरिस", x: 38, y: 42, desc: "रंगीन भाग, पुतली का आकार बदलकर प्रकाश की मात्रा नियंत्रित करता है।" },
      { id: "pupil", label: "Pupil", hi: "पुतली", x: 50, y: 46, desc: "काला छिद्र, प्रकाश यहाँ से अंदर जाता है। रोशनी में सिकुड़ती, अंधेरे में फैलती है।" },
      { id: "lens", label: "Eye lens", hi: "नेत्र लेंस", x: 58, y: 54, desc: "पारदर्शी द्विउत्तल लेंस, प्रकाश को रेटिना पर केंद्रित करता है।" },
      { id: "retina", label: "Retina", hi: "रेटिना", x: 50, y: 80, desc: "संवेदी परत, जहाँ छवि बनती है। रॉड और कोन कोशिकाएँ प्रकाश को संकेत में बदलती हैं।" },
      { id: "optic", label: "Optic nerve", hi: "दृष्टि तंत्रिका", x: 74, y: 68, desc: "रेटिना के संकेत मस्तिष्क तक पहुँचाती है।" },
      { id: "sclera", label: "Sclera", hi: "स्क्लेरा", x: 26, y: 56, desc: "सफेद, मजबूत बाहरी झिल्ली, नेत्र को आकार और सुरक्षा देती है।" }
    ] },
  { id: "heart", title: "Human Heart", hi: "मानव हृदय", subj: "science",
    desc: "हृदय चार कक्षाओं वाला मांसपेशी का पंप है। दोहरा परिसंचरण ऑक्सीजनित और ऑक्सीजन-रहित रक्त को अलग रखता है।",
    parts: [
      { id: "ra", label: "Right atrium", hi: "दायां आलिंद", x: 32, y: 26, desc: "शरीर का ऑक्सीजन-रहित रक्त यहाँ एकत्र होता है।" },
      { id: "la", label: "Left atrium", hi: "बायां आलिंद", x: 68, y: 26, desc: "फेफड़ों से ऑक्सीजनयुक्त रक्त यहाँ आता है।" },
      { id: "rv", label: "Right ventricle", hi: "दायां निलय", x: 32, y: 64, desc: "रक्त को फेफड़ों की ओर धकेलता है (फुफ्फुसीय धमनी)।" },
      { id: "lv", label: "Left ventricle", hi: "बायां निलय", x: 68, y: 64, desc: "सबसे मोटी दीवार, रक्त को पूरे शरीर में भेजता है (महाधमनी)।" },
      { id: "aorta", label: "Aorta", hi: "महाधमनी", x: 72, y: 42, desc: "शरीर की सबसे बड़ी धमनी, ऑक्सीजनयुक्त रक्त ले जाती है।" },
      { id: "vena", label: "Vena cava", hi: "महाशिरा", x: 28, y: 42, desc: "शरीर का ऑक्सीजन-रहित रक्त हृदय तक लाती है।" },
      { id: "valve", label: "Valve", hi: "कपाट", x: 50, y: 46, desc: "एकदिशा का द्वार — रक्त पीछे नहीं जाता।" }
    ] },
  { id: "brain", title: "Human Brain", hi: "मानव मस्तिष्क", subj: "science",
    desc: "मस्तिष्क शरीर का नियंत्रण केंद्र है। इसके तीन मुख्य भाग — सेरेब्रम, सेरेबेलम और मेडुला।",
    parts: [
      { id: "cerebrum", label: "Cerebrum", hi: "सेरेब्रम", x: 50, y: 32, desc: "सबसे बड़ा भाग — सोचना, याद करना, भावनाएँ, निर्णय। दोनों गोले इसी से जुड़े।" },
      { id: "cerebellum", label: "Cerebellum", hi: "सेरेबेलम", x: 30, y: 62, desc: "संतुलन और शारीरिक समन्वय नियंत्रित करता है।" },
      { id: "medulla", label: "Medulla", hi: "मेडुला", x: 50, y: 78, desc: "स्वास, हृदय-गति, जैसे अचैत कार्य नियंत्रित करता है।" },
      { id: "corpus", label: "Corpus callosum", hi: "कॉर्पस कैलोसम", x: 50, y: 46, desc: "दोनों गोलों को जोड़ने वाला तंत्रिका तंतु।" },
      { id: "thalamus", label: "Thalamus", hi: "थैलेमस", x: 50, y: 56, desc: "संवेदी संकेतों को सही जगह भेजता है, जागरूकता बनाए रखता है।" },
      { id: "pituitary", label: "Pituitary", hi: "पिट्यूटरी", x: 44, y: 68, desc: "मस्तिष्क की मास्टर ग्रंथि, हार्मोन छोड़ती है।" }
    ] },
  { id: "neuron", title: "Neuron / Reflex Arc", hi: "न्यूरॉन / रीफ्लेक्स आर्क", subj: "science",
    desc: "न्यूरॉन शरीर की संकेत-वाहक कोशिका है। रीफ्लेक्स आर्क में संकेत मस्तिष्क के बिना रीफ्लेक्स से जाता है।",
    parts: [
      { id: "dendrite", label: "Dendrites", hi: "डेंड्राइट", x: 20, y: 40, desc: "संकेत स्वीकार करने वाली शाखाएँ।" },
      { id: "soma", label: "Cell body", hi: "कोशिका काय", x: 42, y: 48, desc: "केंद्रीय भाग, नाभिक के साथ।" },
      { id: "nucleus", label: "Nucleus", hi: "नाभिक", x: 42, y: 48, desc: "कोशिका का नियंत्रण केंद्र।" },
      { id: "axon", label: "Axon", hi: "एक्सॉन", x: 66, y: 48, desc: "संकेत को आगे ले जाने वाली लंबी टंग।" },
      { id: "myelin", label: "Myelin sheath", hi: "माइलिन खोल", x: 62, y: 38, desc: "प्रतिरोधी परत, संकेत को तेज़ करती है।" },
      { id: "terminal", label: "Nerve ending", hi: "तंत्रिका सिरा", x: 86, y: 48, desc: "अगले न्यूरॉन या मांसपेशी को संकेत देता है।" },
      { id: "synapse", label: "Synapse", hi: "सिनैप्स", x: 94, y: 48, desc: "दो न्यूरॉनों के बीच की खाई, कैटिनी संकेत यहाँ से जाते हैं।" }
    ] },
  { id: "digestive", title: "Digestive System", hi: "पाचन तंत्र", subj: "science",
    desc: "भोजन का पाचन ग्रसनी से शुरू होकर आंत तक जाता है। हर अंग का अपना एंजाइम काम करता है।",
    parts: [
      { id: "mouth", label: "Mouth", hi: "मुँह", x: 50, y: 14, desc: "जबड़ों से चबाना, लार में एमिलेज़ (सालिवा) स्टार्च बदलता है।" },
      { id: "oesophagus", label: "Oesophagus", hi: "ग्रसनी", x: 40, y: 30, desc: "मांसपेशियों की लहर (परिस्तल) से भोजन नीचे धकेलती है।" },
      { id: "liver", label: "Liver", hi: "यकृत", x: 66, y: 34, desc: "पित्त रचता है, जो वसा को पाचित करता है। विष निष्क्रिय करता है।" },
      { id: "stomach", label: "Stomach", hi: "जठर", x: 38, y: 42, desc: "अम्ल और पेप्सिन से प्रोटीन पाचित होता है।" },
      { id: "pancreas", label: "Pancreas", hi: "अग्न्याशय", x: 52, y: 50, desc: "इंसुलिन के साथ तीनों पाचक एंजाइम छोड़ता है।" },
      { id: "small", label: "Small intestine", hi: "सूक्ष्म आंत", x: 44, y: 66, desc: "पाचन का अंतिम भाग, विलाइटी (villi) से पोषक तत्व अवशोषित होते हैं।" },
      { id: "large", label: "Large intestine", hi: "बृहद आंत", x: 62, y: 72, desc: "पानी और खनिज अवशोषित करता है।" },
      { id: "anus", label: "Anus", hi: "मलाशय", x: 46, y: 88, desc: "अपशिष्ट बाहर निकलता है।" }
    ] },
  { id: "respiratory", title: "Respiratory System", hi: "श्वसन तंत्र", subj: "science",
    desc: "श्वसन में ऑक्सीजन फेफड़ों में रक्त को मिलती है और CO2 बाहर निकलती है।",
    parts: [
      { id: "nose", label: "Nasal cavity", hi: "नासिका", x: 50, y: 14, desc: "धूल और रोगाणुओं को रोकने वाले बाल और श्लेष्मा।" },
      { id: "trachea", label: "Trachea", hi: "श्वासनली", x: 50, y: 34, desc: "सिलिया से धूल को वापस ऊपर धकेलती है।" },
      { id: "bronchi", label: "Bronchi", hi: "श्वासनली शाखा", x: 38, y: 48, desc: "दोनों फेफड़ों में विभाजित।" },
      { id: "lung", label: "Lungs", hi: "फुफ्फुस", x: 32, y: 64, desc: "एल्वियोली में विनिमय होता है।" },
      { id: "alveoli", label: "Alveoli", hi: "एल्वियोली", x: 64, y: 66, desc: "छोटे थैले, जहाँ O2 और CO2 का विनिमय होता है।" },
      { id: "diaphragm", label: "Diaphragm", hi: "व्याप्त्यव", x: 50, y: 84, desc: "श्वसन की मुख्य मांसपेशी — ऊपर-नीचे होकर फेफड़े फुलाती-सिकोड़ती है।" },
      { id: "rib", label: "Ribs", hi: "पसलियाँ", x: 22, y: 50, desc: "फेफड़ों की सुरक्षा, साथ में चलती हैं।" }
    ] },
  { id: "kidney", title: "Excretory System", hi: "उत्सर्जन तंत्र (किडनी)", subj: "science",
    desc: "किडनी रक्त को छानकर मूत्र बनाती है। नेफ्रॉन इसकी कार्य इकाई है।",
    parts: [
      { id: "kidney", label: "Kidney", hi: "वृक्क", x: 44, y: 30, desc: "दोनों किडनी रक्त को छांटती हैं, दैनिक ~180 लीटर नेफ्रॉन छानता है।" },
      { id: "ureter", label: "Ureter", hi: "मूत्रवाहिनी", x: 34, y: 52, desc: "मूत्र को मूत्राशय तक ले जाती है।" },
      { id: "bladder", label: "Urinary bladder", hi: "मूत्राशय", x: 50, y: 74, desc: "मूत्र जमा होता है।" },
      { id: "urethra", label: "Urethra", hi: "मूत्रमार्ग", x: 50, y: 90, desc: "मूत्र बाहर निकलता है।" },
      { id: "nephron", label: "Nephron", hi: "नेफ्रॉन", x: 66, y: 34, desc: "छानने की इकाई: ग्लोमेरुलस + नलिका।" },
      { id: "glomerulus", label: "Glomerulus", hi: "ग्लोमेरुलस", x: 74, y: 26, desc: "रक्त को छानता है — पहला छानना।" },
      { id: "tubule", label: "Renal tubule", hi: "वृक्क नलिका", x: 80, y: 44, desc: "पुनः अवशोषण — पानी और आवश्यक चीज़ें वापस।" }
    ] },
  { id: "flower", title: "Structure of Flower", hi: "पुष्प की संरचना", subj: "science",
    desc: "पुष्प पौधे का जनन अंग है। परागण के बाद निषेचन से फल और बीज बनते हैं।",
    parts: [
      { id: "sepal", label: "Sepal", hi: "बाह्यदल", x: 50, y: 72, desc: "हरे पंखुड़, कली में पुष्प की रक्षा करते हैं।" },
      { id: "petal", label: "Petal", hi: "दल", x: 50, y: 54, desc: "रंगीन, कीटों को आकर्षित करते हैं।" },
      { id: "stamen", label: "Stamen", hi: "पुष्पकेशर", x: 34, y: 38, desc: "नर भाग — परागकोश और परागक।" },
      { id: "anther", label: "Anther", hi: "परागकोश", x: 30, y: 30, desc: "परागक (पराग) बनते हैं।" },
      { id: "filament", label: "Filament", hi: "तंतु", x: 38, y: 48, desc: "परागकोश को धारण करता है।" },
      { id: "pistil", label: "Pistil / Carpel", hi: "स्त्रीकेशर", x: 66, y: 38, desc: "मादा भाग — वर्तिकाग्र, वर्तिका, अंडाशय।" },
      { id: "stigma", label: "Stigma", hi: "वर्तिकाग्र", x: 66, y: 28, desc: "पराग ग्रहण करता है, चिपचिपा।" },
      { id: "ovary", label: "Ovary", hi: "अंडाशय", x: 68, y: 56, desc: "अंडकोश में अंडाणु; निषेचन के बाद फल बनता है।" }
    ] },
  { id: "photosynthesis", title: "Photosynthesis", hi: "प्रकाश संश्लेषण", subj: "science",
    desc: "हरे पौधे सूर्य-प्रकाश, CO2 और जल से भोजन (ग्लूकोज़) और ऑक्सीजन बनाते हैं।",
    parts: [
      { id: "sun", label: "Sunlight", hi: "सूर्य प्रकाश", x: 50, y: 12, desc: "ऊर्जा का स्रोत — 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
      { id: "co2in", label: "CO2 intake", hi: "CO2 प्रवेश", x: 26, y: 44, desc: "वायु से CO2 स्टोमाता द्वारा अंदर।" },
      { id: "o2out", label: "O2 release", hi: "O2 निकास", x: 74, y: 44, desc: "ऑक्सीजन बाहर निकलती है।" },
      { id: "leaf", label: "Leaf", hi: "पत्ती", x: 50, y: 56, desc: "क्लोरोफिल के कारण हरी; संश्लेषण का मुख्य स्थल।" },
      { id: "chlorophyll", label: "Chlorophyll", hi: "क्लोरोफिल", x: 42, y: 62, desc: "प्रकाश को सोखने वाला हरा रंजक।" },
      { id: "water", label: "Water", hi: "जल", x: 34, y: 80, desc: "जड़ों से पानी ऊपर आता है।" },
      { id: "glucose", label: "Glucose", hi: "ग्लूकोज़", x: 64, y: 74, desc: "बना कार्बोहाइड्रेट, पौधे का भोजन।" }
    ] },
  { id: "circuit", title: "Electric Circuit", hi: "विद्युत परिपथ", subj: "science",
    desc: "V = IR. श्रेणी में धारा समान, समांतर में विभव समान रहता है।",
    parts: [
      { id: "battery", label: "Battery / Cell", hi: "बैटरी / सेल", x: 50, y: 22, desc: "विद्युत विभव का स्रोत।" },
      { id: "wire", label: "Conducting wire", hi: "चालक तार", x: 30, y: 50, desc: "धातु का तार, इलेक्ट्रॉन बहाव का मार्ग।" },
      { id: "bulb", label: "Bulb / Resistor", hi: "बल्ब / प्रतिरोध", x: 50, y: 66, desc: "कार्य करता है — प्रकाश और ऊष्मा।" },
      { id: "switch", label: "Switch", hi: "स्विच", x: 70, y: 40, desc: "बंद/खुला, धारा रोकता या चलाता है।" },
      { id: "ammeter", label: "Ammeter", hi: "अमीटर", x: 22, y: 66, desc: "धारा मापता है, श्रेणी में लगता है।" },
      { id: "voltmeter", label: "Voltmeter", hi: "वोल्टमीटर", x: 64, y: 82, desc: "विभव मापता है, समांतर में लगता है।" }
    ] },
  { id: "acgen", title: "AC Generator", hi: "AC जनरेटर", subj: "science",
    desc: "चुंबक के चारों ओर कुंडली घुमाने पर प्रेरित विद्युत बनती है (फैराडे का नियम)।",
    parts: [
      { id: "coil", label: "Coil (Armature)", hi: "कुंडली", x: 50, y: 50, desc: "घूमती कुंडली, जिसमें विद्युत प्रेरित होती है।" },
      { id: "magnet", label: "Magnets", hi: "चुंबक", x: 26, y: 34, desc: "उत्तर-दक्षिण ध्रुव, चुंबकीय क्षेत्र बनाते हैं।" },
      { id: "slip", label: "Slip rings", hi: "स्लिप रिंग", x: 68, y: 40, desc: "AC के लिए, कुंडली को घुमाए रखती हैं।" },
      { id: "brush", label: "Brushes", hi: "ब्रश", x: 76, y: 56, desc: "बाहरी परिपथ से संपर्क।" },
      { id: "flux", label: "Magnetic flux", hi: "चुंबकीय प्रवाह", x: 40, y: 26, desc: "कुंडली से होकर गुजरने वाला चुंबकीय प्रवाह।" }
    ] },
  { id: "dcmotor", title: "DC Motor", hi: "DC मोटर", subj: "science",
    desc: "करंट लेने वाली कुंडली चुंबकीय क्षेत्र में घूमती है — Fleming का बायां हाथ नियम।",
    parts: [
      { id: "coil2", label: "Coil", hi: "कुंडली", x: 50, y: 52, desc: "धातु की कुंडली, धारा इससे गुजरती है।" },
      { id: "split", label: "Split ring", hi: "विभाजित छल्ला", x: 70, y: 46, desc: "हर आधे चक्कर पर धारा का दिशा बदल देता है।" },
      { id: "brush2", label: "Brushes", hi: "ब्रश", x: 78, y: 60, desc: "बाहरी बैटरी से संपर्क।" },
      { id: "pole", label: "Magnetic poles", hi: "चुंबकीय ध्रुव", x: 28, y: 36, desc: "बल उत्पन्न करते हैं।" },
      { id: "force", label: "Force direction", hi: "बल की दिशा", x: 44, y: 28, desc: "अँगुठा = बल, तर्जनी = क्षेत्र, मध्यमा = धारा।" }
    ] },
  { id: "magnetfield", title: "Magnetic Field Lines", hi: "चुंबक के क्षेत्र रेखाएँ", subj: "science",
    desc: "क्षेत्र रेखाएँ उत्तर ध्रुव से बाहर और दक्षिण ध्रुव में अंदर। कभी नहीं काटतीं।",
    parts: [
      { id: "north", label: "North pole", hi: "उत्तर ध्रुव", x: 30, y: 50, desc: "रेखाएँ यहाँ से बाहर निकलती हैं।" },
      { id: "south", label: "South pole", hi: "दक्षिण ध्रुव", x: 70, y: 50, desc: "रेखाएँ यहाँ अंदर जाती हैं।" },
      { id: "lines", label: "Field lines", hi: "क्षेत्र रेखाएँ", x: 50, y: 24, desc: "घनी = मजबूत क्षेत्र। बाहर से N → S।" },
      { id: "compass", label: "Compass", hi: "कंपास", x: 50, y: 74, desc: "कंपास की सुई क्षेत्र की दिशा दिखाती है।" }
    ] },
  { id: "parabola", title: "Quadratic Curve", hi: "द्विघात वक्र (परवलय)", subj: "maths",
    desc: "y = ax² + bx + c का ग्राफ परवलय होता है। शून्यक D = b² - 4ac से तय।",
    parts: [
      { id: "vertex", label: "Vertex", hi: "शीर्ष", x: 50, y: 70, desc: "(-b/2a) पर; a > 0 तो न्यूनतम, a < 0 तो अधिकतम।" },
      { id: "axis", label: "Axis of symmetry", hi: "सममिति अक्ष", x: 50, y: 40, desc: "x = -b/2a, वक्र को दो बराबर भागों में बाँटता है।" },
      { id: "root", label: "Roots (x-intercept)", hi: "शून्यक", x: 28, y: 50, desc: "D > 0 → दो, D = 0 → एक, D < 0 → कोई नहीं।" },
      { id: "root2", label: "Root 2", hi: "दूसरा शून्यक", x: 72, y: 50, desc: "x² - योग·x + गुणनफल = 0" },
      { id: "yint", label: "y-intercept", hi: "y-अंतःखंड", x: 50, y: 50, desc: "x = 0 पर y = c।" },
      { id: "curve", label: "Parabola", hi: "परवलय", x: 62, y: 26, desc: "a > 0 नीचे खुला, a < 0 ऊपर खुला।" }
    ] },
  { id: "circle", title: "Circle Theorems", hi: "वृत्त प्रमेय", subj: "maths",
    desc: "त्रिज्या, जीवा, स्पर्श रेखा और केंद्र से कोण — वृत्त के मुख्य नियम।",
    parts: [
      { id: "centre", label: "Centre", hi: "केंद्र", x: 50, y: 50, desc: "केंद्र से सभी बाहरी बिंदु समान दूरी (त्रिज्या)।" },
      { id: "radius", label: "Radius", hi: "त्रिज्या", x: 50, y: 26, desc: "O से परिधि तक; सभी त्रिज्याएँ बराबर।" },
      { id: "chord", label: "Chord", hi: "जीवा", x: 30, y: 58, desc: "दो बिंदुओं को जोड़ने वाला खंड; सबसे बड़ी जीवा = व्यास।" },
      { id: "diameter", label: "Diameter", hi: "व्यास", x: 50, y: 50, desc: "केंद्र से होकर, 2r; व्यास पर कोण 90°।" },
      { id: "tangent", label: "Tangent", hi: "स्पर्श रेखा", x: 50, y: 88, desc: "बिंदु पर 90° कोण, केंद्र से दूरी = त्रिज्या।" },
      { id: "segment", label: "Segment", hi: "वृत्तखंड", x: 74, y: 60, desc: "जीवा और चाप के बीच का क्षेत्र।" },
      { id: "sector", label: "Sector", hi: "त्रिज्यखंड", x: 36, y: 38, desc: "दो त्रिज्याओं और चाप के बीच; (θ/360)πr²" }
    ] },
  { id: "solid", title: "3D Solids", hi: "त्रि-विमीय ठोस", subj: "maths",
    desc: "घन, बेलन, शंकु और गोले का आयतन व पृष्ठीय क्षेत्रफल।",
    parts: [
      { id: "cube", label: "Cube", hi: "घन", x: 28, y: 30, desc: "आयतन a³, पृष्ठीय 6a²। सभी भुजाएँ बराबर।" },
      { id: "cylinder", label: "Cylinder", hi: "बेलन", x: 50, y: 30, desc: "आयतन πr²h, पार्श्व 2πrh, संपूर्ण 2πr(r+h)।" },
      { id: "cone", label: "Cone", hi: "शंकु", x: 72, y: 30, desc: "आयतन (1/3)πr²h, पार्श्व πrl (l = तिर्यक)।" },
      { id: "sphere", label: "Sphere", hi: "गोला", x: 28, y: 62, desc: "आयतन (4/3)πr³, पृष्ठीय 4πr²।" },
      { id: "hemisphere", label: "Hemisphere", hi: "अर्धगोला", x: 50, y: 62, desc: "आयतन (2/3)πr³, पृष्ठीय 3πr²।" },
      { id: "cuboid", label: "Cuboid", hi: "घनभुज", x: 72, y: 62, desc: "आयतन lbh, पृष्ठीय 2(lb+bh+lh)।" }
    ] },
  { id: "lens", title: "Lens and Image", hi: "लेंस और छवि", subj: "science",
    desc: "1/f = 1/v - 1/u. उत्तल लेंस वास्तविक या काल्पनिक छवि बनाता है।",
    parts: [
      { id: "opticaxis", label: "Principal axis", hi: "मुख्य अक्ष", x: 50, y: 50, desc: "केंद्र से होकर दोनों ओर।" },
      { id: "lens2", label: "Convex lens", hi: "उत्तल लेंस", x: 50, y: 50, desc: "मध्य में मोटा, किनारों पर पतला।" },
      { id: "object", label: "Object", hi: "वस्तु", x: 20, y: 36, desc: "u दूरी पर, अक्ष के ऊपर।" },
      { id: "fpoint", label: "Focus (F)", hi: "फोकस", x: 34, y: 50, desc: "u = f पर वस्तु रखने पर छवि अनंत।" },
      { id: "cpoint", label: "2F", hi: "2F", x: 66, y: 50, desc: "2f दूरी पर, बराबर आकार की छवि।" },
      { id: "image", label: "Image", hi: "छवि", x: 80, y: 64, desc: "वास्तविक, उल्टी, छोटी; f < u < 2f पर बड़ी।" },
      { id: "eye2", label: "Eye", hi: "नेत्र", x: 92, y: 50, desc: "छवि को प्रकाश के रूप में ग्रहण करता है।" }
    ] },
  { id: "foodchain", title: "Food Chain / Energy Flow", hi: "खाद्य शृंखला / ऊर्जा प्रवाह", subj: "science",
    desc: "ऊर्जा सूर्य से शुरू होकर उत्पादक → ग्राहक → अपघटक तक जाती है। हर स्तर पर 10% ही आगे।",
    parts: [
      { id: "sun2", label: "Sun", hi: "सूर्य", x: 50, y: 14, desc: "ऊर्जा का अंतिम स्रोत।" },
      { id: "producer", label: "Producer (Plant)", hi: "उत्पादक (पौधा)", x: 50, y: 32, desc: "प्रकाश संश्लेषण से भोजन बनाता है।" },
      { id: "herb", label: "Primary consumer", hi: "प्राथमिक ग्राहक", x: 42, y: 52, desc: "घास खाने वाला, जैसे हिरण।" },
      { id: "carn", label: "Secondary consumer", hi: "द्वितीयक ग्राहक", x: 58, y: 68, desc: "मांस खाने वाला, जैसे शेर।" },
      { id: "apex", label: "Tertiary consumer", hi: "तृतीयक ग्राहक", x: 44, y: 84, desc: "शीर्ष शिकारी; ऊर्जा सबसे कम।" },
      { id: "decomp", label: "Decomposers", hi: "अपघटक", x: 74, y: 86, desc: "कवक/जीवाणु, मृत पदार्थ को मिट्टी में वापस।" }
    ] },
  { id: "carboncycle", title: "Carbon Cycle", hi: "कार्बन चक्र", subj: "science",
    desc: "कार्बन वायु, समुद्र, पौधे और जीवों के बीच घूमता है।",
    parts: [
      { id: "atm", label: "Atmosphere CO2", hi: "वायुमंडल CO2", x: 50, y: 16, desc: "0.03% CO2, जीवों के लिए आवश्यक।" },
      { id: "photo2", label: "Photosynthesis", hi: "प्रकाश संश्लेषण", x: 28, y: 42, desc: "CO2 अवशोषित, O2 छोड़ी जाती है।" },
      { id: "resp", label: "Respiration", hi: "श्वसन", x: 72, y: 42, desc: "O2 लेकर CO2 बाहर।" },
      { id: "ocean", label: "Ocean", hi: "समुद्र", x: 70, y: 74, desc: "CO2 घुलकर समुद्री जीवों को मिलती है।" },
      { id: "fossil", label: "Fossil fuels", hi:"जीवाश्म ईंधन", x: 30, y: 74, desc: "कोयला, तेल जलकर CO2 बाहर।" },
      { id: "decay", label: "Decomposition", hi: "अपघटन", x: 50, y: 86, desc: "मृत जीव से CO2 वापस।" }
    ] },
  { id: "nitrogencycle", title: "Nitrogen Cycle", hi: "नाइट्रोजन चक्र", subj: "science",
    desc: "नाइट्रोजन वायु में 78% है, पर सीधे इस्तेमाल नहीं होता। जीवाणु इसे खाद में बदलते हैं।",
    parts: [
      { id: "atm2", label: "Atmospheric N2", hi: "वायुमंडलीय N2", x: 50, y: 16, desc: "78% वायु; सीधे अपचायी नहीं।" },
      { id: "fix", label: "Nitrogen fixation", hi: "नाइट्रोजन नियंत्रण", x: 28, y: 40, desc: "बिजली चमक और राइज़ोबियम जीवाणु N2 को अमोनिया बनाते हैं।" },
      { id: "nitrate", label: "Nitrates in soil", hi: "मिट्टी में नाइट्रेट", x: 72, y: 44, desc: "पौधे इन्हें जड़ों से लेते हैं।" },
      { id: "plant2", label: "Plants", hi: "पौधे", x: 36, y: 62, desc: "नाइट्रेट से प्रोटीन बनाते हैं।" },
      { id: "animal", label: "Animals", hi: "जानवर", x: 64, y: 62, desc: "पौधे खाकर प्रोटीन पाते हैं।" },
      { id: "denit", label: "Denitrification", hi: "डीनाइट्रीफिकेशन", x: 50, y: 84, desc: "जीवाणु नाइट्रेट को वापस N2 बनाते हैं।" }
    ] }
];
