"""
voting_node — Handles voting process, registration, ID, EVM, NOTA, and all
election-education questions using the verified knowledge base.
"""

from graph.state import PollarisState


# Verified knowledge base — all answers sourced from ECI
VOTING_KB = {
    "how_to_vote": {
        "keywords": ["how to vote", "vote kaise", "kaise vote", "voting process",
                     "process", "step", "procedure", "how do i vote"],
        "answer": (
            "Vote dene ka process (Step by Step):\n\n"
            "1️⃣ Apne assigned polling booth jaayein (7 AM - 6 PM)\n"
            "2️⃣ Valid ID dikhayein (Voter ID / Aadhaar / koi bhi 1)\n"
            "3️⃣ Officer aapka naam electoral roll mein check karega\n"
            "4️⃣ Register mein sign / thumb impression dein\n"
            "5️⃣ Left hand ki index finger par ink lagegi\n"
            "6️⃣ Voting compartment mein jaayein\n"
            "7️⃣ EVM par apne candidate ke button dabayein\n"
            "8️⃣ VVPAT slip 7 second dikhegi — verify karein\n"
            "9️⃣ Done! Aap vote de chuke hain! 🗳️\n\n"
            "📋 Source: eci.gov.in/voting-process"
        ),
    },
    "voter_id": {
        "keywords": ["voter id", "epic", "id card", "voter card", "e-epic"],
        "answer": (
            "Voter ID (EPIC) ke baare mein:\n\n"
            "• Registration approve hone ke baad physical card post se aata hai\n"
            "• Digital e-EPIC download karein: voters.eci.gov.in\n"
            "• Dono equally valid hain\n"
            "• EPIC = Electors Photo Identity Card\n\n"
            "📋 Source: eci.gov.in"
        ),
    },
    "id_proof": {
        "keywords": ["id proof", "what id", "which id", "identity", "valid id", "aadhaar"],
        "answer": (
            "Vote dene ke liye ye 12 mein se koi EK ID le jaayein:\n\n"
            "1. Voter ID (EPIC)\n"
            "2. Aadhaar Card\n"
            "3. Passport\n"
            "4. Driving License\n"
            "5. PAN Card\n"
            "6. MNREGA Job Card\n"
            "7. Bank/Post Passbook with photo\n"
            "8. Smart Card (CGHS/ECHS)\n"
            "9. Pension document with photo\n"
            "10. Government Service ID\n"
            "11. MP/MLA/MLC ID card\n"
            "12. UDID Disability certificate\n\n"
            "📋 Source: eci.gov.in"
        ),
    },
    "registration": {
        "keywords": ["register", "registration", "voter list", "form 6", "name add"],
        "answer": (
            "Voter Registration ke 3 tarike:\n\n"
            "1️⃣ Online: voters.eci.gov.in → Form 6 fill karein\n"
            "2️⃣ Offline: BLO (Booth Level Officer) se milein\n"
            "3️⃣ App: Voter Helpline App (Play Store)\n\n"
            "Documents chahiye:\n"
            "• Age proof (Aadhaar / Birth Certificate)\n"
            "• Address proof\n"
            "• Passport-size photo\n\n"
            "📋 Source: eci.gov.in/voter-registration"
        ),
    },
    "evm": {
        "keywords": ["evm", "electronic voting", "machine", "vvpat"],
        "answer": (
            "EVM (Electronic Voting Machine) ke baare mein:\n\n"
            "• 1999 se Indian elections mein use ho raha hai\n"
            "• Internet se connected NAHI hai — hack nahi ho sakta\n"
            "• VVPAT paper slip se vote verify hota hai (7 sec dikhta hai)\n"
            "• Sirf BEL aur ECIL (govt companies) banati hain\n"
            "• Supreme Court ne approve kiya hai\n\n"
            "📋 Source: eci.gov.in/evm"
        ),
    },
    "nota": {
        "keywords": ["nota", "none of the above"],
        "answer": (
            "NOTA (None of the Above):\n\n"
            "• 2013 mein Supreme Court ne add kiya\n"
            "• EVM par sabse last button hota hai\n"
            "• Agar koi bhi candidate pasand nahi → NOTA dabayein\n"
            "• Vote count hota hai par kisi ko nahi jaata\n"
            "• Sabse zyada votes wala candidate tab bhi jeet ta hai\n\n"
            "📋 Source: eci.gov.in"
        ),
    },
    "eligible": {
        "keywords": ["eligible", "age", "18", "who can vote", "kon vote", "kaun"],
        "answer": (
            "Kaun vote de sakta hai:\n\n"
            "• Indian citizen hona chahiye\n"
            "• 18 saal ya usse zyada age\n"
            "• Electoral roll mein naam registered\n"
            "• Kisi law se disqualified na ho\n"
            "• Voting day par valid ID hona chahiye\n\n"
            "📋 Source: Article 326, Constitution of India"
        ),
    },
    "postal_ballot": {
        "keywords": ["postal ballot", "postal", "home vote", "ghar se vote"],
        "answer": (
            "Postal Ballot (Ghar se vote) kin logon ke liye hai:\n\n"
            "• Senior citizens (80+ years)\n"
            "• Persons with Disabilities (PwD)\n"
            "• Essential service workers\n"
            "• Constituency se bahar hone wale voters\n\n"
            "Form 12D apply karein apne Returning Officer ke paas.\n\n"
            "📋 Source: eci.gov.in/postal-ballot"
        ),
    },
    "nri": {
        "keywords": ["nri", "overseas", "abroad", "videsh"],
        "answer": (
            "NRI Voting:\n\n"
            "• Haan, NRI vote de sakte hain!\n"
            "• Electoral roll mein naam hona chahiye\n"
            "• Voting day India mein hona zaroori hai\n"
            "• In-person vote karna hoga (postal/proxy abhi nahi)\n"
            "• Register: voters.eci.gov.in → 'Overseas Voter'\n\n"
            "📋 Source: eci.gov.in/overseas-voters"
        ),
    },
    "election_types": {
        "keywords": ["type", "types", "lok sabha", "vidhan sabha", "rajya sabha",
                     "panchayat", "local body"],
        "answer": (
            "India mein 4 tarah ki elections hoti hain:\n\n"
            "1️⃣ Lok Sabha (Parliament) — Har 5 saal, 543 seats, MPs elect hote hain\n"
            "2️⃣ Vidhan Sabha (State Assembly) — Har 5 saal, MLAs elect hote hain\n"
            "3️⃣ Rajya Sabha (Upper House) — MLAs elect karte hain, public directly nahi\n"
            "4️⃣ Local Body Elections — Municipal corporations, Panchayats\n\n"
            "📋 Source: Constitution of India"
        ),
    },
    "winner": {
        "keywords": ["winner", "how win", "fptp", "majority", "pm", "cm",
                     "prime minister", "chief minister"],
        "answer": (
            "India mein winner kaise decide hota hai:\n\n"
            "FPTP (First Past The Post) system:\n"
            "• Sabse zyada votes = jeet!\n"
            "• 50% votes ki zaroorat NAHI\n\n"
            "PM ke liye: 272+ Lok Sabha seats jeetne wala party/alliance\n"
            "CM ke liye: State assembly mein majority wala party\n\n"
            "📋 Source: Constitution of India"
        ),
    },
    "mcc": {
        "keywords": ["mcc", "model code", "code of conduct", "rules", "campaign"],
        "answer": (
            "Model Code of Conduct (MCC):\n\n"
            "Election dates announce hone se results tak apply hota hai.\n"
            "• Voters ko cash/gifts dena mana hai\n"
            "• Government resources ka campaign mein use mana\n"
            "• Hate speech mana hai\n"
            "• Polling booths peaceful rehne chahiye\n\n"
            "Violation report: 1950 ya cVIGIL app\n\n"
            "📋 Source: eci.gov.in/mcc"
        ),
    },
    "eci_info": {
        "keywords": ["election commission", "eci", "chief election"],
        "answer": (
            "Election Commission of India (ECI):\n\n"
            "• Independent constitutional body\n"
            "• 1 Chief Election Commissioner + 2 Election Commissioners\n"
            "• Powers: Election dates announce, MCC enforce, officers transfer\n"
            "• Malpractice mile toh election cancel bhi kar sakta hai\n\n"
            "Website: eci.gov.in | Helpline: 1950\n\n"
            "📋 Source: Article 324, Constitution of India"
        ),
    },
}


def _find_best_answer(text: str) -> str:
    """Find the best matching answer from the knowledge base."""
    text_lower = text.lower()
    best_match = None
    best_score = 0

    for topic, data in VOTING_KB.items():
        for kw in data["keywords"]:
            if kw in text_lower:
                score = len(kw)
                if score > best_score:
                    best_score = score
                    best_match = data["answer"]

    return best_match or VOTING_KB["how_to_vote"]["answer"]


async def voting_node(state: PollarisState) -> PollarisState:
    """Handles all voting process, registration, and election education questions."""
    messages = state.get("messages", [])
    last_text = ""
    if messages:
        last_msg = messages[-1]
        last_text = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    answer = _find_best_answer(last_text)

    return {
        **state,
        "response_text": answer,
    }
