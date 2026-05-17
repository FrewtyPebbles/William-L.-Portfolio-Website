from fastapi import FastAPI
from mangum import Mangum
from backend.app.database import init_db
from backend.app.routes import public, admin
from starlette.middleware.sessions import SessionMiddleware
from backend.app.settings import settings

app = FastAPI(root_path="/api")

init_db()

app.include_router(public.router, prefix="")
app.include_router(admin.router, prefix="/admin")
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.COMMENTS_SECRET
)

handler = Mangum(app, lifespan="off")
