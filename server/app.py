from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from env.carematch_env import CareMatchEnv


app = FastAPI(title="CareMatch RL OpenEnv API")
env = CareMatchEnv()
is_initialized = False


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
            status_code=400, detail="Environment not initialized. Call /reset first."
        )

    observation, reward, terminated, truncated, info = env.step(payload.action)
    done = bool(terminated or truncated)
    
    import os
    from openai import OpenAI

    api_base = os.environ.get("API_BASE_URL")
    api_key = os.environ.get("API_KEY")
    llm_summary = ""
    if api_base and api_key:
        client = OpenAI(base_url=api_base, api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": f"Action {payload.action} gave reward {reward:.2f}. Good match?"}]
        )
        llm_summary = response.choices[0].message.content
    
    return {
        "observation": observation.tolist(),
        "reward": float(reward),
        "done": done,
        "info": info,
        "llm_summary": llm_summary,
    }


def main() -> None:
    uvicorn.run("server.app:app", host="0.0.0.0", port=7860)


if __name__ == "__main__":
    main()
