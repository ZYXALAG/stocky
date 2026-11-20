# Task 3: Authentication — Stocky

## Context
Stocky is a universal inventory management app. Task 2 completed the Supabase schema and client modules. Now we implement full authentication flow.

WORKING DIRECTORY: C:/Users/adrig/stocky/
GIT BASE: be3062e (Task 2 commit)

## Requirements (verbatim from plan)

### Step 1: Auth pages structure
- src/app/(auth)/login/page.tsx — login form with email/password
- src/app/(auth)/register/page.tsx — register form with email/password + full_name
- src/app/(auth)/forgot-password/page.tsx — forgot password form
- src/app/(auth)/reset-password/page.tsx — reset password form
- src/app/(auth)/verify/page.tsx — email verification page
- src/app/(auth)/layout.tsx — centered card layout for auth pages

### Step 2: Auth components
- src/components/auth/login-form.tsx — LoginForm component with:
  - Email input, password input, "Remember me" checkbox
  - Submit button ("Se connecter")
  - Link to register page
  - Link to forgot password page
  - Uses Supabase sign-in with email/password
  - Loading state, error handling
  - Redirect to /dashboard on success

- src/components/auth/register-form.tsx — RegisterForm component with:
  - Full name input, email input, password input
  - Submit button ("Créer un compte")
  - Link to login page
  - Uses Supabase sign-up with email/password
  - Inserts into profiles table (full_name)
  - Redirect to /verify on success
  - Loading state, error handling

- src/components/auth/forgot-password-form.tsx — ForgotPasswordForm
  - Email input
  - Submit button ("Envoyer le lien")
  - Link back to login
  - Uses Supabase reset password (email link)
  - Success/error handling

- src/components/auth/reset-password-form.tsx — ResetPasswordForm
  - New password input, confirm password input
  - Submit button ("Réinitialiser")
  - Validates password match + min 6 chars
  - Uses Supabase update password
  - Redirect to /login on success

### Step 3: Session management
- src/hooks/useSession.ts — custom hook:
  ```typescript
  interface UseSessionReturn {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
  }
  export function useSession(): UseSessionReturn
  ```
  - Watches Supabase auth session
  - Fetches profile from profiles table
  - Handles loading state

- src/types/database.ts — TypeScript types for the database:
  ```typescript
  export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  }
  export interface Session {
    access_token: string;
    refresh_token: string;
    user: any;
  }
  ```

### Step 4: Auth guard
- src/lib/auth-guard.ts — utility to redirect unauthenticated users:
  ```typescript
  export async function requireAuth(): Promise<Profile | null>
  ```
  - Checks session on server side
  - Returns profile if authenticated
  - Redirects to /login if not
  - Used in server components and route handlers

### Step 5: Layout with auth integration
- src/app/layout.tsx — update to:
  - Check auth state
  - Redirect to /login if not authenticated (except for auth pages)
  - Add a provider context if needed

### Step 6: Verify
- All auth forms have proper validation (Zod)
- Supabase auth flows work: sign-in, sign-up, reset password
- Session hook correctly tracks auth state
- Auth guard redirects properly
- No auth page is accessible without being logged in (except login/register/verify/reset)

### Step 7: Commit
```bash
git add .
git commit -m "feat: add authentication with login, register, forgot-password, reset-password, and session management"
```

## Interfaces
- Consumes: Supabase client from Task 2, Profile type from Task 2
- Produces: Full auth flow with login/register/forgot-password/reset-password/verify pages, session hook, auth guard, profile types

## Constraints
- Use Supabase Auth directly (@supabase/supabase-js client methods)
- All forms should use client-side validation with Zod
- All forms must have loading states and error messages
- Use lucide-react icons (Mail, Lock, User, ArrowLeft, Loader2)
- Email provider must be enabled in Supabase (handled by user)
- Use forward-slash paths
- All pages must be in the (auth) route group
- The register form inserts into the profiles table after sign-up
- Password validation: minimum 6 characters
- The session hook should be available globally

## Report File
Write report to: `C:/Users/adrig/stocky/.superpowers/sdd/stocky-plan/task-3-report.md`
