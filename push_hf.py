from huggingface_hub import HfApi
import sys
api = HfApi()
url = api.upload_file(
    path_or_fileobj="inference.py",
    path_in_repo="inference.py",
    repo_id="agarwalladevansh/carematch.RL",
    repo_type="space"
)
print(f"Uploaded successfully to: {url}")
