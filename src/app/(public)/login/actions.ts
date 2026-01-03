'use server'

import { signInWithEmail, getRoleRedirectPath } from '@/lib/supabase-auth'
import { loginSchema } from '@/lib/validators/auth'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'on'

  // Validate input
  const validation = loginSchema.safeParse({ email, password, rememberMe })
  if (!validation.success) {
    return { error: 'Invalid email or password format' }
  }

  // Sign in with Supabase
  const result = await signInWithEmail(email, password)

  if (result.error) {
    return { error: result.error }
  }

  if (result.data) {
    // Get role-based redirect path
    const redirectPath = getRoleRedirectPath(result.data.user.role)

    // Return success with redirect path
    return { success: true, redirectPath }
  }

  return { error: 'Authentication failed' }
}