# How to Run Locally

TaskFlow is a two-screen mobile task manager built with **React Native, Expo SDK 58, Expo Router, and TypeScript**, backed by **Express and SQLite**. Expo provides a simple phone development workflow; Express keeps the three required endpoints straightforward; SQLite stores data without a separate database service. The server uses Node's built-in SQLite driver, so **Node.js 24 LTS or newer** is required.

From the repository root:

```sh
npm --prefix server ci
npm --prefix mobile ci
npm run server
```

In a second terminal:

```sh
npm run mobile
```

Scan the QR code using a compatible Expo Go installation on Android or iOS. Phone and computer must share a network. On Windows, Android emulator or a physical phone are supported; an iOS simulator requires macOS. Expo Go on a physical iOS device may require signing into the same Expo account in the CLI and app.

**Configuration:** copy `mobile/.env.example` to `mobile/.env` and replace the sample address with your computer's Wi-Fi IPv4 address (find it using `ipconfig` on Windows). `EXPO_PUBLIC_API_URL` is the server origin, without `/api/tasks`. Restart Expo after editing it. Android emulator defaults to `http://10.0.2.2:3001`; web and iOS simulator default to `http://localhost:3001`. A physical phone must use the computer's LAN address. Allow the Node server through the firewall on your private network if needed.

The optional `server/.env` supports `PORT` (default `3001`) and `DB_PATH` (default `./data/taskflow.db`, relative to `server`). Start the API using `npm run server` from the root so the working directory is consistent. The server binds to all interfaces for phone access. No secrets, authentication, or cloud services are needed. This local assessment API permits cross-origin requests.

For a browser preview, run `npm --prefix mobile run web`. Native platforms use a system date picker; web uses a browser date input. SQLite is created and the exact supplied 15 tasks are seeded automatically once. Tasks and changes persist across restarts; deleting the local database while the server is stopped resets the demo. Keep the supplied dates unchanged even when they are all in the past.

```sh
npm test
npm run typecheck
npm --prefix mobile run lint
```

API: `GET /api/tasks` accepts optional `assignee=aarav|priya|rohan` and `status=active|completed`, combined with AND. `POST /api/tasks` creates a task (`201`) or returns `{ "errors": { "field": "message" } }` (`400`). `PATCH /api/tasks/:id/toggle` flips completion and returns the task, or `404` for an unknown ID. The server validates calendar dates, field types, allowed options, and trimmed titles; title and description limits are 200 and 5,000 characters.

The demo backend is hosted at `https://envisionstudio-task.onrender.com`; its task endpoint is `/api/tasks`. To use it, set `EXPO_PUBLIC_API_URL=https://envisionstudio-task.onrender.com` in `mobile/.env` and restart Expo. The root `render.yaml` defines a free Node 24 service with `server` as its root directory and `/api/tasks` as its health-check path. The free service has no persistent disk: task changes are lost when its filesystem is replaced on restart or redeployment, and the original 15 tasks are seeded again. It may take time to wake after inactivity. Local SQLite data remains persistent across ordinary local server restarts. The hosted demo has no authentication, as required by the assessment, so anyone with its URL can change its tasks.

An optional standalone Android APK can be built using the `preview` profile in `mobile/eas.json`. Alternatively, `server/Dockerfile` supports container hosts with an HTTPS endpoint and a persistent volume mounted at `/data`; its SQLite file defaults to `/data/taskflow.db`. Without persistent storage, task changes may be lost when a service is replaced.

Then link the mobile app to your Expo project, set `EXPO_PUBLIC_API_URL` to the hosted API origin in the Expo **preview** environment, and run `eas build --platform android --profile preview` from `mobile`. The result is a standalone APK with the JavaScript bundle included; Expo Go and the development computer are not needed. The build configuration rejects a missing or non-HTTPS API URL during cloud builds. APK generation is not yet completed.

# Screen Structure

Task List → Task Detail → Back to Task List; Task List → Add Task modal → Task List.

The list shows title, due date, priority, assignee, and completion, with combined filters, loading, error/retry, and empty states. The detail screen shows every task field. A null due date displays **No due date** and is never overdue. Completed tasks do not show overdue warnings because the warning represents unfinished work requiring attention; this rule is consistent across list and detail. Due dates are date-only values compared with the user's local calendar date; a task due today is not overdue. Creating a task keeps current filters, so a success message explains why a new task might not appear.

# Decision 1 — Optimistic vs. Pessimistic

**Pessimistic:** completion updates only after server confirmation, with a pending indicator and duplicate taps disabled, keeping the app consistent with stored data without rollback complexity.

# Decision 2 — Filter Persistence

**Preserve filters:** assignee and status live in the navigation-level provider so users return to the same working context after viewing or creating a task; restarting the app resets them to All.

# Bug Hunt

1. **Timezone handling:** `toISOString()` produces UTC, whose calendar date can differ from the user's local day near midnight, causing incorrect overdue results.
2. **Silent missing/invalid data:** the comparison never validates `dueDate`; null or undefined values can silently return false, while malformed strings may compare lexicographically and produce misleading results.

# AI Usage

OpenAI Codex was used to break down the assessment, generate the mobile app and backend, write tests and documentation, and run checks. Expo's scaffold supplied the initial mobile configuration. Automated checks cover API behaviour, seed persistence, date boundaries, TypeScript, and linting; a web bundle was also generated. No manual candidate verification or real-device testing has been recorded yet.
