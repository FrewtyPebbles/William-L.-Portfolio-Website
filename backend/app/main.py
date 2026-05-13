from fastapi import FastAPI
from mangum import Mangum
from .database import init_db
from .routes import public, admin

app = FastAPI(root_path="/api")

init_db()

app.include_router(public.router, prefix="")
app.include_router(admin.router, prefix="/admin")

handler = Mangum(app, lifespan="off")
