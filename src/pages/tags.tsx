import { useActor } from "@xstate/react"
import { Searcher } from "fast-fuzzy"
import React from "react"
import { Link } from "react-router-dom"
import { z } from "zod"
import { TagIcon24 } from "../components/icons"
import { Panel } from "../components/panel"
import { Panels } from "../components/panels"
import { SearchInput } from "../components/search-input"
import { GlobalStateContext } from "../global-state"
import { pluralize } from "../utils/pluralize"
import { useDebounce } from "../utils/use-debounce"
import { useSearchParam } from "../utils/use-search-param"

export function TagsPage() {
  const globalState = React.useContext(GlobalStateContext)
  const [state] = useActor(globalState.service)

  const [query, setQuery] = useSearchParam("q", {
    defaultValue: "",
    schema: z.string(),
    replace: true,
  })

  const debouncedQuery = useDebounce(query)

  // Sort tags alphabetically
  const sortedTags = React.useMemo(
    () => Object.entries(state.context.tags).sort((a, b) => a[0].localeCompare(b[0])),
    [state.context.tags],
  )

  // Create a search index
  const searcher = React.useMemo(() => {
    return new Searcher(sortedTags, {
      keySelector: ([name]) => name,
      threshold: 0.8,
    })
  }, [sortedTags])

  const results = React.useMemo(() => {
    if (!debouncedQuery) {
      return sortedTags
    }

    return searcher.search(debouncedQuery)
  }, [debouncedQuery, sortedTags, searcher])

  return (
    <Panels>
      <Panel title="Tags" description={pluralize(sortedTags.length, "tag")} icon={<TagIcon24 />}>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <SearchInput
            placeholder={`Search ${pluralize(sortedTags.length, "tag")}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ul className="flex flex-col">
            {results.map(([name, noteIds]) => (
              <li
                key={name}
                className="flex justify-between border-b border-border-divider py-3 last:border-b-0"
              >
                <Panels.Link className="underline underline-offset-2" to={`/tags/${name}`}>
                  #{name}
                </Panels.Link>
                <span className="text-text-muted">{pluralize(noteIds.length, "note")}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
      <Panels.Outlet />
    </Panels>
  )
}
