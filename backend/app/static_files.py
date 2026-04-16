import os
from fastapi import Request
from fastapi.responses import FileResponse, HTMLResponse

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")


async def serve_spa(request: Request, full_path: str = "") -> FileResponse | HTMLResponse:
    # Exact file match
    candidate = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(candidate):
        return FileResponse(candidate)

    # Next.js generates either page.html or page/index.html
    for path in [candidate + ".html", os.path.join(candidate, "index.html")]:
        if os.path.isfile(path):
            return FileResponse(path)

    # SPA fallback
    index = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)

    return HTMLResponse("Not found", status_code=404)
