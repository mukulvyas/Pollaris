from graph.state import PollarisState


def router_node(state: PollarisState) -> str:
    """Returns the next node name based on detected intent."""
    intent = state.get("intent", "general")
    routing_map = {
        "booth": "booth_node",
        "candidate": "candidate_node",
        "eci": "eci_node",
        "report": "report_node",
        "voting": "voting_node",
        "general": "response_node",
    }
    return routing_map.get(intent, "response_node")
