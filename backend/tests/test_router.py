import pytest
from graph.nodes.router import router_node

def test_router_booth():
    state = {"intent": "booth"}
    next_node = router_node(state)
    assert next_node == "booth_node"

def test_router_general():
    state = {"intent": "general"}
    next_node = router_node(state)
    assert next_node == "response_node"

def test_router_fallback():
    state = {"intent": "unknown"}
    next_node = router_node(state)
    assert next_node == "response_node"
