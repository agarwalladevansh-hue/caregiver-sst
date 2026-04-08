import numpy as np
import gradio as gr

from env.carematch_env import CareMatchEnv


env = CareMatchEnv()
current_obs = None


def _format_obs(obs: np.ndarray) -> str:
    return np.array2string(obs, precision=3, suppress_small=True)


def reset_environment(seed: int | None):
    """
    Reset the Gymnasium env directly in Python (no HTTP call).
    Gymnasium 0.26+ returns (observation, info).
    """
    global current_obs
    obs, info = env.reset(seed=seed if seed is not None else None)
    current_obs = obs
    return _format_obs(obs), str(info), "Environment reset successful."


def run_match(action: int):
    """
    Take one env step after reset.
    """
    global current_obs
    if current_obs is None:
        return "[]", "{}", "Please click 'Reset Environment' first."

    next_obs, reward, terminated, truncated, info = env.step(action)
    current_obs = next_obs
    status = (
        f"Action={action} | Reward={reward:.2f} | "
        f"Terminated={terminated} | Truncated={truncated}"
    )
    return _format_obs(next_obs), str(info), status


with gr.Blocks(title="CareMatch RL") as demo:
    gr.Markdown("## CareMatch RL - Gymnasium Environment Playground")
    gr.Markdown(
        "This Space calls `CareMatchEnv.reset()` and `step()` directly in Python. "
        "No POST request to `/reset` is used."
    )

    with gr.Row():
        seed_input = gr.Number(value=42, precision=0, label="Seed (optional)")
        action_input = gr.Slider(
            minimum=0, maximum=4, value=0, step=1, label="Caregiver Action"
        )

    with gr.Row():
        reset_btn = gr.Button("Reset Environment", variant="primary")
        step_btn = gr.Button("Run One Step")

    obs_output = gr.Textbox(label="Observation", lines=6)
    info_output = gr.Textbox(label="Info", lines=3)
    status_output = gr.Textbox(label="Status", lines=2)

    reset_btn.click(
        fn=reset_environment,
        inputs=[seed_input],
        outputs=[obs_output, info_output, status_output],
    )
    step_btn.click(
        fn=run_match,
        inputs=[action_input],
        outputs=[obs_output, info_output, status_output],
    )


if __name__ == "__main__":
    demo.launch()
