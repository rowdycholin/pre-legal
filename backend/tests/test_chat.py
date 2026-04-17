"""Tests for the /api/chat SSE endpoint."""
import json

import pytest
from fastapi.testclient import TestClient

from app.main import app


MINIMAL_NDA_FIELDS = {
    "purpose": "",
    "effectiveDate": "2026-04-16",
    "mndaTermType": "expires",
    "mndaTermYears": 1,
    "confTermType": "years",
    "confTermYears": 1,
    "governingLaw": "",
    "jurisdiction": "",
    "modifications": "",
    "p1Company": "",
    "p1Name": "",
    "p1Title": "",
    "p1Address": "",
    "p2Company": "",
    "p2Name": "",
    "p2Title": "",
    "p2Address": "",
}


def _sse_lines(chunks: list[dict]) -> list[str]:
    lines = []
    for chunk in chunks:
        lines.append(f"data: {json.dumps(chunk)}\n\n")
    lines.append("data: [DONE]\n\n")
    return lines


def _openrouter_chunk(content: str | None = None, tool_calls: list | None = None) -> dict:
    delta: dict = {}
    if content is not None:
        delta["content"] = content
    if tool_calls is not None:
        delta["tool_calls"] = tool_calls
    return {"choices": [{"delta": delta}]}


def test_chat_no_auth_required():
    """Chat endpoint is publicly accessible — no auth token needed."""
    client = TestClient(app)
    # Without mocking OpenRouter, the request will fail at the API call,
    # but the endpoint itself should not reject due to missing auth.
    # We just verify the endpoint exists and doesn't return 401/403.
    # (A network error from OpenRouter will produce an error SSE event, not 401.)
    res = client.post(
        "/api/chat",
        json={"messages": [], "current_fields": {}, "doc_type": None},
    )
    assert res.status_code not in (401, 403)


def test_chat_streams_tokens(respx_mock):
    """Text tokens from OpenRouter arrive as SSE token events."""
    import httpx

    sse_body = "".join(
        _sse_lines([
            _openrouter_chunk("Hello"),
            _openrouter_chunk(" world"),
        ])
    )

    respx_mock.post("https://openrouter.ai/api/v1/chat/completions").mock(
        return_value=httpx.Response(200, text=sse_body)
    )

    client = TestClient(app)
    res = client.post(
        "/api/chat",
        json={"messages": [], "current_fields": MINIMAL_NDA_FIELDS, "doc_type": "mutual-nda"},
    )

    assert res.status_code == 200
    assert "text/event-stream" in res.headers["content-type"]

    events = [
        json.loads(line[6:])
        for line in res.text.splitlines()
        if line.startswith("data: ") and line[6:] != "[DONE]"
    ]
    token_events = [e for e in events if e["type"] == "token"]
    assert len(token_events) == 2
    assert token_events[0]["content"] == "Hello"
    assert token_events[1]["content"] == " world"

    done_events = [e for e in events if e["type"] == "done"]
    assert len(done_events) == 1


def test_chat_emits_fields_event(respx_mock):
    """Tool call from model produces a fields SSE event."""
    import httpx

    extracted = {"p1Company": "Acme", "governingLaw": "Delaware"}
    tool_call_chunks = [
        _openrouter_chunk(
            tool_calls=[{"index": 0, "function": {"name": "update_fields", "arguments": ""}}]
        ),
        _openrouter_chunk(
            tool_calls=[{"index": 0, "function": {"name": "", "arguments": json.dumps(extracted)}}]
        ),
    ]

    sse_body = "".join(_sse_lines(tool_call_chunks))
    respx_mock.post("https://openrouter.ai/api/v1/chat/completions").mock(
        return_value=httpx.Response(200, text=sse_body)
    )

    client = TestClient(app)
    res = client.post(
        "/api/chat",
        json={"messages": [], "current_fields": MINIMAL_NDA_FIELDS, "doc_type": "mutual-nda"},
    )

    events = [
        json.loads(line[6:])
        for line in res.text.splitlines()
        if line.startswith("data: ") and line[6:] != "[DONE]"
    ]
    fields_events = [e for e in events if e["type"] == "fields"]
    assert len(fields_events) == 1
    assert fields_events[0]["extracted"] == extracted


def test_chat_emits_select_event(respx_mock):
    """select_document tool call produces a select SSE event."""
    import httpx

    tool_call_chunks = [
        _openrouter_chunk(
            tool_calls=[{"index": 0, "function": {"name": "select_document", "arguments": ""}}]
        ),
        _openrouter_chunk(
            tool_calls=[{"index": 0, "function": {"name": "", "arguments": json.dumps({"doc_type": "pilot-agreement"})}}]
        ),
    ]

    sse_body = "".join(_sse_lines(tool_call_chunks))
    respx_mock.post("https://openrouter.ai/api/v1/chat/completions").mock(
        return_value=httpx.Response(200, text=sse_body)
    )

    client = TestClient(app)
    res = client.post(
        "/api/chat",
        json={"messages": [], "current_fields": {}, "doc_type": None},
    )

    events = [
        json.loads(line[6:])
        for line in res.text.splitlines()
        if line.startswith("data: ") and line[6:] != "[DONE]"
    ]
    select_events = [e for e in events if e["type"] == "select"]
    assert len(select_events) == 1
    assert select_events[0]["docType"] == "pilot-agreement"
