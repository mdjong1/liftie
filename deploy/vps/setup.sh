#!/bin/bash
# One-time setup of self-hosted Liftie on the VPS (Ubuntu 22.04). Run as root from a checkout:
#   ssh root@178.62.238.193 'bash -s' < deploy/vps/setup.sh
# Safe to re-run; re-run it after changing files in deploy/vps/ (the timer only redeploys the app).
set -euo pipefail

# Node 24 LTS from NodeSource, kept patched by unattended-upgrades
if ! command -v node >/dev/null; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -q
  DEBIAN_FRONTEND=noninteractive apt-get install -y -q nodejs
fi
echo 'Unattended-Upgrade::Origins-Pattern { "site=deb.nodesource.com"; };' > /etc/apt/apt.conf.d/51unattended-upgrades-nodesource
command -v pnpm >/dev/null || npm install -g --silent pnpm@10

# Unprivileged owner of the checkout; dependency install scripts never run as root
id liftie >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/liftie --shell /usr/sbin/nologin liftie
if [ ! -d /opt/liftie/.git ]; then
  install -d -o liftie -g liftie /opt/liftie
  runuser -u liftie -- git clone -q https://github.com/mdjong1/liftie.git /opt/liftie
fi

install -m 0755 /opt/liftie/deploy/vps/liftie-deploy /usr/local/bin/liftie-deploy
install -m 0644 /opt/liftie/deploy/vps/liftie.service /opt/liftie/deploy/vps/liftie-deploy.service \
  /opt/liftie/deploy/vps/liftie-deploy.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable -q liftie
/usr/local/bin/liftie-deploy
systemctl enable -q --now liftie-deploy.timer
echo "liftie: $(systemctl is-active liftie), timer: $(systemctl is-active liftie-deploy.timer)"
