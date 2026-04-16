import time
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

SECRET_KEY = "pre-legal-secret-key-v1"
ALGORITHM = "HS256"
TOKEN_EXPIRE_SECONDS = 86400  # 24 hours

_USER = "user"
_PASS = "password"

router = APIRouter()
_bearer = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.username != _USER or req.password != _PASS:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    payload = {"sub": req.username, "exp": int(time.time()) + TOKEN_EXPIRE_SECONDS}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return LoginResponse(token=token)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
