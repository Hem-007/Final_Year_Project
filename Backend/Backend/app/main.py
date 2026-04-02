from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict
from app.routes import evolution  # ← NEW

app = FastAPI(title="Fake Job Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(evolution.router)  # ← NEW: registers GET /evolution


@app.get("/")
def home():
    return {"message": "Fake Job Detection Backend Running"}
