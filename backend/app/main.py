from fastapi import FastAPI
from mangum import Mangum
from app.database import init_db
from app.routes import public, admin
from starlette.middleware.sessions import SessionMiddleware
from app.settings import settings

app = FastAPI(root_path="/api")

init_db()

app.include_router(public.router, prefix="")
app.include_router(admin.router, prefix="/admin")
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    https_only=settings.ENVIRONMENT == "prod",
    same_site="lax",
    max_age=86400
)

handler = Mangum(app, lifespan="off")
