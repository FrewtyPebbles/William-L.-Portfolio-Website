from fastapi import FastAPI
from mangum import Mangum
from .routes import public, admin

app = FastAPI(root_path="/api")

app.include_router(public.router, prefix="")
app.include_router(admin.router, prefix="/admin")

handler = Mangum(app, lifespan="off")
