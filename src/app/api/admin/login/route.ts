// app/api/login/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    // validate
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // expire in 24 hrs
    const oneDay = 1000 * 60 * 60 * 24
    const expiresAt = Date.now() + oneDay
    const payload = `admin:${expiresAt}`

    // sign
    const signature = crypto
      .createHmac("sha256", process.env.ADMIN_COOKIE_SECRET!)
      .update(payload)
      .digest("hex")

    // set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_auth", `${payload}.${signature}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}