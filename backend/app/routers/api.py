from fastapi import APIRouter

from . import login, users, ledgers, transactions

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ledgers.router, prefix="/ledgers", tags=["ledgers"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])


@api_router.get("/")
async def root():
    return {"message": "Backend API for FARM-docker operational !"}
