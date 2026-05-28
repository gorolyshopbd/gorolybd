# VPS SSH Key Setup Guide

## Step 1: SSH Key Generate (Local Machine)

### Windows (PowerShell):
```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\shopio-deploy"
```

### Linux / macOS:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/shopio-deploy
```

This creates two files:
- `shopio-deploy` — **private key** (GitHub secret এ দেবেন, কাউকে দেবেন না)
- `shopio-deploy.pub` — **public key** (VPS এ add করবেন)

---

## Step 2: Public Key VPS এ Add

```bash
ssh root@<your-vps-ip>

# .ssh directory exists kina check
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Public key paste করুন
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGp7Y1v8Lf5RcD6x9y2z3B4w5E6r7H8j9K0l1M2n3O4p your@email" >> ~/.ssh/authorized_keys

chmod 600 ~/.ssh/authorized_keys
```

PUBLIC key content টা `cat ~/.ssh/shopio-deploy.pub` করে দেখতে পাবেন।

---

## Step 3: SSH Test

```bash
ssh -i ~/.ssh/shopio-deploy root@<your-vps-ip>
```

Password ছাড়াই login হওয়া উচিত। যদি `Permissions` error দেয়:

### Windows Permission Fix:
```powershell
icacls "$env:USERPROFILE\.ssh\shopio-deploy" /inheritance:r /grant "$env:USERNAME:(R)"
```

### Linux Permission Fix:
```bash
chmod 600 ~/.ssh/shopio-deploy
```

---

## Step 4: GitHub Secrets Add করুন

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | `185.xxx.xxx.xxx` (আপনার VPS IP) |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | পুরো `shopio-deploy` ফাইলের **private key** content |

PRIVATE key content দেখতে:
```bash
cat ~/.ssh/shopio-deploy
```

পুরো content (---BEGIN OPENSSH PRIVATE KEY--- থেকে ---END OPENSSH PRIVATE KEY--- সহ) কপি করে `VPS_SSH_KEY` secrets paste করুন।

---

## Done!

এখন GitHub এ push করলেই auto-deploy হবে:

```
git push origin main
  → GitHub Actions → SSH → git pull → docker compose up -d --build
```
