# Repository Guidelines

- All repository artifacts, code, comments, and documentation must be written in English.

## Project Structure & Module Organization
- `server.js` is the MCP entry point; keep shared helpers top-level so Claude Desktop can consume it directly.
- `get-graph-id.js` (`npm run setup`) handles onboarding; adjust its prompts whenever Reflect endpoints change.
- `verify.js`, `.env.example`, and `claude_desktop_config.example.json` define the configuration contract—update them together when env keys or flags shift.
- Use `docs/reflect_api.md` for API notes and payload samples instead of expanding the README.

## Build, Test, and Development Commands
- `npm install` syncs dependencies; rerun after touching `package.json` or cloning fresh.
- `npm start` runs the MCP server for Claude-driven manual checks or quick `curl` calls.
- `npm run setup` validates the token and lists graphs, ensuring onboarding stays frictionless.
- `npm test` executes `node server.js --test`, confirming the server initialises cleanly with mocked env vars.
- `node verify.js` audits dependencies, env vars, and required files before release.

## Coding Style & Naming Conventions
- Target Node 18+ with ESM; use `import`/`export`, top-level `const`, and 2-space indentation.
- Group axios helpers and tool handlers by feature; new modules use kebab-case filenames such as `schedule-reminder.js`.
- Log operator-facing events with `console.error`; keep messages concise and emoji-prefixed to mirror existing output.
- Default comments and strings to English unless surfaced to Reflect end users.

## Testing Guidelines
- Extend the `--test` path behind `npm test` with assertions for new tools or edge cases.
- Place richer suites under `tests/` (create if needed) with names like `tools-schedule.test.js`; execute via `node --test` or another lightweight runner.
- Mock Reflect APIs with fixtures so automated runs never touch production data.

## Commit & Pull Request Guidelines
- Follow the scope-prefixed pattern in history (`docs:`, `feat:`, `fix:`) and keep messages imperative.
- Limit PRs to one change-set, highlight behaviour updates, and attach repro steps plus screenshots or terminal output when UX shifts.
- Run `npm test` and `node verify.js` before requesting review, and link related Reflect or Claude documentation in the description.

## Environment & Security Tips
- Keep `.env` untracked; refresh `.env.example` whenever defaults change so onboarding stays accurate.
- Rotate tokens after debugging and censor secrets in logs or shared snippets (`<reflect-token>`, `<graph-id>`).
- Avoid storing production responses; redact request bodies before saving fixtures.
