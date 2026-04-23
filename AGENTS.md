# Agent Team Playbook

Run each agent in its own git worktree so they never conflict.

```bash
# Create worktrees
git worktree add ../data-ui     main
git worktree add ../data-db     main
git worktree add ../data-auth   main
git worktree add ../data-pwa    main
```

## Agents

| Agent | Worktree | Scope | Touches |
|-------|----------|-------|---------|
| **UI** | `../data-ui` | Components, pages, Framer Motion animations | `src/components/`, `src/app/` (UI only) |
| **DB** | `../data-db` | Supabase schema, queries, lib helpers | `src/lib/`, `src/data/` |
| **Auth** | `../data-auth` | Magic-link flow, middleware, session | `src/middleware.ts`, `src/app/api/auth/` |
| **PWA** | `../data-pwa` | Serwist config, caching strategy, manifest | `next.config.js`, `public/`, `src/app/sw.ts` |

## Workflow

1. Use plan mode first: `claude --plan` — define task + files touched, confirm no overlap
2. Start agents top-to-bottom (DB first — UI depends on it)
3. Each agent reads its row above and ONLY modifies listed paths
4. Status is tracked in `TASKS.md` (create per session, not committed)
5. When an agent needs review → pause, inspect diff, continue
6. Merge order: DB → Auth → PWA → UI (least to most dependent)

## Shared file rule

If a task requires touching a shared file (e.g. `src/lib/supabase.ts`, `tailwind.config.ts`),
only the **DB agent** may edit shared lib files. UI agent must wait for the merge.

## Token hygiene per agent session

- Point at specific files: `@src/lib/queries.ts` not "look at the codebase"
- Run `/compact` before context hits 50%
- `/clear` between unrelated tasks — don't chain sessions
