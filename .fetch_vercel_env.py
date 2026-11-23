import os, json, urllib.request

# Read OIDC token
oidc = None
with open('.env.fetch', 'r') as f:
    for line in f:
        if 'VERCEL_OIDC_TOKEN=' in line:
            # Extract value between quotes
            start = line.index('"') + 1
            end = line.index('"', start)
            oidc = line[start:end]
            break

if not oidc:
    print("NO OIDC TOKEN FOUND")
    exit(1)

print(f"OIDC token starts with: {oidc[:20]}...")

# Get project list
req = urllib.request.Request(
    "https://api.vercel.com/v6/projects",
    headers={"Authorization": f"Bearer {oidc}"}
)
resp = urllib.request.urlopen(req, timeout=30)
projects = json.loads(resp.read())

# Find stocky project
stocky = None
for p in projects.get('projects', []):
    if 'stocky' in p.get('name', '').lower():
        stocky = p
        break

if not stocky:
    print("NO STOCKY PROJECT FOUND")
    exit(1)

print(f"Found project: {stocky['name']} ({stocky['id']})")

# Get environment variables for production
vars_url = f"https://api.vercel.com/v2/projects/{stocky['id']}/env?target=production"
req = urllib.request.Request(vars_url, headers={"Authorization": f"Bearer {oidc}"})
resp = urllib.request.urlopen(req, timeout=30)
env_vars = json.loads(resp.read())

print(f"\n=== PRODUCTION ENVIRONMENT VARIABLES ({len(env_vars.get('envs', []))} found) ===")
for var in env_vars.get('envs', []):
    key = var['key']
    value = var.get('value', '')
    # Mask secrets
    if len(value) > 15:
        print(f"{key} = {value[:6]}...{value[-4:]} (len={len(value)})")
    else:
        print(f"{key} = {value}")

# Also get development vars
vars_url_dev = f"https://api.vercel.com/v2/projects/{stocky['id']}/env?target=development"
req = urllib.request.Request(vars_url_dev, headers={"Authorization": f"Bearer {oidc}"})
resp = urllib.request.urlopen(req, timeout=30)
env_vars_dev = json.loads(resp.read())

print(f"\n=== DEVELOPMENT ENVIRONMENT VARIABLES ({len(env_vars_dev.get('envs', []))} found) ===")
for var in env_vars_dev.get('envs', []):
    key = var['key']
    value = var.get('value', '')
    if len(value) > 15:
        print(f"{key} = {value[:6]}...{value[-4:]} (len={len(value)})")
    else:
        print(f"{key} = {value}")
