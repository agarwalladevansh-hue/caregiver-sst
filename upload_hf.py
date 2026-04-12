import os
from huggingface_hub import HfApi

def main():
    # Use environment variable for security - never hardcode tokens
    token = os.environ.get("HF_TOKEN")
    if not token:
        raise ValueError("HF_TOKEN environment variable not set")
    api = HfApi(token=token)
    try:
        url = api.upload_file(
            path_or_fileobj="inference.py",
            path_in_repo="inference.py",
            repo_id="agarwalladevansh/carematch.RL",
            repo_type="space",
            commit_message="Update inference.py exact 5 step output"
        )
        print(f"Successfully uploaded. URL: {url}")
    except Exception as e:
        print(f"Error uploading: {e}")

if __name__ == "__main__":
    main()
