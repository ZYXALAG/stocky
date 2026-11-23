import os, json

print("=== Environment Variables from Vercel ===")
for k, v in os.environ.items():
    if k.startswith("VERCEL_") or "SUPABASE" in k or k.startswith("NX_") or k.startswith("TURBO_"):
        # Mask secrets
        if len(v) > 10:
            print(f"{k}={v[:8]}...{v[-4:]}")
        else:
            print(f"{k}={v}")

# Check if any Supabase vars exist
supabase_vars = {k: v for k, v in os.environ.items() if "SUPABASE" in k}
print(f"\n=== Supabase Vars ({len(supabase_vars)} found) ===")
for k, v in supabase_vars.items():
    if len(v) > 10:
        print(f"{k}={v[:8]}...{v[-4:]}")
    else:
        print(f"{k}={v}")
