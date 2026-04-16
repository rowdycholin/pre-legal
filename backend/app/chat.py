import json
import os
from typing import AsyncIterator

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .auth import verify_token
from .download import NdaFormData

router = APIRouter()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "gpt-oss-120b"

_NDA_TOOL = {
    "type": "function",
    "function": {
        "name": "update_nda_fields",
        "description": "Update NDA form fields with information extracted from the conversation. Only include fields the user has explicitly confirmed.",
        "parameters": {
            "type": "object",
            "properties": {
                "purpose": {"type": "string"},
                "effectiveDate": {"type": "string", "description": "YYYY-MM-DD format"},
                "mndaTermType": {"type": "string", "enum": ["expires", "until-terminated"]},
                "mndaTermYears": {"type": "integer", "minimum": 1},
                "confTermType": {"type": "string", "enum": ["years", "perpetuity"]},
                "confTermYears": {"type": "integer", "minimum": 1},
                "governingLaw": {"type": "string"},
                "jurisdiction": {"type": "string"},
                "modifications": {"type": "string"},
                "p1Company": {"type": "string"},
                "p1Name": {"type": "string"},
                "p1Title": {"type": "string"},
                "p1Address": {"type": "string"},
                "p2Company": {"type": "string"},
                "p2Name": {"type": "string"},
                "p2Title": {"type": "string"},
                "p2Address": {"type": "string"},
            },
            "additionalProperties": False,
        },
    },
}

_SYSTEM_PROMPT = """You are a helpful legal assistant helping a user draft a Mutual Non-Disclosure Agreement (MNDA).

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time — never overwhelm the user with a long list.

As you learn confirmed information about NDA fields, call `update_nda_fields` with just those fields. Only include values the user has explicitly provided — never guess or infer.

Fields to gather:
- purpose: How confidential information may be used (e.g. "Evaluating a potential business partnership")
- effectiveDate: Agreement start date in YYYY-MM-DD format
- mndaTermType: "expires" (after N years) or "until-terminated"
- mndaTermYears: Number of years if mndaTermType is "expires"
- confTermType: "years" (N years) or "perpetuity"
- confTermYears: Number of years if confTermType is "years"
- governingLaw: US state whose laws govern the agreement
- jurisdiction: City/county and state for legal disputes (e.g. "New Castle, Delaware")
- modifications: Any modifications to standard terms (optional — ask at the end)
- p1Company, p1Name, p1Title, p1Address: Party 1 details (company, signatory name, title, notice address)
- p2Company, p2Name, p2Title, p2Address: Party 2 details

The current field values are provided below — do not re-ask for fields that are already filled unless the user wants to change them.

Start by greeting the user warmly, then ask what the NDA is for and who the two parties are."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: NdaFormData


async def _stream(request: ChatRequest) -> AsyncIterator[str]:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    current = request.current_fields.model_dump()

    system_content = _SYSTEM_PROMPT + f"\n\nCurrent field values:\n{json.dumps(current, indent=2)}"

    messages = [{"role": "system", "content": system_content}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    payload = {
        "model": MODEL,
        "messages": messages,
        "tools": [_NDA_TOOL],
        "tool_choice": "auto",
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    tool_calls: dict[int, dict] = {}

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream("POST", OPENROUTER_URL, json=payload, headers=headers) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:]
                    if raw == "[DONE]":
                        break
                    try:
                        chunk = json.loads(raw)
                    except json.JSONDecodeError:
                        continue

                    delta = chunk.get("choices", [{}])[0].get("delta", {})

                    if delta.get("content"):
                        yield f"data: {json.dumps({'type': 'token', 'content': delta['content']})}\n\n"

                    for tc in delta.get("tool_calls", []):
                        idx = tc.get("index", 0)
                        if idx not in tool_calls:
                            tool_calls[idx] = {"name": "", "arguments": ""}
                        fn = tc.get("function", {})
                        if fn.get("name"):
                            tool_calls[idx]["name"] = fn["name"]
                        if fn.get("arguments"):
                            tool_calls[idx]["arguments"] += fn["arguments"]

        for tc in tool_calls.values():
            if tc["name"] == "update_nda_fields" and tc["arguments"]:
                try:
                    extracted = json.loads(tc["arguments"])
                    yield f"data: {json.dumps({'type': 'fields', 'extracted': extracted})}\n\n"
                except json.JSONDecodeError:
                    pass

    except Exception as exc:
        yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"
        return

    yield f"data: {json.dumps({'type': 'done'})}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest, _user: str = Depends(verify_token)):
    return StreamingResponse(
        _stream(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
