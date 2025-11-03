from fastapi import FastAPI
from fastapi.responses import RedirectResponse, JSONResponse

app = FastAPI(title="GetInvolved API")

@app.get("/")
def home():
    # reindirizza alla documentazione interattiva
    return RedirectResponse(url="/docs")

@app.get("/health")
def health():
    return {"ok": True}
