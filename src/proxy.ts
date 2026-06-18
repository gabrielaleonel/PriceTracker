import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const PUBLIC_ROUTES = ["/", "/login", "/register", "/api/auth"]
const API_ROUTES = ["/api/"]

export default auth((request) => {
  const { pathname } = request.nextUrl
  const isAuthenticated = !!request.auth?.user
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route))

  const response = NextResponse.next()
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self' ignav.com",
    "frame-src 'self'",
    "base-uri 'self'",
  ].join("; ")

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  )
  response.headers.set("X-XSS-Protection", "0")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  )
  response.headers.set("Content-Security-Policy", csp)

  if (isApiRoute && !pathname.startsWith("/api/auth")) {
    const ip = getClientIp(request)
    const limit = rateLimit(`api:${ip}`, { maxRequests: 60, windowMs: 60000 })
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining))
    response.headers.set("X-RateLimit-Reset", String(limit.resetAt))

    if (!limit.allowed) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  if (!isAuthenticated && !isPublicRoute && !isApiRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
