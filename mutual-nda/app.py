"""Mutual NDA Creator — Flask web application."""

import re
from datetime import datetime
from flask import Flask, render_template, request, make_response

app = Flask(__name__)

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def format_date(date_str: str) -> str:
    """Convert YYYY-MM-DD to 'Month D, YYYY'."""
    if not date_str:
        return ""
    try:
        y, m, d = date_str.split("-")
        return f"{MONTHS[int(m) - 1]} {int(d)}, {y}"
    except (ValueError, IndexError):
        return date_str


def safe_filename_part(s: str) -> str:
    """Strip characters unsafe for filenames."""
    return re.sub(r"[^a-zA-Z0-9_\-.]", "-", s).strip("-") or "unknown"


def collect_form_data(form) -> dict:
    """Pull all NDA fields from a submitted form."""
    return {
        "purpose": form.get(
            "purpose",
            "Evaluating whether to enter into a business relationship with the other party.",
        ).strip(),
        "effective_date": form.get("effective_date", "").strip(),
        "mnda_term_type": form.get("mnda_term_type", "expires"),
        "mnda_term_years": form.get("mnda_term_years", "1").strip(),
        "conf_term_type": form.get("conf_term_type", "years"),
        "conf_term_years": form.get("conf_term_years", "1").strip(),
        "governing_law": form.get("governing_law", "").strip(),
        "jurisdiction": form.get("jurisdiction", "").strip(),
        "modifications": form.get("modifications", "").strip() or "None.",
        "p1_company": form.get("p1_company", "").strip(),
        "p1_name": form.get("p1_name", "").strip(),
        "p1_title": form.get("p1_title", "").strip(),
        "p1_address": form.get("p1_address", "").strip(),
        "p2_company": form.get("p2_company", "").strip(),
        "p2_name": form.get("p2_name", "").strip(),
        "p2_title": form.get("p2_title", "").strip(),
        "p2_address": form.get("p2_address", "").strip(),
    }


@app.route("/")
def index():
    today = datetime.today().strftime("%Y-%m-%d")
    return render_template("index.html", today=today)


@app.route("/download", methods=["POST"])
def download():
    data = collect_form_data(request.form)
    data["formatted_date"] = format_date(data["effective_date"])

    html = render_template("nda_document.html", **data)

    p1 = safe_filename_part(data["p1_company"]) or "Party1"
    p2 = safe_filename_part(data["p2_company"]) or "Party2"
    date_part = safe_filename_part(data["effective_date"]) or datetime.today().strftime("%Y-%m-%d")
    filename = f"Mutual-NDA_{p1}_{p2}_{date_part}.html"

    response = make_response(html)
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    response.headers["Content-Type"] = "text/html; charset=utf-8"
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
