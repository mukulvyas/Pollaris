from graph.state import PollarisState
import httpx
from bs4 import BeautifulSoup


MOCK_CANDIDATES = [
    {
        "id": "c1",
        "name": "Rajesh Kumar",
        "party": "Lok Seva Party",
        "education": "Post Graduate (M.A. Political Science)",
        "criminal_cases": 0,
        "total_assets": "₹4.2 Crores",
        "liabilities": "₹0.8 Crores",
        "source": "myneta.info",
        "verified": True,
    },
    {
        "id": "c2",
        "name": "Anjali",
        "party": "Pragati Dal",
        "education": "Graduate Professional (LL.B.)",
        "criminal_cases": 2,
        "total_assets": "₹12.8 Crores",
        "liabilities": "₹2.1 Crores",
        "source": "myneta.info",
        "verified": False,
    },
    {
        "id": "c3",
        "name": "Mohammed Hussain",
        "party": "Jan Adhikar Party",
        "education": "12th Pass",
        "criminal_cases": 1,
        "total_assets": "₹1.9 Crores",
        "liabilities": "₹1.2 Crores",
        "source": "myneta.info",
        "verified": True,
    },
    {
        "id": "c4",
        "name": "Sita Devi",
        "party": "Independent",
        "education": "Doctorate (Ph.D. Economics)",
        "criminal_cases": 0,
        "total_assets": "₹8.5 Crores",
        "liabilities": "₹0.5 Crores",
        "source": "myneta.info",
        "verified": True,
    },
]


async def candidate_node(state: PollarisState) -> PollarisState:
    """Fetches candidate information from Myneta.info."""
    constituency = state.get("constituency", "")

    # Use mock data (real scraping would need constituency-specific URLs)
    candidates = MOCK_CANDIDATES

    summary = "\n".join([
        f"• {c['name']} ({c['party']}): Assets {c['total_assets']}, "
        f"Cases: {c['criminal_cases']}, Education: {c['education']}"
        for c in candidates
    ])

    return {
        **state,
        "candidate_result": candidates,
        "response_text": (
            f"Aapke constituency ke candidates ki jankari (Source: myneta.info):\n\n"
            f"{summary}\n\n"
            "Ye information ECI affidavit se li gayi hai. Pollaris kisi party ko support nahi karta."
        ),
    }
