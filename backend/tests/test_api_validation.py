"""
Tests for API request validation (Pydantic schemas).
Verifies that input guards block malformed requests.
"""
import pytest
from pydantic import ValidationError
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from api.main import ChatRequest, BoothRequest, ComplaintRequest


class TestChatRequestValidation:
    def test_valid_request(self):
        req = ChatRequest(
            message="How do I vote?",
            language="en",
        )
        assert req.message == "How do I vote?"
        assert req.language == "en"

    def test_empty_message_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="")

    def test_message_too_long_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="x" * 1001)

    def test_invalid_language_coerced_to_en(self):
        # validator should coerce invalid lang to "en"
        req = ChatRequest(message="Hello", language="zz")
        assert req.language == "en"

    def test_valid_language_hindi(self):
        req = ChatRequest(message="Namaste", language="hi")
        assert req.language == "hi"

    def test_lat_out_of_range_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="booth", user_lat=200.0, user_lng=77.0)

    def test_lng_out_of_range_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="booth", user_lat=28.6, user_lng=999.0)

    def test_valid_coordinates(self):
        req = ChatRequest(message="booth", user_lat=28.6139, user_lng=77.2090)
        assert req.user_lat == 28.6139

    def test_invalid_session_id_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="Hello", session_id="not-a-uuid!!")

    def test_valid_session_id_accepted(self):
        req = ChatRequest(
            message="Hello",
            session_id="550e8400-e29b-41d4-a716-446655440000"
        )
        assert req.session_id == "550e8400-e29b-41d4-a716-446655440000"


class TestBoothRequestValidation:
    def test_valid_booth_request(self):
        req = BoothRequest(lat=28.6, lng=77.2)
        assert req.lat == 28.6

    def test_missing_lat_rejected(self):
        with pytest.raises(ValidationError):
            BoothRequest(lng=77.2)
