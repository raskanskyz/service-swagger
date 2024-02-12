import { createContext } from 'react'
import { UseQueryResult } from '@tanstack/react-query'

export const QueriesContext = createContext<{
  results: UseQueryResult<Response, Error>[]
}>({
  results: []
})
