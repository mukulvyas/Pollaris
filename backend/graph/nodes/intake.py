from graph.state import PollarisState
from langchain_core.messages import HumanMessage
import re


LANGUAGE_KEYWORDS = {
    "hi": ["मेरा", "मुझे", "क्या", "कहाँ", "कैसे", "वोट", "चुनाव", "बूथ", "मतदान"],
    "ta": ["வாக்கு", "தேர்தல்", "எங்கே", "எப்படி", "என்ன"],
    "te": ["ఓటు", "ఎన్నికలు", "ఎక్కడ", "ఎలా", "అభ్యర్థి"],
    "bn": ["ভোট", "নির্বাচন", "কোথায়", "কীভাবে", "প্রার্থী"],
    "mr": ["मतदान", "निवडणूक", "कुठे", "कसे", "उमेदवार"],
    "gu": ["મત", "ચૂંટણી", "ક્યાં", "કેવી", "ઉમેદવાર"],
    "pa": ["ਵੋਟ", "ਚੋਣ", "ਕਿੱਥੇ", "ਕਿਵੇਂ", "ਉਮੀਦਵਾਰ"],
    "kn": ["ಮತ", "ಚುನಾವಣೆ", "ಎಲ್ಲಿ", "ಹೇಗೆ", "ಅಭ್ಯರ್ಥಿ"],
    "ml": ["വോട്ട്", "തിരഞ്ഞെടുപ്പ്", "എവിടെ", "എങ്ങനെ", "സ്ഥാനാർത്ഥി"],
    "or": ["ଭୋଟ", "ନିର୍ବାଚନ", "କେଉଁଠି", "କିପରି", "ପ୍ରାର୍ଥୀ"],
    "ur": ["ووٹ", "انتخاب", "کہاں", "کیسے", "امیدوار"],
}

INTENT_KEYWORDS = {
    "booth": ["booth", "polling station", "polling booth", "station", "nearest",
              "location", "gps", "find booth", "mera booth", "polling center",
              "बूथ", "मतदान केंद्र", "कहाँ", "वाक्कुच्चावडी", "poll booth",
              "வாக்குச்சாவடி", "పోలింగ్ బూత్", "ಮತದಾನ ಕೇಂದ್ರ"],
    "candidate": ["candidate", "neta", "leader", "affidavit", "criminal", "assets",
                   "myneta", "background", "party", "mp ", "mla ", "contestant",
                   "उम्मीदवार", "नेता", "प्रत्याशी", "அறிக்கை", "అభ్యర్థి",
                   "ಅಭ್ಯರ್ಥಿ", "who is standing", "who is contesting"],
    "eci": ["date", "schedule", "when", "election day", "voting day", "result",
            "deadline", "election date", "phase", "counting",
            "तारीख", "कब", "निर्वाचन", "நாள்", "ఎన్నికల తేదీ", "ಚುನಾವಣೆ ದಿನಾಂಕ"],
    "report": ["complaint", "violation", "bribe", "intimidation", "fake", "cvigil",
               "1950", "report", "helpline", "problem", "threat", "rigging",
               "शिकायत", "रिश्वत", "புகார்", "ఫిర్యాదు", "ದೂರು"],
    "voting": ["how to vote", "vote kaise", "vote", "voting", "evm", "vvpat",
               "nota", "voter id", "epic", "register", "registration",
               "voter list", "id proof", "identity", "aadhaar", "eligible",
               "age", "18", "first time", "pehli baar", "postal ballot",
               "nri", "overseas", "kaise vote", "matdan", "मतदान",
               "वोट", "कैसे", "ரிஜிஸ்டர்", "ஓட்டு", "ఓటు", "ಮತ",
               "how do i vote", "where do i vote", "what id", "which id",
               "process", "step", "procedure"],
}


def detect_language(text: str) -> str:
    for lang, keywords in LANGUAGE_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                return lang
    # Check for Devanagari script broadly
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    # Check for Tamil script
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    # Check for Telugu script
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"
    # Check for Bengali script
    if re.search(r'[\u0980-\u09FF]', text):
        return "bn"
    # Check for Kannada script
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"
    return "en"


def detect_intent(text: str) -> str:
    text_lower = text.lower()
    # Check each intent, prioritize longer keyword matches
    best_intent = "general"
    best_len = 0
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower and len(kw) > best_len:
                best_intent = intent
                best_len = len(kw)
    return best_intent


async def intake_node(state: PollarisState) -> PollarisState:
    """Detects language and intent from the latest user message."""
    messages = state.get("messages", [])
    current_language = state.get("language")
    
    if not messages:
        return {**state, "language": current_language or "en", "intent": "general"}

    last_msg = messages[-1]
    text = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    # Use existing language if provided, otherwise detect
    language = current_language if current_language and current_language != "en" else detect_language(text)
    intent = detect_intent(text)

    return {
        **state,
        "language": language,
        "intent": intent,
    }
