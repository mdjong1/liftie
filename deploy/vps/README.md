# Self-hosted Liftie (178.62.238.193)

- **Upstream → fork:** `.github/workflows/sync-upstream.yml` merges `pirxpilot/liftie` into `main` daily. A failure email means a conflict: merge `upstream/main` locally, fix, push.
- **Fork → VPS:** `liftie-deploy.timer` checks `main` every 15 min, then runs `pnpm install`, `make build` and `make test`, restarts, and health-checks `/api/resort/lesarcs`. Any failure rolls back to the last good commit.
- **Custom work:** commit to `main` (or merge a branch into it); it goes live within 15 min.
- **On the VPS:** `journalctl -u liftie-deploy` (deploys), `journalctl -u liftie` (app), `systemctl start liftie-deploy` (deploy now). Liftie listens on port 3500, which UFW keeps closed; `liftie_relay` on :7070 calls it locally.
- **Changed a file in `deploy/vps/`?** Re-run `ssh root@178.62.238.193 'bash -s' < deploy/vps/setup.sh`.
