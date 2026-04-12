from typing import Any
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from env.carematch_env import CareMatchEnv
from env.llm_client import chat_via_submission_proxy

env = CareMatchEnv()
is_initialized = False


# Lifespan: call API on startup to satisfy submission proxy requirement
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await asyncio.to_thread(
            chat_via_submission_proxy,
            "CareMatch RL OpenEnv HTTP server ready.",
            max_tokens=32
        )
        print("✓ Submission proxy verified on startup")
    except Exception as e:
        print(f"⚠ Startup API call failed: {e}")
    yield
    # Shutdown
    pass


app = FastAPI(
    title="CareMatch RL OpenEnv API",
    lifespan=lifespan
)

class StepRequest(BaseModel):
    action: int = Field(..., ge=0, le=4)

@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "CareMatch RL OpenEnv API",
        "endpoints": "POST /reset, POST /step",
    }

@app.post("/reset")
def reset_env() -> dict[str, Any]:
    global is_initialized
    observation, info = env.reset()
    is_initialized = True
    return {"observation": observation.tolist(), "info": info}

@app.post("/step")
def step_env(payload: StepRequest) -> dict[str, Any]:
    global is_initialized
    if not is_initialized:
        raise HTTPException(
            status_code=400,
            detail="Environment not initialized. Call /reset first."
        )
    observation, reward, terminated, truncated, info = env.step(payload.action)
    done = bool(terminated or truncated)
    
    # Call submission proxy
    try:
        llm_summary = chat_via_submission_proxy(
            f"Action {payload.action} gave reward {reward:.2f}. Good match?"
        )
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing environment variable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM API call failed: {str(e)}")
    
    return {
        "observation": observation.tolist(),
        "reward": float(reward),
        "done": done,
        "info": info,
        "llm_summary": llm_summary,
    }
