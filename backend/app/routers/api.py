from fastapi import APIRouter

from . import ledgers, login, users, transactions, testParent

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ledgers.router, prefix="/ledgers", tags=["ledgers"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(testParent.router, prefix="/test", tags=["test"])


@api_router.get("/")
async def health():
    return {"message": "Backend API works well !"}
