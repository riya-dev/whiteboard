import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ ok: false, error: "Missing tokens" }, { status: 400 })
    }

    let response = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      },
    )

    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 })
    }

    return response
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}

