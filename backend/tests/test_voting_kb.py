"""
Tests for the voting knowledge base node.
Verifies that the KB returns correct, factually-grounded answers.
"""
import pytest
from graph.nodes.voting import _find_best_answer, VOTING_KB


class TestVotingKnowledgeBase:
    def test_how_to_vote_returns_steps(self):
        answer = _find_best_answer("how to vote step by step")
        assert "1️⃣" in answer
        assert "EVM" in answer

    def test_nota_question(self):
        answer = _find_best_answer("What is NOTA?")
        assert "None of the Above" in answer or "NOTA" in answer
        assert "2013" in answer  # verifiable fact: Supreme Court added in 2013

    def test_evm_question(self):
        answer = _find_best_answer("Is EVM safe? Can it be hacked?")
        assert "EVM" in answer
        assert "VVPAT" in answer

    def test_voter_registration(self):
        answer = _find_best_answer("How do I register as a voter?")
        assert "voters.eci.gov.in" in answer or "Form 6" in answer

    def test_id_proof_returns_list(self):
        answer = _find_best_answer("What valid id proof do I need?")
        # Should return at least Aadhaar and Voter ID in the answer
        assert "Aadhaar" in answer
        assert "Voter ID" in answer or "EPIC" in answer

    def test_eligible_age(self):
        answer = _find_best_answer("What is the eligible age to vote? 18?")
        assert "18" in answer

    def test_postal_ballot(self):
        answer = _find_best_answer("Can I vote from home via postal ballot?")
        assert "80" in answer or "postal" in answer.lower()

    def test_nri_voting(self):
        answer = _find_best_answer("Can NRI vote from abroad?")
        assert "NRI" in answer

    def test_election_types(self):
        answer = _find_best_answer("What are the types of elections? Lok Sabha?")
        assert "Lok Sabha" in answer
        assert "Vidhan Sabha" in answer

    def test_fallback_to_how_to_vote(self):
        # Unknown topic should default to how_to_vote
        answer = _find_best_answer("random gibberish xyz123")
        assert answer == VOTING_KB["how_to_vote"]["answer"]

    def test_source_citation_present(self):
        # All KB answers must cite their source
        answer = _find_best_answer("how to vote")
        assert "📋 Source:" in answer

    def test_winner_determination(self):
        answer = _find_best_answer("How does a prime minister win? FPTP?")
        assert "FPTP" in answer or "First Past" in answer
