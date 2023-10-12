from datetime import datetime, timedelta
from uuid import UUID
from typing import Union, Any

from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

#
from fastapi.openapi.models import OAuthFlowImplicit,OAuthFlows
from fastapi.security import OAuth2, SecurityScopes
import certifi
import httpx


#
from .. import models, schemas
from ..config.config import settings


class FakeUser:
    def __init__(self, email, is_active):
        self.email = email
        self.is_active = is_active


ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
ALGORITHM = "HS256"
SG_CONNECT_ENDPOINT = ""
OAUTH_INTERNAL = True

oauth2_scheme_local = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

oauth2_scheme_external = OAuth2(
    scheme_name="implicit",
    flows=OAuthFlows(implicit=OAuthFlowImplicit(
        authorizationUrl=f"{settings.API_V1_STR}/login/access-token",
        #authorizationUrl=f"{SG_CONNECT_ENDPOINT}/authorize",
        scopes={
            "openid": "Openid scope",
            "profile": "Profile scope"
        }
    ))
)

oauth2_scheme = oauth2_scheme_local if OAUTH_INTERNAL else oauth2_scheme_external

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


async def authenticate_user(email: str, password: str):
    user = await models.User.find_one({"email": email})
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta | None = None
):
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        userid: UUID = payload.get("sub")
        if userid is None:
            raise credentials_exception
        token_data = schemas.TokenPayload(uuid=userid)
    except JWTError:
        raise credentials_exception
    user = await models.User.find_one({"uuid": token_data.uuid})
    print(user)
    """
    print("getting")
    user = FakeUser(email='roman@sgcib.com', is_active=True)

    if user is None:
        raise credentials_exception
    return user

async def get_current_user_ext(security_scopes: SecurityScopes, token: str = Depends(oauth2_scheme_external)) -> str:
    try:
        endpoint = SG_CONNECT_ENDPOINT
        route = '/userinfo'
        async with httpx.AsyncClient() as client:#verify=certifi.where()) as client:
            res = await client.get(endpoint + route,headers={"Authorization":token})
        user_info = res.json()
        if 'email' in user_info:
            user = await models.User.find_one({"email": user_info['email']})
            if user is None:
                user = models.User(
                    email=user_info.get('mail'),
                    team=user_info.get('rc_sigle'),
                    uuid=user_info.get('contact_id')
                )
        else:
            raise HTTPException(status_code=400, detail=user_info)
    except Exception as e:
        raise HTTPException(status_code=400, detail=e)
    
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    print("get current active user")
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
