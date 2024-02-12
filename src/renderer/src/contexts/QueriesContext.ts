import { UseQueryResult } from '@tanstack/react-query'
import { createContext } from 'react'

export const QueriesContext = createContext<{
  results: UseQueryResult<Response, Error>[]
}>({
  results: []
})
