from fastapi import APIRouter

from app.api.v1.routes import assets, domains, findings, me, organizations, scans

api_router = APIRouter()
api_router.include_router(me.router)
api_router.include_router(organizations.router)
api_router.include_router(domains.router)
api_router.include_router(assets.router)
api_router.include_router(findings.router)
api_router.include_router(scans.router)
