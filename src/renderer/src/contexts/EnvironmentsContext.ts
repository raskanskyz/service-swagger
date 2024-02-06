import { createContext } from 'react'

export const EnvironmentsContext = createContext<{
  envs: string[]
  selectedEnv: string | undefined
}>({
  envs: [],
  selectedEnv: undefined
})
