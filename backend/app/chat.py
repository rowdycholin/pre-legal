import json
import os
from typing import AsyncIterator

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "gpt-oss-120b"

_SELECT_TOOL = {
    "type": "function",
    "function": {
        "name": "select_document",
        "description": "Select the legal document type the user wants to create.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_type": {
                    "type": "string",
                    "enum": [
                        "mutual-nda",
                        "nda-cover-page",
                        "pilot-agreement",
                        "design-partner-agreement",
                        "ai-addendum",
                    ],
                }
            },
            "required": ["doc_type"],
            "additionalProperties": False,
        },
    },
}

_SELECTION_SYSTEM_PROMPT = """You are a friendly legal assistant helping a user draft a legal document.

Start by welcoming the user warmly, then present the following documents they can choose from:

1. **Mutual NDA** — A full mutual non-disclosure agreement covering confidentiality between two parties.
2. **Mutual NDA Cover Page** — Cover page only; standard terms are incorporated by reference from commonpaper.com.
3. **Pilot Agreement** — A short-term trial agreement letting a prospective customer evaluate a product.
4. **Design Partner Agreement** — An early-stage collaboration agreement between a vendor and a design partner.
5. **AI Addendum** — AI-specific provisions to attach to an existing service agreement.

Ask the user which document they'd like to create. Once they indicate their choice, call `select_document` with the appropriate doc_type value."""

_NDA_FIELDS_TOOL = {
    "type": "function",
    "function": {
        "name": "update_fields",
        "description": "Update NDA form fields with confirmed information from the conversation. Only include fields the user has explicitly provided.",
        "parameters": {
            "type": "object",
            "properties": {
                "purpose": {"type": "string"},
                "effectiveDate": {"type": "string", "description": "YYYY-MM-DD"},
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

_PILOT_FIELDS_TOOL = {
    "type": "function",
    "function": {
        "name": "update_fields",
        "description": "Update Pilot Agreement form fields with confirmed information from the conversation.",
        "parameters": {
            "type": "object",
            "properties": {
                "provider": {"type": "string", "description": "Company providing the product"},
                "customer": {"type": "string", "description": "Company evaluating the product"},
                "product": {"type": "string", "description": "Name of the product being piloted"},
                "effectiveDate": {"type": "string", "description": "YYYY-MM-DD"},
                "pilotStart": {"type": "string", "description": "YYYY-MM-DD"},
                "pilotEnd": {"type": "string", "description": "YYYY-MM-DD"},
                "governingLaw": {"type": "string"},
                "chosenCourts": {"type": "string", "description": "City/county and state for disputes"},
                "generalCapAmount": {"type": "string", "description": "Liability cap amount (e.g. $50,000)"},
                "fees": {"type": "string", "description": "Pilot fees, if any (leave blank if free)"},
                "p1Name": {"type": "string"},
                "p1Title": {"type": "string"},
                "p1Address": {"type": "string"},
                "p2Name": {"type": "string"},
                "p2Title": {"type": "string"},
                "p2Address": {"type": "string"},
            },
            "additionalProperties": False,
        },
    },
}

_DESIGN_PARTNER_FIELDS_TOOL = {
    "type": "function",
    "function": {
        "name": "update_fields",
        "description": "Update Design Partner Agreement form fields with confirmed information from the conversation.",
        "parameters": {
            "type": "object",
            "properties": {
                "provider": {"type": "string", "description": "Company providing the product/service"},
                "partner": {"type": "string", "description": "Design partner company"},
                "product": {"type": "string", "description": "Product name"},
                "program": {"type": "string", "description": "Name of the design partner program"},
                "effectiveDate": {"type": "string", "description": "YYYY-MM-DD"},
                "term": {"type": "string", "description": "Duration of the agreement (e.g. 12 months)"},
                "governingLaw": {"type": "string"},
                "chosenCourts": {"type": "string", "description": "City/county and state for disputes"},
                "fees": {"type": "string", "description": "Fees, if any"},
                "p1Name": {"type": "string"},
                "p1Title": {"type": "string"},
                "p1Address": {"type": "string"},
                "p2Name": {"type": "string"},
                "p2Title": {"type": "string"},
                "p2Address": {"type": "string"},
            },
            "additionalProperties": False,
        },
    },
}

_AI_ADDENDUM_FIELDS_TOOL = {
    "type": "function",
    "function": {
        "name": "update_fields",
        "description": "Update AI Addendum form fields with confirmed information from the conversation.",
        "parameters": {
            "type": "object",
            "properties": {
                "provider": {"type": "string", "description": "AI service provider"},
                "customer": {"type": "string", "description": "Customer company"},
                "agreementName": {"type": "string", "description": "Name of the base agreement this addendum attaches to"},
                "effectiveDate": {"type": "string", "description": "YYYY-MM-DD"},
                "trainingData": {"type": "string", "description": "Whether customer data may be used for training (e.g. 'Customer data will not be used for model training')"},
                "trainingPurposes": {"type": "string", "description": "Permitted training purposes, if any"},
                "trainingRestrictions": {"type": "string", "description": "Restrictions on training use"},
                "improvementRestrictions": {"type": "string", "description": "Restrictions on using data for model improvement"},
                "governingLaw": {"type": "string"},
                "p1Name": {"type": "string"},
                "p1Title": {"type": "string"},
                "p1Address": {"type": "string"},
                "p2Name": {"type": "string"},
                "p2Title": {"type": "string"},
                "p2Address": {"type": "string"},
            },
            "additionalProperties": False,
        },
    },
}

_DOC_TOOLS = {
    "mutual-nda": _NDA_FIELDS_TOOL,
    "nda-cover-page": _NDA_FIELDS_TOOL,
    "pilot-agreement": _PILOT_FIELDS_TOOL,
    "design-partner-agreement": _DESIGN_PARTNER_FIELDS_TOOL,
    "ai-addendum": _AI_ADDENDUM_FIELDS_TOOL,
}

_DOC_SYSTEM_PROMPTS = {
    "mutual-nda": """You are a helpful legal assistant helping a user draft a Mutual Non-Disclosure Agreement (MNDA).

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time — never overwhelm the user.

As you learn confirmed information, call `update_fields` with just those fields. Only include values the user has explicitly provided — never guess.

Fields to gather:
- purpose: How confidential information may be used
- effectiveDate: Agreement start date (YYYY-MM-DD)
- mndaTermType: "expires" (after N years) or "until-terminated"
- mndaTermYears: Number of years if mndaTermType is "expires"
- confTermType: "years" (N years) or "perpetuity"
- confTermYears: Number of years if confTermType is "years"
- governingLaw: US state whose laws govern the agreement
- jurisdiction: City/county and state for legal disputes
- modifications: Any modifications to standard terms (optional — ask at the end)
- p1Company, p1Name, p1Title, p1Address: Party 1 details
- p2Company, p2Name, p2Title, p2Address: Party 2 details

Current field values are provided below — do not re-ask for fields that are already filled.""",

    "nda-cover-page": """You are a helpful legal assistant helping a user draft a Mutual NDA Cover Page.

This is a cover-page-only version; standard terms are incorporated by reference from commonpaper.com.

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time.

As you learn confirmed information, call `update_fields` with just those fields. Only include values the user has explicitly provided — never guess.

Fields to gather:
- purpose: How confidential information may be used
- effectiveDate: Agreement start date (YYYY-MM-DD)
- mndaTermType: "expires" (after N years) or "until-terminated"
- mndaTermYears: Number of years if mndaTermType is "expires"
- confTermType: "years" (N years) or "perpetuity"
- confTermYears: Number of years if confTermType is "years"
- governingLaw: US state whose laws govern the agreement
- jurisdiction: City/county and state for legal disputes
- modifications: Any modifications to standard terms (optional)
- p1Company, p1Name, p1Title, p1Address: Party 1 details
- p2Company, p2Name, p2Title, p2Address: Party 2 details

Current field values are provided below — do not re-ask for fields that are already filled.""",

    "pilot-agreement": """You are a helpful legal assistant helping a user draft a Pilot Agreement.

A Pilot Agreement allows a prospective customer to evaluate a product for a short trial period.

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time.

As you learn confirmed information, call `update_fields` with just those fields. Only include values the user has explicitly provided — never guess.

Fields to gather:
- provider: Company providing the product
- customer: Company evaluating the product
- product: Name of the product being piloted
- effectiveDate: Agreement effective date (YYYY-MM-DD)
- pilotStart: Pilot start date (YYYY-MM-DD)
- pilotEnd: Pilot end date (YYYY-MM-DD)
- governingLaw: US state whose laws govern the agreement
- chosenCourts: City/county and state for legal disputes
- generalCapAmount: Liability cap amount (e.g. "$50,000")
- fees: Pilot fees, if any (leave blank if no fees)
- p1Name, p1Title, p1Address: Provider signatory details
- p2Name, p2Title, p2Address: Customer signatory details

Current field values are provided below — do not re-ask for fields that are already filled.""",

    "design-partner-agreement": """You are a helpful legal assistant helping a user draft a Design Partner Agreement.

A Design Partner Agreement formalises an early-stage collaboration between a vendor and a customer who helps shape the product.

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time.

As you learn confirmed information, call `update_fields` with just those fields. Only include values the user has explicitly provided — never guess.

Fields to gather:
- provider: Company providing the product/service
- partner: Design partner company
- product: Product name
- program: Name of the design partner program
- effectiveDate: Agreement effective date (YYYY-MM-DD)
- term: Duration of the agreement (e.g. "12 months")
- governingLaw: US state whose laws govern the agreement
- chosenCourts: City/county and state for legal disputes
- fees: Any fees (leave blank if no fees)
- p1Name, p1Title, p1Address: Provider signatory details
- p2Name, p2Title, p2Address: Partner signatory details

Current field values are provided below — do not re-ask for fields that are already filled.""",

    "ai-addendum": """You are a helpful legal assistant helping a user draft an AI Addendum.

An AI Addendum adds AI-specific provisions to an existing service agreement.

Have a friendly, conversational chat to gather the information needed. Ask one or two questions at a time.

As you learn confirmed information, call `update_fields` with just those fields. Only include values the user has explicitly provided — never guess.

Fields to gather:
- provider: AI service provider company
- customer: Customer company
- agreementName: Name of the base agreement this addendum attaches to
- effectiveDate: Addendum effective date (YYYY-MM-DD)
- trainingData: Policy on using customer data for training (e.g. "Customer data will not be used for model training")
- trainingPurposes: Permitted training purposes, if any
- trainingRestrictions: Restrictions on training use
- improvementRestrictions: Restrictions on using data for model improvement
- governingLaw: US state whose laws govern the agreement
- p1Name, p1Title, p1Address: Provider signatory details
- p2Name, p2Title, p2Address: Customer signatory details

Current field values are provided below — do not re-ask for fields that are already filled.""",
}


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict
    doc_type: str | None = None


async def _stream(request: ChatRequest) -> AsyncIterator[str]:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    doc_type = request.doc_type

    if doc_type is None:
        system_content = _SELECTION_SYSTEM_PROMPT
        tools = [_SELECT_TOOL]
    else:
        base_prompt = _DOC_SYSTEM_PROMPTS.get(doc_type, _DOC_SYSTEM_PROMPTS["mutual-nda"])
        current = request.current_fields
        system_content = base_prompt + f"\n\nCurrent field values:\n{json.dumps(current, indent=2)}"
        tools = [_DOC_TOOLS.get(doc_type, _NDA_FIELDS_TOOL)]

    messages = [{"role": "system", "content": system_content}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    payload = {
        "model": MODEL,
        "messages": messages,
        "tools": tools,
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
            if tc["name"] == "select_document" and tc["arguments"]:
                try:
                    args = json.loads(tc["arguments"])
                    selected = args.get("doc_type")
                    if selected:
                        yield f"data: {json.dumps({'type': 'select', 'docType': selected})}\n\n"
                except json.JSONDecodeError:
                    pass
            elif tc["name"] == "update_fields" and tc["arguments"]:
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
async def chat(request: ChatRequest):
    return StreamingResponse(
        _stream(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
