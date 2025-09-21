'use client'

import { useRouter } from 'next/navigation'
import { SearchResult } from '@/types/search'

export const useSearch = () => {
  const router = useRouter()

  const getSearchResults = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok || data.error) {
        console.error('Search API error:', data)
        throw new Error(data.error || 'Search failed')
      }

      // Flatten and sort results by section
      return [
        ...(data.results?.products || []),
        ...(data.results?.equipment || []),
        ...(data.results?.projects || []),
        ...(data.results?.tasks || [])
      ]
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url)
  }

  return {
    getSearchResults,
    navigateToResult,
  }
}