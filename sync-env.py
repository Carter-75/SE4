import os
import sys
import subprocess
from pathlib import Path

def sync_vercel_env():
    """Reads the root .env.local and syncs each variable to the Vercel Production vault."""
    candidates = [Path('.env.local'), Path('.env')]
    env_path = next((c for c in candidates if c.exists()), None)
    
    if not env_path:
        print(">> No environment file found. Skipping sync.")
        return

    print(f">> Vercel Watcher: Syncing {env_path.name} to Production Vault...")
    
    try:
        env_vars = {}
        with open(env_path, "r", encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                env_vars[key.strip()] = val.strip().strip('"').strip("'")
        
        if not env_vars:
            print(">> Environment file is empty.")
            return

        is_windows = sys.platform == "win32"
        keys = list(env_vars.keys())
        for i, key in enumerate(keys, 1):
            val = env_vars[key]
            print(f"   [{i}/{len(keys)}] Syncing {key}...", end="", flush=True)
            
            # 1. Remove existing & 2. Add new value via stdin
            if is_windows:
                subprocess.run(
                    ["powershell.exe", "-ExecutionPolicy", "Bypass", "-Command", f"vercel env rm {key} production --yes"],
                    capture_output=True
                )
                res = subprocess.run(
                    ["powershell.exe", "-ExecutionPolicy", "Bypass", "-Command", f"vercel env add {key} production --yes"],
                    input=val, text=True, capture_output=True
                )
            else:
                subprocess.run(
                    ["vercel", "env", "rm", key, "production", "--yes"],
                    capture_output=True
                )
                res = subprocess.run(
                    ["vercel", "env", "add", key, "production", "--yes"],
                    input=val, text=True, capture_output=True
                )
            
            if res.returncode == 0:
                print(" [OK]")
            else:
                print(f" [FAIL] (Error: {res.stderr.strip()})")

        print("OK: Vercel Vault updated successfully.")
    except Exception as e:
        print(f"Error during sync: {e}")

if __name__ == "__main__":
    sync_vercel_env()
