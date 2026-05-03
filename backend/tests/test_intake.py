"""
Tests for the intake node: language detection and intent classification.
"""
import pytest
from graph.nodes.intake import detect_language, detect_intent


# ── Language Detection ─────────────────────────────────────────────────────────

class TestDetectLanguage:
    def test_english_default(self):
        assert detect_language("How do I vote?") == "en"

    def test_hindi_keyword(self):
        # contains "वोट" which is in Hindi keywords
        assert detect_language("मुझे वोट karna hai") == "hi"

    def test_hindi_devanagari_script(self):
        assert detect_language("यह हिंदी है") == "hi"

    def test_tamil_script(self):
        assert detect_language("வாக்கு எங்கே") == "ta"

    def test_bengali_script(self):
        assert detect_language("ভোট কোথায়") == "bn"

    def test_empty_string(self):
        assert detect_language("") == "en"


# ── Intent Detection ───────────────────────────────────────────────────────────

class TestDetectIntent:
    def test_booth_intent(self):
        assert detect_intent("Where is my polling booth?") == "booth"

    def test_candidate_intent(self):
        assert detect_intent("Tell me about the candidate background and assets") == "candidate"

    def test_eci_intent(self):
        assert detect_intent("What is the election date and schedule?") == "eci"

    def test_report_intent(self):
        assert detect_intent("I want to file a complaint about a violation") == "report"

    def test_voting_process_intent(self):
        assert detect_intent("How do I vote step by step?") == "voting"

    def test_nota_intent(self):
        assert detect_intent("What is NOTA?") == "voting"

    def test_evm_intent(self):
        assert detect_intent("Is the EVM machine safe?") == "voting"

    def test_registration_intent(self):
        assert detect_intent("How to register as a voter?") == "voting"

    def test_general_fallback(self):
        assert detect_intent("Hello, good morning") == "general"

    def test_candidate_over_general(self):
        # "candidate" keyword is explicit, should beat general
        assert detect_intent("Who is the candidate in my area?") == "candidate"
