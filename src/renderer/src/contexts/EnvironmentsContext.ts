import { createContext } from 'react'

export const EnvironmentsContext = createContext<{
  envs: string[]
  selectedEnv?: string
}>({
  envs: [],
  selectedEnv: undefined
})
