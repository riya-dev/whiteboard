"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      console.log("Starting login for:", email)
      const supabase = createClient()
      console.log("Supabase client created")

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in response:", { data, error: signInError })

      if (signInError) {
        console.error("Sign in error:", signInError)
        setError(signInError.message)
        setLoading(false)
        return
      }

      console.log("Login successful, syncing server cookies and redirecting")

      try {
        // Explicitly set the session server-side to ensure SSR sees it immediately
        await fetch('/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
          }),
        })
      } catch (e) {
        console.error('Failed to sync session to server', e)
      }

      router.replace("/dashboard")
    } catch (err) {
      console.error("Unexpected error during login:", err)
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border border-border shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your planning space</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-card border-border"
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  )
}
