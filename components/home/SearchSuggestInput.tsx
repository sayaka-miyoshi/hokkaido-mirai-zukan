'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  filterSearchSuggestions,
  getSuggestionKindLabel,
  type SearchSuggestion,
} from '@/lib/search-suggestions'

type SearchSuggestInputProps = {
  keyword: string
  onKeywordChange: (value: string) => void
  onSelectSuggestion: (value: string) => void
  onShowResults: () => void
  suggestionIndex: SearchSuggestion[]
}

/** キーワード検索入力（学校名・部活名・競技名・企業名のサジェスト） */
export default function SearchSuggestInput({
  keyword,
  onKeywordChange,
  onSelectSuggestion,
  onShowResults,
  suggestionIndex,
}: SearchSuggestInputProps) {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isComposing, setIsComposing] = useState(false)

  const suggestions = useMemo(
    () => filterSearchSuggestions(suggestionIndex, keyword),
    [suggestionIndex, keyword],
  )

  const showList = isOpen && !isComposing && keyword.trim().length > 0 && suggestions.length > 0

  const closeList = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const openList = useCallback(() => {
    if (keyword.trim().length > 0) setIsOpen(true)
  }, [keyword])

  const selectSuggestion = useCallback(
    (value: string) => {
      onKeywordChange(value)
      onSelectSuggestion(value)
      closeList()
      inputRef.current?.blur()
    },
    [closeList, onKeywordChange, onSelectSuggestion],
  )

  useEffect(() => {
    if (!showList) setActiveIndex(-1)
  }, [showList, suggestions.length])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeList()
      return
    }

    if (!showList) {
      if (event.key === 'Enter') onShowResults()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex].label)
      } else {
        closeList()
        onShowResults()
      }
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id="home-search"
        type="search"
        enterKeyHint="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={showList ? listboxId : undefined}
        aria-activedescendant={
          showList && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        value={keyword}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(event) => {
          onKeywordChange(event.target.value)
          setIsOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={openList}
        onBlur={() => {
          window.setTimeout(closeList, 150)
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(event) => {
          setIsComposing(false)
          onKeywordChange(event.currentTarget.value)
          setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder="学校名・部活名・競技名・企業名で検索"
        className="w-full rounded-2xl border border-magazine-border bg-white px-4 py-4 text-base text-magazine-text placeholder:text-magazine-muted focus:border-hokkaido-sky focus:outline-none focus:ring-2 focus:ring-hokkaido-sky/20"
      />

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="検索候補"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-72 overflow-y-auto rounded-2xl border border-magazine-border bg-white py-1 shadow-magazine-sm"
        >
          {suggestions.map((item, index) => (
            <li key={`${item.kind}-${item.label}`} role="presentation">
              <button
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(item.label)}
                className={`flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-magazine-text transition-colors
                  ${activeIndex === index ? 'bg-magazine-sky' : 'hover:bg-magazine-sky/70 active:bg-magazine-sky'}`}
              >
                <span className="min-w-0 truncate font-medium">{item.label}</span>
                <span className="shrink-0 rounded-full bg-magazine-cream px-2 py-0.5 text-[10px] font-bold text-magazine-muted">
                  {getSuggestionKindLabel(item.kind)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
