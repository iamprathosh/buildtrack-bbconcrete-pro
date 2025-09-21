'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Loader2, Search, Package, Wrench, Folder, CheckSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSearch } from '@/hooks/use-search'
import type { SearchResult } from '@/types/search'
import { cn } from '@/lib/utils'

export interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getSearchResults, navigateToResult } = useSearch()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSearch = async (search: string) => {
    setQuery(search)
    if (search.length === 0) {
      setResults([])
      return
    }

    if (search.length < 2) {
      return
    }

    setIsLoading(true)
    try {
      console.log('Searching for:', search)
      const searchResults = await getSearchResults(search)
      console.log('Search results:', searchResults)
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false)
    navigateToResult(result)
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Search all resources..."
          value={query}
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center text-sm">
              <Loader2 className="mx-auto h-4 w-4 animate-spin opacity-70" />
              <p className="mt-2 text-muted-foreground">Searching...</p>
            </div>
          ) : (
            results.length > 0 && (
              <>
                {/* Inventory Results */}
                {results.filter(r => r.section === 'inventory').length > 0 && (
                  <>
                    <CommandGroup heading="Inventory">
                      {results
                        .filter((result) => result.section === 'inventory')
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.title}
                            onSelect={() => handleSelect(result)}
                          >
                            <Package className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center">
                                <span>{result.title}</span>
                              </div>
                              {result.description && (
                                <span className="text-muted-foreground text-sm">
                                  {result.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Equipment Results */}
                {results.filter(r => r.section === 'equipment').length > 0 && (
                  <>
                    <CommandGroup heading="Equipment">
                      {results
                        .filter((result) => result.section === 'equipment')
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.title}
                            onSelect={() => handleSelect(result)}
                          >
<Wrench className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center gap-2">
                                <span>{result.title}</span>
                                {result.status && (
                                  <Badge
                                    variant={result.status === 'available' ? 'default' : 
                                            result.status === 'maintenance' ? 'destructive' : 
                                            'secondary'}
                                    className="ml-auto"
                                  >
                                    {result.status}
                                  </Badge>
                                )}
                              </div>
                              {result.description && (
                                <span className="text-muted-foreground text-sm">
                                  {result.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Projects Results */}
                {results.filter(r => r.section === 'projects').length > 0 && (
                  <>
                    <CommandGroup heading="Projects">
                      {results
                        .filter((result) => result.section === 'projects')
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.title}
                            onSelect={() => handleSelect(result)}
                          >
                            <Folder className="mr-2 h-4 w-4 shrink-0" />
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center gap-2">
                                <span>{result.title}</span>
                                {result.status && (
                                  <Badge
                                    variant={result.status === 'active' ? 'default' : 
                                            result.status === 'completed' ? 'secondary' : 
                                            result.status === 'on_hold' ? 'destructive' : 
                                            'outline'}
                                    className="ml-auto"
                                  >
                                    {result.status}
                                  </Badge>
                                )}
                              </div>
                              {result.description && (
                                <span className="text-muted-foreground text-sm">
                                  {result.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}

                {/* Tasks Results */}
                {results.filter(r => r.section === 'tasks').length > 0 && (
                  <CommandGroup heading="Tasks">
                    {results
                      .filter((result) => result.section === 'tasks')
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.title}
                          onSelect={() => handleSelect(result)}
                        >
                          <CheckSquare className="mr-2 h-4 w-4 shrink-0" />
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <span>{result.title}</span>
                              {result.status && (
                                <Badge
                                  variant={result.status === 'in_progress' ? 'default' : 
                                          result.status === 'completed' ? 'secondary' : 
                                          'outline'}
                                  className="ml-auto"
                                >
                                  {result.status}
                                </Badge>
                              )}
                              {result.priority && (
                                <Badge
                                  variant={result.priority === 'urgent' ? 'destructive' : 
                                          result.priority === 'high' ? 'default' : 
                                          result.priority === 'medium' ? 'secondary' : 
                                          'outline'}
                                >
                                  {result.priority}
                                </Badge>
                              )}
                            </div>
                            {result.description && (
                              <span className="text-muted-foreground text-sm">
                                {result.description}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}