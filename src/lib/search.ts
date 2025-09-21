import { useRouter } from 'next/navigation'

export type SearchableSection = 'inventory' | 'equipment' | 'projects' | 'tasks'

type StatusType = 'available' | 'checked_out' | 'maintenance' | 'retired' | 
                  'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' |
                  'pending' | 'in_progress'

type PriorityType = 'low' | 'medium' | 'high' | 'urgent'

export interface SearchResult {
  id: string
  title: string
  section: SearchableSection
  description?: string
  url: string
  icon?: string
  status?: StatusType
  priority?: PriorityType
}

export interface SearchResponse {
  results: {
    products: SearchResult[]
    equipment: SearchResult[]
    projects: SearchResult[]
    tasks: SearchResult[]
  }
  error?: string
}

export const getSearchResults = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return []

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()

    if (!response.ok || data.error) {
      console.error('Search API error:', data)
      throw new Error(data.error || 'Search failed')

    // Flatten and sort results by section
    return [
      ...data.results.products,
      ...data.results.equipment,
      ...data.results.projects,
      ...data.results.tasks
    ]
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

export const useSearch = () => {
  const router = useRouter()

  const navigateToResult = (result: SearchResult) => {
    router.push(result.url)
  }

  return {
    getSearchResults,
    navigateToResult,
  }
}