"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, PlaneTakeoff } from "lucide-react"

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

interface AirportComboboxProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (code: string, name: string) => void
}

export function AirportCombobox({
  id,
  label,
  placeholder = "Digite cidade ou aeroporto",
  value,
  onChange,
}: AirportComboboxProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (open && results.length > 0 && listRef.current) {
      const active = listRef.current.children[activeIndex] as HTMLElement
      active?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex, open, results.length])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 2) {
      setResults([])
      setOpen(false)
      onChange("", "")
      setSelectedLabel("")
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setResults(data.airports ?? [])
        setOpen(data.airports?.length > 0)
        setActiveIndex(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function selectAirport(airport: Airport) {
    setQuery(airport.code)
    setSelectedLabel(`${airport.name} (${airport.code})`)
    onChange(airport.code, `${airport.name}, ${airport.city} - ${airport.country}`)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      selectAirport(results[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const displayedValue = selectedLabel || query

  return (
    <div className="space-y-2 relative">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <PlaneTakeoff className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          value={displayedValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          autoComplete="off"
          className="pr-10"
        />
        <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {loading && (
        <p className="text-xs text-muted-foreground absolute -bottom-5 left-1">
          Buscando...
        </p>
      )}
      {open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border/80 bg-popover p-1.5 shadow-xl shadow-foreground/10"
        >
          {results.map((airport, index) => (
            <li
              key={airport.code}
              onMouseDown={() => selectAirport(airport)}
              onMouseEnter={() => setActiveIndex(index)}
              data-active={index === activeIndex}
              className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm outline-none select-none data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground"
            >
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{airport.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {airport.city} — {airport.country}
                </span>
              </div>
              <span className="ml-3 shrink-0 rounded-md border bg-card px-2 py-1 text-xs font-mono font-semibold text-primary">
                {airport.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
