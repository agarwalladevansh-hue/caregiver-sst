from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from gymnasium.utils.env_checker import check_env
from env.carematch_env import CareMatchEnv


def main():
    # Verify environment passes gymnasium checks
    print("Checking CareMatchEnv compatibility...")
    try:
        check_env(CareMatchEnv())
        print("✓ Environment passed gymnasium checks\n")
    except Exception as e:
        print(f"✗ Environment check failed: {e}")
        return
    
    # Create vectorized environment
    print("Creating vectorized environment (4 parallel environments)...")
    env = make_vec_env(CareMatchEnv, n_envs=4)
    
    # Train PPO model
    print("Training PPO model...")
    model = PPO(
        "MlpPolicy",
        env,
        learning_rate=0.0003,
        n_steps=2048,
        batch_size=64,
        verbose=1,
        tensorboard_log="./carematch_logs/",
    )
    
    model.learn(total_timesteps=10000, progress_bar=True)
    
    # Save model
    print("\nSaving model as 'carematch_ppo'...")
    model.save("carematch_ppo")
    print("✓ Model saved successfully")
    
    # Run one prediction
    print("\n" + "=" * 70)
    print("SAMPLE PREDICTION")
    print("=" * 70)
    env = CareMatchEnv()
    obs, info = env.reset()
    env.render()
    
    # Get prediction from trained model
    action, _states = model.predict(obs, deterministic=True)
    print(f"Model predicted action (caregiver): {action}\n")
    
    env.close()


if __name__ == "__main__":
    main()
