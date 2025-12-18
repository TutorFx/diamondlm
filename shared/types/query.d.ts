type AllDeltas
  = | { type: 'search-delta', text: string, id: number, source: string }
    | { type: 'start-search', search: string }
    | { type: 'end-search' }

export type DeltaType<T extends AllDeltas['type'] = AllDeltas['type']>
  = Extract<AllDeltas, { type: T }>

export type DeltaCallback = (delta: DeltaType) => void | Promise<void>

export interface SearchParameters {
  onDelta?: DeltaCallback
  userId: string | null
}

export type AudioDelta = string
