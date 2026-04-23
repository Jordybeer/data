# Agent Team Playbook

Run each agent in its own git worktree so they never conflict.

```bash
# Create worktrees
git worktree add ../data-ui         main
git worktree add ../data-db         main
git worktree add ../data-auth       main
git worktree add ../data-pwa        main
git worktree add ../data-wildcard   main
```

## Agents

| Agent | Worktree | Scope | Touches |
|-------|----------|-------|---------|
| **UI** | `../data-ui` | Components, pages, Framer Motion animations | `src/components/`, `src/app/` (UI only) |
| **DB** | `../data-db` | Supabase schema, queries, lib helpers | `src/lib/`, `src/data/` |
| **Auth** | `../data-auth` | Magic-link flow, middleware, session | `src/middleware.ts`, `src/app/api/auth/` |
| **PWA** | `../data-pwa` | Serwist config, caching strategy, manifest | `next.config.js`, `public/`, `src/app/sw.ts` |
| **Wildcard** | `../data-wildcard` | Types cleanup, dead code, performance | Whole repo — no new features, runs after all merges |

## Agent Rules

### DB Agent
- Never guess schema — ask if ambiguous
- Always add RLS policies alongside migrations
- Only agent allowed to touch `src/lib/`

### UI Agent
- Never import directly from supabase — use `src/lib/` helpers only
- Framer Motion only, no raw CSS transitions

### Auth Agent
- Rate limit all auth endpoints
- Never log tokens or email addresses

### PWA Agent
- Serwist cache strategy: stale-while-revalidate for API, cache-first for static
- Test offline fallback on every change

### Wildcard Agent (runs last, after all merges)
- Scope: types cleanup, dead code, performance
- No new features

## Workflow

1. Use plan mode first: `claude --plan` — define task + files touched, confirm no overlap
2. Start agents top-to-bottom (DB first — UI depends on it); Wildcard always runs after all merges are complete
3. Each agent reads its row above and ONLY modifies listed paths
4. Status is tracked in `TASKS.md` (create per session, not committed)
5. When an agent needs review → pause, inspect diff, continue
6. Merge order: DB → Auth → PWA → UI → Wildcard (least to most dependent)

## Shared file rule

If a task requires touching a shared file (e.g. `src/lib/supabase.ts`, `tailwind.config.ts`),
only the **DB agent** may edit shared lib files. UI agent must wait for the merge.

## Token hygiene per agent session

- Point at specific files: `@src/lib/queries.ts` not "look at the codebase"
- Run `/compact` before context hits 50%
- `/clear` between unrelated tasks — don't chain sessions
