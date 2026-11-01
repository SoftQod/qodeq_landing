# qodeq_landing

Static sites and the contact API behind one nginx, served through Cloudflare.

| Dir | Serves |
| --- | --- |
| `landing/` | qodeq.net (www.qodeq.net redirects to it) |
| `demo/` | demo.qodeq.net |
| `demo_voice/` | demo-voice.qodeq.net |
| `redoc/` | redoc.qodeq.net |
| `contact-api/` | Node 20 contact/lead service on port 3001, proxied at qodeq.net `/api/` |
| `nginx/nginx.conf` | nginx config for all domains |

## Deploy

1. Clone the repo on the server.
2. Put the Cloudflare Origin certificate (qodeq.net + *.qodeq.net) at `certs/origin.pem` and its key at `certs/origin.key`.
3. Create `contact-api/.env` from `contact-api/env.example`.
4. If migrating, copy the existing `leads.db` to `data/leads.db`.
5. `docker compose up -d --build`

Update: `git pull && docker compose up -d --build`

Cloudflare SSL/TLS mode must be **Full (strict)**.
