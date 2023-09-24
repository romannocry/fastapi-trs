import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.fastapi_swagger import swagger_monkey_patch
from fastapi import applications

from .routers.api import api_router
from .config.config import settings
from .models.users import User
from .models.ledgers import Ledger
from .models.transactions import Transaction
from .models.testParent import TestParent
from .auth.auth import get_hashed_password

from starlette.staticfiles import StaticFiles

init_oauth = {
    "clientId": "facObec-936a-446-9500-44f0d935f462",
    "scopes": "openid profile",
    "additionalQueryStringParams":{
        "nonce":"SWAGGER"
    }
}

#Install swagger monkey patch
applications.get_swagger_ui_html = swagger_monkey_patch

app = FastAPI(
    swagger_ui_init_oauth=init_oauth,title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.mount("/serverjs",
    StaticFiles(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")),
    name= "static")



#print(settings.BACKEND_CORS_ORIGINS)
# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
async def start_database():
    app.client = AsyncIOMotorClient(
        settings.MONGO_HOST,
        settings.MONGO_PORT,
        username=settings.MONGO_USER,
        password=settings.MONGO_PASSWORD,
    )
    await init_beanie(database=app.client[settings.MONGO_DB], document_models=[User,Ledger,Transaction,TestParent])

    user = await User.find_one({"email": settings.FIRST_SUPERUSER})
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_hashed_password(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
        )
        await user.create()


app.include_router(api_router, prefix=settings.API_V1_STR)