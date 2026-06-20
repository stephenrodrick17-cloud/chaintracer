import { create } from 'zustand'

export const useStore = create((set) => ({
  // Graph state
  graphData: null,
  setGraphData: (data) => set({ graphData: data }),

  // Trace state
  currentAddress: null,
  traceResult: null,
  setTraceResult: (r) => set({ traceResult: r, currentAddress: r?.address }),

  // Loading states
  isTracing: false,
  traceStep: null,   // 'fetching'|'extracting'|'modeling'|'building'|null
  setTraceStep: (s) => set({ traceStep: s, isTracing: s !== null }),

  // Recent history
  searchHistory: [],
  addToHistory: (addr) => set(state => ({
    searchHistory: [addr, ...state.searchHistory.filter(h => h !== addr).slice(0, 49)]
  })),
}))
