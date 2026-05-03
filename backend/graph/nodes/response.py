"""
response_node — Final AI response generator for Pollaris.
Uses Groq (llama-3.3-70b-versatile) with a comprehensive rule-based fallback knowledge engine.
Works for FREE with zero API keys using pure Python keyword matching.
"""

from graph.state import PollarisState
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from prompts.system import (
    SYSTEM_PROMPT,
    GREETING_BY_LANGUAGE,
    FALLBACK_RESPONSE,
    UNSURE_RESPONSE,
)
import os
import logging
import re

# ── Constants and Signals ─────────────────────────────────────────────────────

GREETING_WORDS = {
    "hi", "hello", "hey", "namaste", "namaskar", "hola",
    "नमस्ते", "नमस्कार", "হ্যালো", "வணக்கம்", "నమస్కారం",
    "ਸਤ ਸ੍ਰੀ ਅకਾਲ", "ಹಲೋ", "ഹലോ", "helo", "yo", "sup",
}

FIRST_TIME_VOTER_SIGNALS = [
    "pehli baar", "first time", "naya voter", "new voter",
    "paheli bar", "pehle kabhi", "पहली बार", "first vote",
    "never voted", "never vote",
]

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "kn": "Kannada",
    "ml": "Malayalam",
    "or": "Odia",
    "ur": "Urdu",
}

# ── Knowledge Engine Data ─────────────────────────────────────────────────────

ANSWERS = {
    "eligibility": {
        "en": "To vote in India you must be:\n1. 18 years or older on the qualifying date\n2. An Indian citizen\n3. Ordinarily resident in the constituency\n4. Registered in the electoral roll\n5. Not disqualified by law\n\n📋 Source: Article 326, Constitution of India",
        "hi": "भारत में वोट देने के लिए:\n1. पात्रता तिथि पर 18 वर्ष या उससे अधिक आयु\n2. भारतीय नागरिक होना चाहिए\n3. निर्वाचन क्षेत्र का सामान्य निवासी\n4. मतदाता सूची में नाम होना चाहिए\n5. कानून द्वारा अयोग्य नहीं ठहराया गया हो\n\n📋 Source: Article 326, Constitution of India",
        "default": "India mein vote dene ke liye 18+ saal, Indian citizenship aur voter list mein naam hona zaroori hai.\n\n📋 Source: eci.gov.in"
    },
    "registration": {
        "en": "To register as a new voter:\n1. Fill Form 6 on voters.eci.gov.in\n2. Upload photo, age proof, and address proof\n3. Booth Level Officer (BLO) will verify\n4. Your name will be added to the Electoral Roll\n\n📋 Source: eci.gov.in",
        "hi": "नए मतदाता के रूप में पंजीकरण के लिए:\n1. voters.eci.gov.in पर फॉर्म 6 भरें\n2. फोटो, आयु प्रमाण और पते का प्रमाण अपलोड करें\n3. बीएलओ (BLO) आपके घर आकर वेरिफिकेशन करेगा\n4. आपका नाम मतदाता सूची में जोड़ दिया जाएगा\n\n📋 Source: eci.gov.in",
        "default": "Naya voter registration ke liye voters.eci.gov.in par Form 6 bharein.\n\n📋 Source: eci.gov.in"
    },
    "voter_id": {
        "en": "To get or download your Voter ID (EPIC):\n1. Visit voters.eci.gov.in\n2. Use 'Download e-EPIC' for digital copy\n3. Enter your EPIC number or Form reference number\n4. PVC card is delivered to your registered address via post\n\n📋 Source: eci.gov.in",
        "hi": "वोटर आईडी (EPIC) प्राप्त या डाउनलोड करने के लिए:\n1. voters.eci.gov.in पर जाएं\n2. डिजिटल कॉपी के लिए 'Download e-EPIC' का उपयोग करें\n3. अपना एपिक नंबर या फॉर्म संदर्भ संख्या दर्ज करें\n4. पीवीसी कार्ड डाक के माध्यम से आपके पंजीकृत पते पर भेजा जाता है\n\n📋 Source: eci.gov.in",
        "default": "Voter ID download karne ke liye voters.eci.gov.in par 'e-EPIC' section dekhein.\n\n📋 Source: eci.gov.in"
    },
    "id_proofs": {
        "en": "You can carry any of these 12 IDs to the booth:\n1. EPIC (Voter ID)\n2. Aadhaar Card\n3. PAN Card\n4. Passport\n5. Driving License\n6. MGNREGA Job Card\n7. Passbook with Photo (Bank/Post Office)\n8. Health Insurance Smart Card\n9. Pension Document\n10. Official ID cards (Govt/PSU)\n11. Unique Disability ID (UDID)\n12. Smart Card issued by RGI\n\n📋 Source: ECI Order, 2024",
        "hi": "आप इनमें से कोई भी 12 आईडी बूथ पर ले जा सकते हैं:\n1. एपिक (वोटर आईडी)\n2. आधार कार्ड\n3. पैन कार्ड\n4. पासपोर्ट\n5. ड्राइविंग लाइसेंस\n6. मनरेगा जॉब कार्ड\n7. फोटो वाली पासबुक\n8. स्वास्थ्य बीमा स्मार्ट कार्ड\n9. पेंशन दस्तावेज\n10. सरकारी/पीएसयू आईडी कार्ड\n11. विशिष्ट विकलांगता आईडी (UDID)\n12. आरजीआई स्मार्ट कार्ड\n\n📋 Source: ECI Order, 2024",
        "default": "Vote dene ke liye Voter ID, Aadhaar, PAN, ya Passport jaise 12 valid IDs ka upyog kar sakte hain.\n\n📋 Source: eci.gov.in"
    },
    "booth_finder": {
        "en": "To find your Polling Booth:\n1. Visit electoralsearch.eci.gov.in\n2. SMS <EPIC> <Space> <EPIC Number> to 1950\n3. Check 'Know Your Polling Station' on Voter Helpline App\n4. Your booth is usually within 2km of your residence\n\n📋 Source: eci.gov.in",
        "hi": "अपना पोलिंग बूथ खोजने के लिए:\n1. electoralsearch.eci.gov.in पर जाएं\n2. 1950 पर SMS करें: <EPIC> <Space> <एपिक नंबर>\n3. वोटर हेल्पलाइन ऐप पर 'Know Your Polling Station' देखें\n4. आपका बूथ आमतौर पर आपके घर के 2 किमी के दायरे में होता है\n\n📋 Source: eci.gov.in",
        "default": "Apna booth janne ke liye 1950 par SMS karein ya electoralsearch.eci.gov.in check karein.\n\n📋 Source: eci.gov.in"
    },
    "voting_process": {
        "en": "9-Step Voting Process:\n1. Reach booth (7 AM - 6 PM)\n2. Identity check by 1st Polling Officer\n3. Inking and signature with 2nd Officer\n4. 3rd Officer releases EVM\n5. Enter voting compartment\n6. Press blue button on EVM\n7. Check red light and beep\n8. Verify VVPAT slip (visible for 7 seconds)\n9. Exit the booth\n\n📋 Source: ECI Voting Handbook",
        "hi": "मतदान की 9-चरणीय प्रक्रिया:\n1. बूथ पर पहुंचें (सुबह 7 से शाम 6 बजे)\n2. प्रथम मतदान अधिकारी द्वारा पहचान जांच\n3. दूसरे अधिकारी द्वारा स्याही और हस्ताक्षर\n4. तीसरा अधिकारी EVM चालू करेगा\n5. वोटिंग कंपार्टमेंट में जाएं\n6. EVM पर नीला बटन दबाएं\n7. लाल बत्ती और बीप चेक करें\n8. VVPAT पर्ची देखें (7 सेकंड)\n9. बूथ से बाहर निकलें\n\n📋 Source: ECI Voting Handbook",
        "default": "Booth par identity check ke baad, EVM par neela button dabayein aur VVPAT slip verify karein.\n\n📋 Source: eci.gov.in"
    },
    "evm": {
        "en": "EVMs are standalone, non-networked machines. They cannot be hacked as they have no internet or wireless connectivity. Every vote is verified by the VVPAT (Voter Verifiable Paper Audit Trail) which shows the printed slip of your choice for 7 seconds.\n\n📋 Source: eci.gov.in/evm-vvpat",
        "hi": "EVM स्टैंडअलोन, गैर-नेटवर्क वाली मशीनें हैं। उन्हें हैक नहीं किया जा सकता क्योंकि उनमें इंटरनेट या वायरलेस कनेक्टिविटी नहीं होती है। प्रत्येक वोट को VVPAT द्वारा सत्यापित किया जाता है जो 7 सेकंड के लिए आपकी पसंद की मुद्रित पर्ची दिखाता है।\n\n📋 Source: eci.gov.in/evm-vvpat",
        "default": "EVM puri tarah safe hai, yeh kisi network se nahi judi hoti. VVPAT se aap apna vote verify kar sakte hain.\n\n📋 Source: eci.gov.in"
    },
    "nota": {
        "en": "NOTA (None of the Above) is the last button on the EVM. If you do not wish to vote for any candidate, you can press NOTA. It gives voters the right to express dissatisfaction with all candidates while maintaining secrecy.\n\n📋 Source: Supreme Court Judgment, 2013",
        "hi": "नोटा (None of the Above) EVM का आखिरी बटन है। यदि आप किसी भी उम्मीदवार को वोट नहीं देना चाहते हैं, तो आप नोटा दबा सकते हैं। यह मतदाताओं को गोपनीयता बनाए रखते हुए सभी उम्मीदवारों के प्रति असंतोष व्यक्त करने का अधिकार देता है।\n\n📋 Source: Supreme Court Judgment, 2013",
        "default": "Agar aap kisi candidate ko vote nahi dena chahte, toh EVM par sabse neeche 'NOTA' ka button dabayein.\n\n📋 Source: eci.gov.in"
    },
    "election_dates": {
        "en": "Voting usually takes place between 7:00 AM and 6:00 PM. For the complete election schedule and specific dates for your area, visit eci.gov.in or check the Voter Helpline App.\n\n📋 Source: eci.gov.in",
        "hi": "मतदान आमतौर पर सुबह 7:00 बजे से शाम 6:00 बजे के बीच होता है। अपने क्षेत्र के लिए पूर्ण चुनाव कार्यक्रम और विशिष्ट तिथियों के लिए, eci.gov.in पर जाएं या वोटर हेल्पलाइन ऐप देखें।\n\n📋 Source: eci.gov.in",
        "default": "Voting ka samay subah 7 se shaam 6 baje tak hota hai. Dates ke liye eci.gov.in dekhein.\n\n📋 Source: eci.gov.in"
    },
    "registration_check": {
        "en": "To check if your name is in the Voter List:\n1. Visit electoralsearch.eci.gov.in\n2. Search by Details (Name, Age, State)\n3. Search by EPIC Number\n4. Search by Mobile Number\nIf your name appears, you are eligible to vote.\n\n📋 Source: eci.gov.in",
        "hi": "यह जांचने के लिए कि आपका नाम मतदाता सूची में है या नहीं:\n1. electoralsearch.eci.gov.in पर जाएं\n2. विवरण (नाम, आयु, राज्य) द्वारा खोजें\n3. एपिक नंबर द्वारा खोजें\n4. मोबाइल नंबर द्वारा खोजें\nयदि आपका नाम सूची में आता है, तो आप वोट देने के पात्र हैं।\n\n📋 Source: eci.gov.in",
        "default": "Electoral roll mein apna naam check karne ke liye electoralsearch.eci.gov.in par jayein.\n\n📋 Source: eci.gov.in"
    },
    "postal_ballot": {
        "en": "Postal Ballot or Home Voting is available for:\n1. Senior Citizens (85+ years)\n2. Persons with Disabilities (40% benchmark)\n3. Essential Service workers\n4. Election duty staff\nEligible voters must apply using Form 12D within 5 days of election notification.\n\n📋 Source: ECI Guidelines",
        "hi": "पोस्टल बैलेट या होम वोटिंग इनके लिए उपलब्ध है:\n1. वरिष्ठ नागरिक (85+ वर्ष)\n2. दिव्यांग व्यक्ति (40% बेंचमार्क)\n3. आवश्यक सेवा कर्मचारी\n4. चुनाव ड्यूटी स्टाफ\nपात्र मतदाताओं को अधिसूचना के 5 दिनों के भीतर फॉर्म 12D भरकर आवेदन करना होगा।\n\n📋 Source: ECI Guidelines",
        "default": "Buzurg (85+) aur divyang voters ke liye Form 12D ke jariye ghar se vote dene ki suvidha hai.\n\n📋 Source: eci.gov.in"
    },
    "violation_report": {
        "en": "To report violations (bribery, threats, etc.):\n1. Download cVIGIL App\n2. Upload photo/video of violation\n3. Action is taken within 100 minutes\n4. You can also call 1950 or contact the District Election Officer.\n\n📋 Source: eci.gov.in/cvigil",
        "hi": "आचार संहिता के उल्लंघन (रिश्वत, धमकी आदि) की रिपोर्ट करने के लिए:\n1. cVIGIL ऐप डाउनलोड करें\n2. फोटो/वीडियो अपलोड करें\n3. 100 मिनट के भीतर कार्रवाई की जाती है\n4. आप 1950 पर कॉल कर सकते हैं या जिला निर्वाचन अधिकारी से संपर्क कर सकते हैं।\n\n📋 Source: eci.gov.in/cvigil",
        "default": "Kisi bhi chunav ullanghan ki shikayat cVIGIL app par karein, 100 minute mein karwai hogi.\n\n📋 Source: eci.gov.in/cvigil"
    },
    "helpline": {
        "en": "For any election-related assistance, call the National Voter Helpline at 1950 (Toll-Free). You can get info on registration, EPIC, booth location, and more.\n\n📋 Source: eci.gov.in",
        "hi": "चुनाव संबंधी किसी भी सहायता के लिए, राष्ट्रीय मतदाता हेल्पलाइन 1950 (टोल-फ्री) पर कॉल करें। आप पंजीकरण, एपिक, बूथ स्थान और बहुत कुछ के बारे में जानकारी प्राप्त कर सकते हैं।\n\n📋 Source: eci.gov.in",
        "default": "Kisi bhi sawal ke liye 1950 toll-free helpline par call karein.\n\n📋 Source: eci.gov.in"
    },
    "types_of_elections": {
        "en": "India holds several types of elections:\n1. Lok Sabha (General Elections) - To elect MPs\n2. Vidhan Sabha (State Assembly) - To elect MLAs\n3. Rajya Sabha (Upper House) - Indirect election\n4. Local Bodies (Panchayat/Municipality)\n5. Presidential elections.\n\n📋 Source: eci.gov.in",
        "hi": "भारत में कई प्रकार के चुनाव होते हैं:\n1. लोकसभा (आम चुनाव) - सांसदों (MP) को चुनने के लिए\n2. विधानसभा - विधायकों (MLA) को चुनने के लिए\n3. राज्यसभा - अप्रत्यक्ष चुनाव\n4. स्थानीय निकाय (पंचायत/नगरपालिका)\n5. राष्ट्रपति चुनाव।\n\n📋 Source: eci.gov.in",
        "default": "Bharat mein Lok Sabha, Vidhan Sabha aur Sthaniya Nikay (Panchayat/MCD) ke chunav hote hain.\n\n📋 Source: eci.gov.in"
    },
    "winner_decision": {
        "en": "In India, winners are decided by the First-Past-The-Post (FPTP) system. The candidate with the highest number of valid votes in a constituency is declared the winner. To form a government, a party or coalition must have more than 50% of the total seats.\n\n📋 Source: Constitution of India",
        "hi": "भारत में, विजेताओं का फैसला 'फर्स्ट-पास्ट-द-पोस्ट' (FPTP) प्रणाली द्वारा किया जाता है। निर्वाचन क्षेत्र में सबसे अधिक वैध वोट पाने वाले उम्मीदवार को विजेता घोषित किया जाता है। सरकार बनाने के लिए बहुमत आवश्यक है।\n\n📋 Source: Constitution of India",
        "default": "Jis candidate ko sabse zyada vote milte hain, wahi vijeta banta hai (FPTP system).\n\n📋 Source: eci.gov.in"
    }
}

KEYWORDS = {
    "eligibility": ["age", "umar", "umra", "kitne saal", "18", "eligible", "kaun vote", "who can vote", "yogya", "qualification"],
    "registration": ["register", "registration", "naam daalna", "form 6", "form6", "enroll", "naama", "register kaise", "voter list mein", "add name"],
    "voter_id": ["voter id", "epic", "voter card", "matdata pehchan", "id card", "pehchan patra", "voter id kaise", "download"],
    "id_proofs": ["kya le jaayein", "kya laana", "which id", "valid id", "id proof", "kaun sa id", "documents", "aadhaar", "passport", "pan card", "what to carry", "kya saath le"],
    "booth_finder": ["booth", "polling station", "kahan jaana", "where to vote", "voting center", "booth kahan", "mere booth", "my booth", "find booth", "nearest booth"],
    "voting_process": ["vote kaise", "how to vote", "voting process", "election day", "matdan", "kya karna", "steps", "procedure", "process", "din kya", "voting day"],
    "evm": ["evm", "electronic voting", "machine", "hack", "safe hai", "tamper", "vvpat", "paper slip", "electronic voting machine"],
    "nota": ["nota", "none of the above", "koi nahi", "reject", "no one", "sabko reject"],
    "election_dates": ["kab hai", "date", "when", "kitne baje", "time", "timing", "schedule", "calendar", "7 baje", "6 baje", "open"],
    "registration_check": ["naam hai", "check naam", "list mein", "voter list check", "my name", "electoral roll", "apna naam", "registered hoon"],
    "postal_ballot": ["ghar se vote", "home vote", "postal", "post", "elderly", "budhapa", "disability", "ghar baithe"],
    "violation_report": ["complaint", "report", "shikayat", "cvigil", "problem", "galat", "bribery", "rishwat", "booth capture", "fake voting", "violence", "intimidation"],
    "helpline": ["helpline", "1950", "call karo", "phone", "help", "contact", "number", "toll free"],
    "types_of_elections": ["lok sabha", "vidhan sabha", "types", "kitne prakar", "mp", "mla", "municipality", "panchayat", "rajya sabha", "assembly"],
    "winner_decision": ["winner", "jeet", "kaun jeeta", "majority", "seats", "result", "count", "fptp", "pm kaise", "cm kaise", "government kaise", "coalition"],
}

# ── Helper Functions ──────────────────────────────────────────────────────────

def _is_greeting(text: str) -> bool:
    words = set(text.lower().strip().split())
    return bool(words & GREETING_WORDS) or (len(text.strip()) <= 15 and any(g in text.lower() for g in GREETING_WORDS))

def _is_first_time_voter(text: str) -> bool:
    tl = text.lower()
    return any(signal in tl for signal in FIRST_TIME_VOTER_SIGNALS)

def _rule_based_answer(text: str, language: str, intent: str) -> str:
    text_lower = text.lower()
    group = None

    # 1. Check keyword matching
    for g, keywords in KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            group = g
            break
    
    # 2. Intent matching as backup
    if not group:
        intent_to_group = {
            "voting": "voting_process",
            "booth": "booth_finder",
            "candidate": "winner_decision",
            "report": "violation_report",
            "eci": "election_dates",
            "registration": "registration",
        }
        group = intent_to_group.get(intent)
    
    if not group:
        return ""

    # 3. Get answer in right language
    lang_answers = ANSWERS.get(group, {})
    answer = (
        lang_answers.get(language) or
        lang_answers.get("default") or
        lang_answers.get("en")
    )
    
    if answer:
        return answer
        
    # Ultimate fallback from system prompts
    return FALLBACK_RESPONSE.get(language, FALLBACK_RESPONSE["en"])

def _build_context_injection(state: PollarisState) -> str:
    """Injects verified structured data into prompt."""
    parts = []
    draft = state.get("response_text", "")
    if draft:
        parts.append(f"VERIFIED DRAFT ANSWER:\n{draft}")

    booths = state.get("booth_result")
    if not booths:
        booths = []
    elif not isinstance(booths, list):
        booths = [booths]
    
    if booths:
        blines = "\n".join(f"• {b.get('name', 'N/A')} ({b.get('address', 'N/A')})" for b in booths)
        parts.append(f"POLLING BOOTHS:\n{blines}")

    candidates = state.get("candidate_result")
    if candidates:
        clines = "\n".join(f"• {c['name']} ({c['party']})" for c in (candidates if isinstance(candidates, list) else [candidates]))
        parts.append(f"CANDIDATES:\n{clines}")

    return "\n\n".join(parts) if parts else ""

# ── Main Node ─────────────────────────────────────────────────────────────────

async def response_node(state: PollarisState) -> PollarisState:
    """Generates response using LLMs or the Knowledge Engine fallback."""
    messages = state.get("messages", [])
    language = state.get("language", "en")
    intent = state.get("intent", "general")
    
    last_text = ""
    if messages:
        last_msg = messages[-1]
        last_text = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    # 1. Check greeting
    if _is_greeting(last_text):
        greeting = GREETING_BY_LANGUAGE.get(language, GREETING_BY_LANGUAGE["en"])
        if _is_first_time_voter(last_text):
            if language == 'hi':
                prefix = "Wah! Aap pehli baar vote de rahe hain — yeh bahut acchi baat hai! 🌟\nAap history bana rahe hain! Main aapko step-by-step guide karoonga.\n\n"
            elif language == 'ta':
                prefix = "வாழ்த்துக்கள்! நீங்கள் முதல்முறையாக வாக்களிக்கிறீர்கள் — இது மிகவும் மகிழ்ச்சியான விஷயம்! 🌟\nநீங்கள் வரலாற்றை உருவாக்குகிறீர்கள்! நான் உங்களுக்கு படிப்படியாக வழிகாட்டுவேன்.\n\n"
            elif language == 'te':
                prefix = "అభినందనలు! మీరు మొదటిసారి ఓటు వేస్తున్నారు — ఇది చాలా గొప్ప విషయం! 🌟\nమీరు చరిత్ర సృష్టిస్తున్నారు! నేను మీకు దశలవారీగా మార్గనిర్దేశం చేస్తాను.\n\n"
            else:
                prefix = "Wow! You are voting for the first time — that is wonderful! 🌟\nYou are making history! I will guide you step-by-step.\n\n"
            greeting = prefix + greeting
        return {**state, "response_text": greeting}

    # 2. Try Groq
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and len(groq_key) > 10:
        try:
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                api_key=groq_key,
                max_tokens=512,
                temperature=0.1,
            )
            context = _build_context_injection(state)
            lang_name = LANGUAGE_NAMES.get(language, "English")
            full_system = (
                f"CRITICAL: RESPOND ONLY IN {lang_name.upper()}.\n"
                f"User has selected {lang_name} as their primary language.\n"
                "ALWAYS end your response with exactly ONE suggested follow-up question to keep the conversation going.\n\n"
            ) + SYSTEM_PROMPT + (f"\n\nCONTEXT:\n{context}" if context else "")
            response = await llm.ainvoke([SystemMessage(content=full_system)] + list(messages))
            return {**state, "response_text": response.content}
        except Exception as e:
            logging.warning(f"Groq API failed: {type(e).__name__}: {e}")

    # 4. Use specialist node draft
    draft = state.get("response_text", "")
    if draft and len(draft) > 20:
        return state

    # 5. Rule-based knowledge engine
    rule_answer = _rule_based_answer(last_text, language, intent)
    if rule_answer:
        return {**state, "response_text": rule_answer}

    # 6. Last resort: menu
    return {
        **state,
        "response_text": GREETING_BY_LANGUAGE.get(language, GREETING_BY_LANGUAGE["en"])
    }
