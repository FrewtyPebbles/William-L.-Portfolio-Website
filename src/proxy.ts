import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPage = pathname === "/admin/login"
  const isPublicApi = pathname === "/api/admin/login"
  const isLogout = pathname === "/api/admin/logout"

  if (isPublicPage || isPublicApi || isLogout) {
     return NextResponse.next()
  }

  const authCookie = request.cookies.get("admin_auth")?.value
  let isAuthenticated = false

  if (authCookie) {
    const [payload, signature] = authCookie.split(".")

    if (payload && signature) {
      // re-create signature to verify integrity
      const expectedSignature = crypto
        .createHmac("sha256", process.env.ADMIN_COOKIE_SECRET!)
        .update(payload)
        .digest("hex")

      // prevent timing attacks
      const isValidSignature = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )

      // check expiration
      if (isValidSignature) {
        const [, expiresAt] = payload.split(":")
        const now = Date.now()
        
        // authenticate if token is valid and not expired
        if (parseInt(expiresAt) > now) {
          isAuthenticated = true
        }
      }
    }
  }

// deny
  if (!isAuthenticated) {
    // return 401 if its an api call
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // if its a page load, redirect to login
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// only use on admin routes
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}