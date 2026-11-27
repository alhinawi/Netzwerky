import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

type Env = { DB?: D1Database }

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.get('/health', (c) => c.json({ ok: true, app: 'netzwerky', ts: Date.now() }))

app.get('/books', (c) =>
  c.json({
    books: [
      { id: 'a1-kb', level: 'A1', kind: 'Kursbuch', live: true },
      { id: 'a1-ab', level: 'A1', kind: 'Arbeitsbuch', live: false },
      { id: 'a2-kb', level: 'A2', kind: 'Kursbuch', live: false },
      { id: 'a2-ab', level: 'A2', kind: 'Arbeitsbuch', live: false },
      { id: 'b1-kb', level: 'B1', kind: 'Kursbuch', live: false },
      { id: 'b1-ab', level: 'B1', kind: 'Arbeitsbuch', live: false },
    ],
  }),
)

export const onRequest = handle(app)
