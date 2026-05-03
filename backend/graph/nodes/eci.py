from graph.state import PollarisState


ECI_DATA = {
    "upcoming_elections": [
        {
            "state": "General",
            "phase": "Phase 1",
            "date": "April 19, 2024",
            "event": "Voting Day",
            "description": "Cast your vote at your local polling station. Open 7:00 AM - 6:00 PM.",
        }
    ],
    "important_dates": [
        {"event": "Voter Registration Deadline", "date": "March 01, 2024",
         "desc": "Last day to add your name to the electoral roll."},
        {"event": "Nomination Filing", "date": "April 02, 2024",
         "desc": "Deadline for candidates to file their nomination papers."},
        {"event": "Campaign Ends", "date": "May 15, 2024",
         "desc": "48-hour silence period begins before polling starts."},
        {"event": "Voting Day", "date": "May 20, 2024",
         "desc": "Cast your vote at your polling station from 7:00 AM."},
        {"event": "Counting Day", "date": "June 04, 2024",
         "desc": "Official verification and counting of votes begins."},
        {"event": "Results Announced", "date": "June 05, 2024",
         "desc": "Final announcement of the democratic will of the people."},
    ],
    "helpline": "1950",
    "website": "https://voters.eci.gov.in",
}


async def eci_node(state: PollarisState) -> PollarisState:
    """Fetches election schedule and ECI information."""
    dates_summary = "\n".join([
        f"• {d['event']}: {d['date']} — {d['desc']}"
        for d in ECI_DATA["important_dates"]
    ])

    return {
        **state,
        "eci_result": ECI_DATA,
        "response_text": (
            f"ECI Election Schedule:\n\n{dates_summary}\n\n"
            f"Helpline: {ECI_DATA['helpline']} | Website: {ECI_DATA['website']}"
        ),
    }
