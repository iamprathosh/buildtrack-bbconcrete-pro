export type SearchableSection = 'inventory' | 'equipment' | 'projects' | 'tasks'

export type StatusType = 'available' | 'checked_out' | 'maintenance' | 'retired' | 
                  'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' |
                  'pending' | 'in_progress'

export type PriorityType = 'low' | 'medium' | 'high' | 'urgent'

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