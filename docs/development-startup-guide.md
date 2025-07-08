# Development Environment Startup Guide

This guide helps you start your Windows/WSL/Docker/VSCode/Claude Code development environment in the optimal sequence to prevent crashes and ensure best performance.

## 🚀 Quick Start (Recommended Method)

### From WSL Terminal:

```bash
cd ~/projects/SaSarjan-AppStore
./scripts/dev-startup.sh
```

This script handles the entire startup sequence automatically.

## 📋 Manual Startup Sequence

If you prefer manual control or the script fails, follow these steps:

### 1. **Start Windows Services**

- Ensure Docker Desktop is running (check system tray)
- Wait for Docker to be fully initialized (icon shows "Docker Desktop is running")

### 2. **Open Windows Terminal**

```bash
# Start WSL2
wsl

# Navigate to project
cd ~/projects/SaSarjan-AppStore
```

### 3. **Start VSCode from WSL** (IMPORTANT!)

```bash
# This is the key to preventing crashes
code .
```

**Why from WSL?**

- Direct filesystem access (5-10x faster)
- Native Linux tooling
- More stable Remote-WSL connection
- No path translation overhead

### 4. **Start Docker Services**

In VSCode integrated terminal:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 5. **Install Dependencies & Start Dev**

```bash
pnpm install
pnpm dev
```

## 🛑 Common Mistakes to Avoid

### ❌ DON'T: Start VSCode from Windows

- Opening VSCode from Windows Start Menu
- Double-clicking project folder in Windows Explorer
- Using "Open with Code" from Windows context menu

### ✅ DO: Always start from WSL terminal

```bash
cd ~/projects/SaSarjan-AppStore
code .
```

## 🔧 Initial Setup (One-time)

### 1. **Configure WSL2 Resources**

Copy `docs/wslconfig-template.txt` to `C:\Users\[YourUsername]\.wslconfig`

### 2. **Install VSCode Remote-WSL Extension**

- Open VSCode
- Install "Remote - WSL" extension by Microsoft
- Restart VSCode

### 3. **Configure Git in WSL**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📊 Service Ports Reference

| Service         | Port | URL                   |
| --------------- | ---- | --------------------- |
| Main App        | 3000 | http://localhost:3000 |
| TalentExcel     | 3001 | http://localhost:3001 |
| SevaPremi       | 3002 | http://localhost:3002 |
| 10xGrowth       | 3003 | http://localhost:3003 |
| Admin Dashboard | 3004 | http://localhost:3004 |
| Redis           | 6379 | -                     |
| MinIO Console   | 9001 | http://localhost:9001 |
| MailHog UI      | 8025 | http://localhost:8025 |
| Adminer         | 8080 | http://localhost:8080 |

## 🚨 Troubleshooting VSCode Crashes

### Quick Fix for "Reconnecting to Remote" Issues

```bash
# In WSL terminal
pkill -f vscode-server
rm -rf ~/.vscode-server/bin/*
code .
```

### Permanent Fixes

1. **Increase WSL Memory**
   - Edit `C:\Users\[YourUsername]\.wslconfig`
   - Set `memory=8GB` or higher
   - Restart WSL: `wsl --shutdown`

2. **Disable Windows Defender for WSL**
   - Add exclusion for `\\wsl$\Ubuntu\home\[username]\projects`
   - Improves file watching performance

3. **Use Stable Versions**
   - VSCode Stable (not Insiders)
   - Latest Windows updates
   - WSL2 (not WSL1)

## 🛑 Shutdown Sequence

### Automated:

```bash
./scripts/dev-shutdown.sh
```

### Manual:

1. Stop dev servers: `Ctrl+C` in terminal
2. Stop Docker: `docker-compose -f docker-compose.dev.yml down`
3. Close VSCode
4. (Optional) Stop WSL: `wsl --shutdown` in PowerShell

## 💡 Performance Tips

### WSL2 Optimization

- Keep project files in WSL filesystem (`~/projects/`)
- Never use `/mnt/c/` for development
- Use WSL2 backend for Docker Desktop

### VSCode Settings

- Limit open editors: Already configured in `.vscode/settings.json`
- Exclude large folders from file watching
- Use workspace TypeScript version

### Resource Management

- Close unused browser tabs
- Limit Docker container resources
- Run `docker system prune` weekly

## 🎯 Daily Workflow

### Morning

```bash
# In Windows Terminal
wsl
cd ~/projects/SaSarjan-AppStore
./scripts/dev-startup.sh
```

### Evening

```bash
# In VSCode terminal
./scripts/dev-shutdown.sh
```

## 📚 Additional Resources

- [VSCode Remote Development](https://code.visualstudio.com/docs/remote/wsl)
- [WSL2 Best Practices](https://docs.microsoft.com/en-us/windows/wsl/best-practices)
- [Docker Desktop WSL2 Backend](https://docs.docker.com/desktop/windows/wsl/)

---

Remember: **Always start VSCode from WSL terminal** to prevent crashes and ensure optimal performance!
