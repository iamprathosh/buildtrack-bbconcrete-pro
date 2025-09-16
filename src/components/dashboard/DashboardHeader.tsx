import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Command, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { SearchResults } from "@/components/search/SearchResults";
import { ClerkUserButton } from "@/components/auth/ClerkAuth";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Use the global search hook
  const { data: searchResults = [], isLoading } = useGlobalSearch(
    debouncedQuery,
    isSearchOpen && debouncedQuery.length >= 2
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isSearchOpen) {
      // Global shortcut: Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsSearchOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const result = searchResults[selectedIndex];
          // Navigate to the selected result
          window.location.href = result.url;
          setIsSearchOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  }, [isSearchOpen, searchResults, selectedIndex]);

  // Handle clicks outside search to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    
    // Keep search open if there's any interaction, close only on blur or escape
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
  };

  const handleResultClick = () => {
    setIsSearchOpen(false);
    setSelectedIndex(-1);
    setSearchQuery("");
    searchInputRef.current?.blur();
  };

  const handleMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSearchBlur = () => {
    // Delay closing to allow for result clicks
    setTimeout(() => {
      if (!searchContainerRef.current?.contains(document.activeElement)) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-montserrat font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-inter text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div className="relative">
              {/* Search Icon - Always visible */}
              <Search className={cn(
                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors z-10",
                isSearchOpen ? "text-primary" : "text-muted-foreground"
              )} />
              
              <Input
                ref={searchInputRef}
                placeholder="Search"
                className={cn(
                  "w-64 pl-10 pr-10 font-inter transition-all duration-200",
                  isSearchOpen && "ring-2 ring-primary/20 border-primary/50"
                )}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                aria-label="Global search"
                aria-expanded={isSearchOpen}
                aria-haspopup="listbox"
                role="combobox"
              />
              
              {/* Right side content - Loading or Keyboard shortcut */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : !isSearchOpen && !searchQuery ? (
                  <kbd className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </kbd>
                ) : null}
              </div>
            </div>
            
            {/* Search Results */}
            {isSearchOpen && debouncedQuery.length >= 2 && (
              <SearchResults
                results={searchResults}
                isLoading={isLoading}
                onResultClick={handleResultClick}
                selectedIndex={selectedIndex}
                onMouseEnter={handleMouseEnter}
              />
            )}
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-red text-xs"></span>
          </Button>

          {/* User Menu */}
          <ClerkUserButton />
        </div>
      </div>
    </div>
  );
}
