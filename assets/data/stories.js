// Class 10 पाठ्य पुस्तक — अध्यायवार कहानी/सारांश (Hindi + English)
// t = पाठ का नाम, a = लेखक/कवि, hi/en = सारांश
window.STORIES = {
  hindi: [
    // क्षितिज भाग-2 — काव्य खंड
    { t: "पद", a: "सूरदास", hi: "भगवान कृष्ण की सबसे प्यारी बाल-लीला — मकरंद की प्यास। सूरदास भगवान के नित्य सखा बनकर उनके प्रेम और माधुर्य को गाते हैं।", en: "Sur Das sings of Krishna's dearest childhood play — the longing of the bee for nectar. The poet becomes God's eternal companion and praises divine love and sweetness." },
    { t: "राम-लक्ष्मण-परशुराम संवाद", a: "तुलसीदास", hi: "परशुराम के अहंकार और लक्ष्मण के नम्र शब्दों का संवाद। राम की महिमा, लक्ष्मण की निष्ठा और विनम्रता की जीत दर्शाई गई है।", en: "A dialogue between the proud Parashuram and the humble Lakshman. It shows Ram's glory, Lakshman's devotion and the victory of humility over ego." },
    { t: "आत्मकथ्य", a: "जयशंकर प्रसाद", hi: "एक बूढ़े कलाकार की संघर्षपूर्ण जिंदगी। कला के प्रति समर्पण, आत्मविश्वास और जीवन की कठिनाइयों को स्वीकार करना।", en: "The struggling life of an old artist. It speaks of devotion to art, self-belief and accepting life's hardships with grace." },
    { t: "उत्साह और अट नहीं रही है", a: "सूर्यकांत त्रिपाठी 'निराला'", hi: "नदी के प्रवाह की तरह जीवन में उत्साह कभी घटना नहीं चाहिए। मनुष्य का संघर्ष सतत चलता है, इसी में जीवन है।", en: "Like the flow of a river, enthusiasm in life must never dwindle. Man's struggle is ceaseless — that is life itself." },
    { t: "यह दंतुरित मुसकान और फसल", a: "नागार्जुन", hi: "मनुष्य की मुस्कान और प्रकृति की फसल के बीच गहरा संबंध। जीवन का संघर्ष, आशा और प्रकृति का संदेश।", en: "A deep bond between man's smile and nature's harvest — the struggle of life, hope and nature's message." },
    { t: "संगतकार", a: "मंगलेश डबराल", hi: "संगीत की ताल के साथ जीवन की ताल। साथ चलने, साझा करने और सहयोग के महत्व को दर्शाती है।", en: "The rhythm of life matches the rhythm of music. It highlights the value of togetherness, sharing and cooperation." },
    // क्षितिज भाग-2 — गद्य खंड
    { t: "नेताजी का चश्मा", a: "स्वयं प्रकाश", hi: "एक साधारण चश्मे की कहानी से स्वतंत्रता संघर्ष की यादें। देशभक्ति, त्याग और छोटी चीज़ों का बड़ा अर्थ।", en: "Through an ordinary pair of spectacles, memories of the freedom struggle. Patriotism, sacrifice and the great meaning of small things." },
    { t: "बालगोबिन भगत", a: "रामवृक्ष बेनीपुरी", hi: "तेली समाज के बालगोबिन भगत ने अंधविश्वास और अन्याय का विरोध किया। सत्य और न्याय की जीत।", en: "Balgobin Bhagat of the Teli community stood against superstition and injustice. A victory of truth and justice." },
    { t: "लखनवी अंदाज़", a: "यशपाल", hi: "लखनऊ की संस्कृति, तहज़ीब और लोगों के स्वभाव का जीवंत चित्रण।", en: "A vivid picture of Lucknow's culture, refinement and the temperament of its people." },
    { t: "एक कहानी यह भी", a: "मन्नू भंडारी", hi: "साधारण जीवन की कहानी के जरिए समाज में बदलाव और नारी की आत्मनिर्भरता पर बात।", en: "Through an ordinary tale, it speaks of social change and women's self-reliance." },
    { t: "नौबतखाने में इबादत", a: "यतींद्र मिश्र", hi: "एक बुज़ुर्ग की इबादत और बदलते समय के साथ उसका संघर्ष; वंश और परंपरा के प्रति समर्पण।", en: "An old man's worship and his struggle with changing times — dedication to lineage and tradition." },
    { t: "संस्कृति", a: "भदंत आनंद कौसल्यायन", hi: "संस्कृति राष्ट्र की आत्मा है। विविधता में एकता और सभ्यता का अर्थ समझाया गया है।", en: "Culture is the soul of a nation. It explains unity in diversity and the meaning of civilisation." },
    // कृतिका भाग-2
    { t: "माता का आँचल", a: "शिवपूजन सहाय", hi: "माँ के प्रति गरिमा और गरीब-अमीर का समान व्यवहार। मातृभूमि की शक्ति और समाज का वर्ण-भेद।", en: "Respect for motherhood and equal treatment of rich and poor. The power of the motherland and the caste divide in society." },
    { t: "साना-साना हाथ जोड़ि", a: "मधु कांकरिया", hi: "छोटे-छोटे कामों को करने से बड़ा परिवर्तन आता है। समाज की बेड़ियों को तोड़ने के लिए छोटे कदम ज़रूरी।", en: "Small efforts bring big change. Small steps are needed to break the chains of society." },
    { t: "मैं क्यों लिखता हूँ?", a: "अज्ञेय", hi: "लेखक की रचना-प्रेरणा और समाज के प्रति ज़िम्मेदारी। लेखन एक संघर्ष और संवेदना है।", en: "A writer's inspiration and responsibility towards society. Writing is both a struggle and a sensitivity." },
    { t: "एही ठेयाँ झुलनी हेरानी हो रामा!", a: "मधुसूदन कुलकर्णी", hi: "देश के प्रति गहरा प्रेम और समर्पण। स्वतंत्रता और राष्ट्र सेवा की भावना को जागृत करती कविता।", en: "Deep love and devotion for the nation. A poem that awakens the spirit of freedom and service." },
    { t: "जार्ज पंचम की नाक", a: "हरदयाल उस्मान", hi: "विनोद निबंध — अंग्रेज़ों के बनाए साम्राज्यवादी अंदाज़ का तीखा व्यंग्य।", en: "A humorous essay — a sharp satire on the imperial style created by the British." },
    // स्पर्श भाग-2 — काव्य
    { t: "साखी", a: "कबीर", hi: "कबीर की साखियाँ — सच्चाई, सदाचार और समाज के ऊँगा को दबाने की सीख।", en: "Kabir's couplets — lessons of truth, good conduct and crushing the arrogance of society." },
    { t: "पद", a: "मीरा", hi: "मीरा की भक्ति और प्रेम। श्रद्धा से सब कुछ संभव है।", en: "Meera's devotion and love. With faith, everything is possible." },
    { t: "दोहे", a: "तुलसीदास", hi: "तुलसीदास के दोहे — जीवन के मूल्य, धर्म और आचरण की सीख।", en: "Tulsidas's couplets — lessons of life's values, religion and conduct." },
    { t: "मनुष्यता", a: "मैथिलीशरण गुप्त", hi: "आपसी भाईचारे, सहानुभूति और मानवता की सीख।", en: "Lessons of brotherhood, compassion and humanity." },
    { t: "पर्वत प्रदेश में पावस", a: "सुमित्रानंदन पंत", hi: "पहाड़ों में बारिश का मनमोहक चित्रण — प्रकृति का सौंदर्य और विरह की भावना।", en: "A enchanting picture of the rains in the mountains — nature's beauty and the feeling of longing." },
    { t: "मधुर-मधुर मेरे दीपक जल", a: "महादेवी वर्मा", hi: "माँ के प्रति गहरा प्रेम और त्याग की भावना।", en: "Deep love and the spirit of sacrifice for one's mother." },
    { t: "तोप", a: "वीरेन डंगवाल", hi: "युद्ध की भयानकता और शांति की माँग। तोप की आवाज़ में बदले का रूप।", en: "The horror of war and the demand for peace. The cannon's voice carries the face of revenge." },
    { t: "कर चले हम फ़िदा", a: "कैफ़ी आज़मी", hi: "देश के लिए बलिदान की गहरी भावना।", en: "A deep feeling of sacrificing everything for the nation." },
    // स्पर्श भाग-2 — गद्य
    { t: "आत्मत्राण", a: "रवींद्रनाथ टैगोर", hi: "आत्मविश्वास और ईश्वर के प्रति श्रद्धा; छोटी सी प्रार्थना में बड़ा संदेश।", en: "Self-confidence and faith in God — a big message in a small prayer." },
    { t: "बड़े भाई साहब", a: "प्रेमचंद", hi: "भाई-बहन के संबंध और अनुशासन का महत्व। बड़े भाई की कठोरता और प्यार।", en: "The bond between siblings and the importance of discipline — an elder brother's strictness and love." },
    { t: "डायरी का एक पन्ना", a: "सीताराम सेकसरिया", hi: "डायरी के जरिए एक युवक के मन के उथल-पुथल और स्वतंत्रता संघर्ष की झलक।", en: "Through a diary page, the turmoil of a young mind and a glimpse of the freedom struggle." },
    { t: "तताँरा-वामीरो कथा", a: "लीलाधर मंडलोई", hi: "स्त्री की स्थिति और समाज के बदलाव पर बात। परंपरा और आधुनिकता का संघर्ष।", en: "On women's condition and social change — the clash between tradition and modernity." },
    { t: "तीसरी कसम के शिल्पकार शैलेंद्र", a: "प्रह्लाद अग्रवाल", hi: "चित्रकार शैलेंद्र के कला-संघर्ष की कहानी — साधारण जीवन में रहकर बड़ा रचना।", en: "The story of painter Shailendra's artistic struggle — achieving greatness while living an ordinary life." },
    { t: "अब कहाँ दूसरे के दुख से दुखी होने वाले", a: "निदा फ़ाज़ली", hi: "सामाजिक संवेदनशीलता की कमी पर तीव्र रोष। भाईचारे की अंतिम साँस पर।", en: "Sharp anger at the loss of social sensitivity — at the last breath of brotherhood." },
    { t: "गिरगिट", a: "श्रीति खेर", hi: "जीवन में परिवर्तन की प्रकृति — रंग बदलते हैं, पर अस्तित्व बना रहता है।", en: "The changing nature of life — colours change, but existence remains." },
    { t: "पतझर में टूटी पत्तियाँ", a: "रवींद्र केलेकर", hi: "जीवन मूल्यों की पहचान और आत्मबोध। गिन्नी का सोना और झेन की देन दो कहानियों का संदेश।", en: "Recognising life's values and self-realisation — the message of two stories, 'Ginni ka Sona' and 'Jhen ki Den'." },
    { t: "कारतूस", a: "हबीब तनवीर", hi: "परंपरा और आधुनिकता के टकराव पर एकांकी। समाज में बदलाव की आवश्यकता।", en: "A one-act play on the clash of tradition and modernity, and the need for change in society." },
    // संचयन भाग-2
    { t: "हरिहर काका", a: "मिथिलेश्वर", hi: "ग्रामीण जीवन और परिवार के संघर्ष। बुज़ुर्ग की एकाकीपन और सामाजिक अधिकार।", en: "Rural life and family struggles — an old man's loneliness and social justice." },
    { t: "सपनों के-से दिन", a: "गुरदयाल सिंह", hi: "युवाओं की चुनौतियाँ, बेरोज़गारी और आत्मनिर्भरता का संदेश।", en: "The challenges of the youth, unemployment and a message of self-reliance." },
    { t: "टोपी शुक्ला", a: "राही मासूम रज़ा", hi: "सामाजिक विडंबनाएँ और इंसान की मानसिकता — एक और ज़िंदगी की कहानी।", en: "Social irony and human psychology — the story of another kind of life." }
  ],

  english: [
    { t: "A Letter to God", a: "G.L. Fuentes", hi: "खेती की फसल नष्ट करने वाली ओलावृष्टि के बाद लेंचो ईमानदारी से भगवान से पैसे माँगता है। अंत में ईमानदारी और आस्था की जीत।", en: "After hailstones destroy his crop, Lencho humbly writes to God asking for money. In the end, honesty and faith win out." },
    { t: "Nelson Mandela: Long Walk to Freedom", a: "Nelson Mandela", hi: "नेल्सन मंडेला का बंटवारे वाले दक्षिण अफ्रीका से लेकर 27 साल की जेल और अंततः राष्ट्रपति बनने तक का संघर्ष।", en: "Nelson Mandela's journey from apartheid South Africa through 27 years in jail to becoming President — the long walk to freedom." },
    { t: "Two Stories about Flying", a: "Connie Birchfield", hi: "दो कहानियाँ — 'एक पत्र जो डाकघर नहीं गया' और 'काला एम्बा'। साहस, डर और आत्मविश्वास का संदेश।", en: "Two tales — 'The Black Aeroplane' style narrative of a flying experience and 'A Question of Trust'-like caution. Courage, fear and confidence." },
    { t: "From the Diary of Anne Frank", a: "Anne Frank", hi: "एनी फ्रैंक की डायरी — यहूदियों के साथ हुए अत्याचार और छिपकर रहने का दर्द।", en: "Anne Frank's diary — the atrocities against Jews and the pain of living in hiding." },
    { t: "The Hundred Dresses - I", a: "Eleanor Estes", hi: "वंडा पेतुशेक के पास सौ कपड़े होने का झूठा दावा; उसकी गरीबी और उसका फैसला।", en: "Wanda Petronski claims to own a hundred dresses. Her poverty and her decision to leave school." },
    { t: "The Hundred Dresses - II", a: "Eleanor Estes", hi: "वंडा की गलती का एहसास और माफी। क्रूरता का प्रभाव और क्षमा की शक्ति।", en: "Realising Wanda's truth and seeking forgiveness. The impact of cruelty and the power of apology." },
    { t: "Glimpses of India", a: "Alphonse Daudet / others", hi: "भारत की विविधता — ब्रिन्दाबन के बेकर, गोवा की संस्कृति और केरल का पृष्ठभूमि।", en: "The diversity of India — the baker of Goa, Indian culture and the landscapes that shape its stories." },
    { t: "Mijbil the Otter", a: "Gavin Maxwell", hi: "लेखक के साथ उसके ओटर मिज़बिल की प्यारी-सी यात्रा। प्रकृति और पालतू जानवरों का संबंध।", en: "The affectionate journey of the author with his otter Mijbil. A bond with nature and a pet." },
    { t: "Madam Rides the Bus", a: "Vallikkannan", hi: "छोटी लड़की चाँदी की बस यात्रा की इच्छा से बस पर चढ़ती है। जीवन के झटकों और परिवर्तन का अनुभव।", en: "Little Valli fulfils her wish to ride the bus. She experiences life's shocks and the change they bring." },
    { t: "The Sermon at Benares", a: "Betty Renshaw", hi: "बुद्ध का उपदेश — मृत्यु और शोक का सामना कैसे करें। काकीमा की कहानी।", en: "Buddha's sermon — how to face death and grief, through the story of Kisa Gotami." },
    { t: "The Proposal", a: "Anton Chekhov", hi: "व्यंग्यात्मक नाटक — विवाह के लिए भागदौड़ और पैसे का महत्व।", en: "A satirical play — the rush for marriage and the importance of money." },
    { t: "Dust of Snow", a: "Robert Frost", hi: "बूढ़े कोयले जैसे दिल पर बर्फ की एक बूँद का संतुलन बदल देती है।", en: "A crow shaking down dust of snow changes the poet's mood — a small moment, a big change." },
    { t: "Fire and Ice", a: "Robert Frost", hi: "अग्नि और बर्फ — दो रूपों में संसार का अंत। क्रोध और ठंडे स्वभाव की सीख।", en: "Fire and ice — the end of the world in two forms. A lesson on anger and coldness." },
    { t: "A Tiger in the Zoo", a: "Leslie Norris", hi: "चिड़ियाघर का बाघ — प्रकृति के शिकारी का बंदी जीवन, आकाश देखने की चाह।", en: "The zoo tiger — a wild hunter's caged life and its longing for the open sky." },
    { t: "How to Tell Wild Animals", a: "Carolyn Wells", hi: "हाथी, चीता, भालू आदि जंगली जानवरों की पहचान — हास्यपूर्ण कविता।", en: "Identifying wild animals — the elephant, the leopard, the bear — in a humorous poem." },
    { t: "The Ball Poem", a: "John Berryman", hi: "गेंद खोने के बाद बच्चे को जिम्मेदारी और हानि का एहसास।", en: "After losing his ball, a boy learns responsibility and the reality of loss." },
    { t: "Amanda!", a: "Robin Klein", hi: "अमांडा को हर जगह अनुशासन और सुझाव मिलते हैं; वह अपने सपनों में खोई रहती है।", en: "Amanda is told what to do everywhere; she escapes into her own dreams." },
    { t: "Animals", a: "Walt Whitman", hi: "पशुओं की सादगी और प्रेम — मनुष्य से बेहतर जीवन।", en: "The simplicity and love of animals — a life better than humans'." },
    { t: "The Trees", a: "Adrienne Rich", hi: "पेड़ों की चाह और स्वतंत्रता — घर से बाहर जंगल की ओर।", en: "The trees' longing and freedom — from the house towards the forest." },
    { t: "Fog", a: "Carl Sandburg", hi: "कोहरे की तरह जीवन चला आता है और चला जाता है।", en: "Like fog, life comes and goes quietly." },
    { t: "The Tale of Custard the Dragon", a: "Ogden Nash", hi: "कमज़ोर दिखने वाला ड्रैगन कस्टर्ड असल में सबसे साहसी — हास्यपूर्ण कविता।", en: "Custard the dragon looks weak but is the bravest of all — a humorous poem." },
    { t: "For Anne Gregory", a: "W.B. Yeats", hi: "प्रेम के बारे में — रूप देखकर प्यार या स्वयं को देखकर।", en: "On love — whether we love for beauty or for the person within." },
    { t: "A Triumph of Surgery", a: "James Herriot", hi: "पालतू कुत्ता ट्रिकी बीमार होता है; सर्जन की सलाह से उसकी चार दिन की डाइट से ठीकी।", en: "The pet dog Tricki falls ill; the vet's advice and a four-day diet bring about a triumph of surgery." },
    { t: "The Thief's Story", a: "Ruskin Bond", hi: "चोर हरीशंकर की कहानी — एक ईमानदार व्यक्ति के साथ उसकी दुश्मनी और बदलाव।", en: "The thief Hari Singh's story — his changing relation with an honest man." },
    { t: "The Midnight Visitor", a: "Robert Arthur", hi: "चालाक और बुद्धिमान — अपहर्ता के चक्कर में फंसा चोर।", en: "The clever and the cunning — a thief caught in a kidnapper's trap." },
    { t: "A Question of Trust", a: "Vikram Seth", hi: "दो चोरों की कहानी — एक-दूसरे पर भरोसा नहीं।", en: "The story of two thieves who trust no one." },
    { t: "Footprints without Feet", a: "H.G. Wells", hi: "अदृश्य व्यक्ति की कहानी — विज्ञान और अनैतिक उपयोग पर रोशनी।", en: "The tale of an invisible man — science and its unethical use." },
    { t: "The Making of a Scientist", a: "Robert W. Peterson", hi: "ई.बी. विल्सन के साथ रिश्तर की कहानी — जिज्ञासा से वैज्ञानिक बनना।", en: "The story of Richard E. Wilson's teacher — how curiosity makes a scientist." },
    { t: "The Necklace", a: "Guy de Maupassant", hi: "मैतली का हार खोने की कहानी — लालच और झूठ का भारी मूल्य।", en: "Mathilde's lost necklace — the heavy price of greed and lies." },
    { t: "The Hack Driver", a: "Sinclair Lewis", hi: "न्यायाधीश के साथ एक हैक ड्राइवर की कहानी — विश्वास और धोखा।", en: "A hack driver's tale with the judge — trust and deception." },
    { t: "Bholi", a: "K.A. Abbas", hi: "भोली को पढ़ाई और आत्मविश्वास ने जीवन बदल दिया — विकलांगता को चुनौती।", en: "Education and self-confidence transform Bholi's life — a challenge to disability." },
    { t: "The Book that Saved the Earth", a: "Robert C. O'Brien", hi: "पुस्तक के पन्ने पलटने से अंतरिक्ष यात्रियों का भ्रम — विज्ञान-कथा हास्य।", en: "Turning the pages of a book confuses the space visitors — a science-fiction comedy." }
  ],

  sanskrit: [
    { t: "शुचिपर्यावरणम्", a: "शेमुषी १", hi: "स्वच्छ पर्यावरण का महत्व — पर्यावरण प्रदूषण से बचाव और हरित ऊर्जा का संदेश।", en: "The importance of a clean environment — protection from pollution and the message of green energy." },
    { t: "बुद्धिर्बलवती सदा", a: "शेमुषी २", hi: "बुद्धि शरीर से बड़ी है — कमज़ोर दिखने वाला भी बुद्धि से सबको जीत सकता है।", en: "Intelligence is greater than the body — even the weak can win through wisdom." },
    { t: "व्यायामः सर्वदा पथ्यः", a: "शेमुषी ३", hi: "नियमित व्यायाम से स्वास्थ्य और ऊर्जा बनी रहती है।", en: "Regular exercise keeps one healthy and energetic." },
    { t: "शिशुलालनम्", a: "शेमुषी ४", hi: "बच्चों के प्रति स्नेह और देखभाल का महत्व — माँ का प्यार सबसे बड़ा।", en: "The importance of love and care for children — a mother's love is the greatest." },
    { t: "जननी तुल्यवत्सला", a: "शेमुषी ५", hi: "माँ का वात्सल्य — जीवन में सबसे मीठा और शुद्ध संबंध।", en: "A mother's affection — the sweetest and purest bond in life." },
    { t: "सुभाषितानि", a: "शेमुषी ६", hi: "अच्छी बातों और नैतिक शिक्षाओं का संग्रह — जीवन के मूल्य।", en: "A collection of good sayings and moral lessons — the values of life." },
    { t: "सौहार्दं प्रकृतेः शोभा", a: "शेमुषी ७", hi: "प्रकृति का सौहार्द — मित्रता और एकता का संदेश।", en: "The warmth of nature — a message of friendship and unity." },
    { t: "विचित्रः साक्षी", a: "शेमुषी ८", hi: "एक अजीब घटना के साक्षी — जीवन में आश्चर्य और सतर्कता।", en: "A witness to a strange event — surprise and caution in life." },
    { t: "सूक्तयः", a: "शेमुषी ९", hi: "जीवन के लिए प्रेरणादायक सूक्तियाँ — ज्ञान और आचरण।", en: "Inspiring maxims for life — knowledge and conduct." },
    { t: "भूकम्पविभीषिका", a: "शेमुषी १०", hi: "भूकंप जैसी आपदा से डरना नहीं, साहस और सहयोग से निपटना।", en: "Do not fear disasters like earthquakes — face them with courage and cooperation." },
    { t: "प्राणेभ्योऽपि प्रियः सुह्रद्", a: "शेमुषी ११", hi: "मित्र से प्राण प्रिय — सच्ची मित्रता की महिमा।", en: "A true friend is dearer than life — the glory of real friendship." },
    { t: "अन्योक्तयः", a: "शेमुषी १२", hi: "अन्योक्ति — अप्रत्यक्ष रूप से संदेश देने की कला।", en: "Anyokti — the art of conveying a message indirectly." }
  ]
};
