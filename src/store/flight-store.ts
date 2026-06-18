"use client"

import { create } from "zustand"
import type { SearchParams, FlightOffer } from "@/types"

interface FlightState {
  searchParams: SearchParams
  results: FlightOffer[]
  loading: boolean
  error: string | null
  recentSearches: SearchParams[]
  setSearchParams: (params: Partial<SearchParams>) => void
  search: () => Promise<void>
  clearResults: () => void
  addRecentSearch: (params: SearchParams) => void
}

const defaultParams: SearchParams = {
  origin: "",
  destination: "",
  departureDate: "",
  passengers: 1,
  currency: "BRL",
}

export const useFlightStore = create<FlightState>((set, get) => ({
  searchParams: defaultParams,
  results: [],
  loading: false,
  error: null,
  recentSearches: [],

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  search: async () => {
    const { searchParams } = get()
    set({ loading: true, error: null })

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message ?? "Erro ao buscar passagens")
      }

      const data = await response.json()
      set({ results: data.flights ?? data, loading: false })
      get().addRecentSearch(searchParams)
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Erro desconhecido",
        loading: false,
      })
    }
  },

  clearResults: () => set({ results: [], error: null }),

  addRecentSearch: (params) =>
    set((state) => ({
      recentSearches: [params, ...state.recentSearches].slice(0, 10),
    })),
}))
