import { describe, it, expect } from "vitest"
import { flightSearchSchema, createAlertSchema, registerSchema, loginSchema } from "@/lib/validation"

describe("flightSearchSchema", () => {
  it("accepts valid one-way search", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      passengers: 1,
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid round-trip search", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      returnDate: "2026-07-22",
      passengers: 2,
      currency: "USD",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid airport code", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing origin", () => {
    const result = flightSearchSchema.safeParse({
      destination: "JFK",
      departureDate: "2026-07-15",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid date format", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "15/07/2026",
    })
    expect(result.success).toBe(false)
  })

  it("accepts cabin class", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      cabinClass: "BUSINESS",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid cabin class", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      cabinClass: "INVALID",
    })
    expect(result.success).toBe(false)
  })

  it("rejects passengers above 9", () => {
    const result = flightSearchSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      passengers: 10,
    })
    expect(result.success).toBe(false)
  })
})

describe("createAlertSchema", () => {
  it("accepts valid alert", () => {
    const result = createAlertSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      maxPrice: 5000,
      currency: "BRL",
    })
    expect(result.success).toBe(true)
  })

  it("rejects zero maxPrice", () => {
    const result = createAlertSchema.safeParse({
      origin: "GRU",
      destination: "JFK",
      departureDate: "2026-07-15",
      maxPrice: 0,
    })
    expect(result.success).toBe(false)
  })

  it("accepts alert with airport names", () => {
    const result = createAlertSchema.safeParse({
      origin: "GRU",
      originName: "São Paulo",
      destination: "JFK",
      destinationName: "New York",
      departureDate: "2026-07-15",
      maxPrice: 5000,
    })
    expect(result.success).toBe(true)
  })
})

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Senha123",
      confirmPassword: "Senha123",
      consentGiven: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "12345678",
      confirmPassword: "12345678",
      consentGiven: true,
    })
    expect(result.success).toBe(false)
  })

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Senha123",
      confirmPassword: "Senha456",
      consentGiven: true,
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing consent", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "Senha123",
      confirmPassword: "Senha123",
      consentGiven: false,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "not-an-email",
      password: "Senha123",
      confirmPassword: "Senha123",
      consentGiven: true,
    })
    expect(result.success).toBe(false)
  })
})

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "Senha123",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "Senha123",
    })
    expect(result.success).toBe(false)
  })
})
