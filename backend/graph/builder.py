from langgraph.graph import StateGraph, START, END
from graph.state import PollarisState
from graph.nodes.intake import intake_node
from graph.nodes.router import router_node
from graph.nodes.booth import booth_node
from graph.nodes.candidate import candidate_node
from graph.nodes.eci import eci_node
from graph.nodes.report import report_node
from graph.nodes.voting import voting_node
from graph.nodes.response import response_node


def build_graph():
    builder = StateGraph(PollarisState)

    # Add all nodes
    builder.add_node("intake_node", intake_node)
    builder.add_node("booth_node", booth_node)
    builder.add_node("candidate_node", candidate_node)
    builder.add_node("eci_node", eci_node)
    builder.add_node("report_node", report_node)
    builder.add_node("voting_node", voting_node)
    builder.add_node("response_node", response_node)

    # Entry point
    builder.add_edge(START, "intake_node")

    # Conditional routing after intake
    builder.add_conditional_edges(
        "intake_node",
        router_node,
        {
            "booth_node": "booth_node",
            "candidate_node": "candidate_node",
            "eci_node": "eci_node",
            "report_node": "report_node",
            "voting_node": "voting_node",
            "response_node": "response_node",
        },
    )

    # All specialist nodes flow to response (to polish the answer)
    builder.add_edge("booth_node", "response_node")
    builder.add_edge("candidate_node", "response_node")
    builder.add_edge("eci_node", "response_node")
    builder.add_edge("report_node", "response_node")
    builder.add_edge("voting_node", "response_node")
    builder.add_edge("response_node", END)

    return builder.compile()


# Singleton graph instance
graph = build_graph()
