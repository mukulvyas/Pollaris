from graph.state import PollarisState


async def report_node(state: PollarisState) -> PollarisState:
    """Handles election violation reporting guidance."""
    return {
        **state,
        "response_text": (
            "Chunav mein koi problem? Aapke paas 3 options hain:\n\n"
            "1. 📞 1950 Helpline — Seedha ECI ko call karein\n"
            "2. 📱 cVIGIL App — Photo/video ke saath complaint karein\n"
            "3. 🌐 ECI Website — eci.gov.in par online complaint\n\n"
            "Complaint factual honi chahiye. Ye ek punishable offence hai agar galat complaint ho. "
            "Aapki shuruaat se hi democracy strong hoti hai! 💪"
        ),
    }
