const rateMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000,
}

export function rateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {},
): { allowed: boolean; remaining: number; resetAt: number } {
  const cfg = { ...defaultConfig, ...config }
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + cfg.windowMs })
    return { allowed: true, remaining: cfg.maxRequests - 1, resetAt: now + cfg.windowMs }
  }

  if (entry.count >= cfg.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: cfg.maxRequests - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}
