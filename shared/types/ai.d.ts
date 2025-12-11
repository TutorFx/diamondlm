import type { UIMessage } from 'ai'

export type AIUIMessage = UIMessage<
  never,
  {
    source: DeltaType[]
  }
>
