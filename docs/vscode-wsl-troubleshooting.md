# VSCode Remote-WSL Troubleshooting Guide

This guide helps resolve common VSCode Remote-WSL connection issues and crashes.

## 🚨 Common Issues & Solutions

### 1. "Reconnecting to Remote" Loop

**Symptoms:**

- VSCode shows "Reconnecting..." repeatedly
- Can't edit files or run commands
- Terminal becomes unresponsive

**Quick Fix:**

```bash
# In WSL terminal
pkill -f vscode-server
rm -rf ~/.vscode-server
code .
```

**Permanent Fix:**

1. Always start VSCode from WSL terminal
2. Increase WSL memory allocation
3. Disable aggressive file watching

### 2. "Could not establish connection" Error

**Symptoms:**

- VSCode fails to connect to WSL
- Error: "Could not establish connection to WSL"

**Solutions:**

```bash
# 1. Restart WSL (in PowerShell as Admin)
wsl --shutdown
wsl

# 2. Clear VSCode Server
rm -rf ~/.vscode-server

# 3. Reset WSL network
netsh winsock reset
netsh int ip reset
```

### 3. High CPU/Memory Usage

**Symptoms:**

- System becomes sluggish
- Fan runs constantly
- VSCode freezes

**Solutions:**

1. **Limit File Watching:**
   Already configured in `.vscode/settings.json`

2. **Limit WSL Memory:**

   ```ini
   # In C:\Users\[Username]\.wslconfig
   [wsl2]
   memory=6GB  # Adjust based on your system
   processors=4
   ```

3. **Disable Unused Extensions:**
   - View → Extensions
   - Disable extensions you don't need
   - Especially heavy ones like Live Server

### 4. Git Operations Slow

**Symptoms:**

- Git commands take forever
- File operations are slow

**Solutions:**

1. **Ensure files are in WSL:**

   ```bash
   # Good (fast)
   cd ~/projects/SaSarjan-AppStore

   # Bad (slow)
   cd /mnt/c/Users/Username/projects/SaSarjan-AppStore
   ```

2. **Configure Git for WSL:**
   ```bash
   git config --global core.autocrlf false
   git config --global core.filemode false
   ```

### 5. Extensions Not Working

**Symptoms:**

- Extensions installed but not functioning
- IntelliSense not working
- Linting not running

**Solutions:**

1. **Install in WSL:**
   - Click on extension
   - Select "Install in WSL: Ubuntu"

2. **Reload Window:**
   - Ctrl+Shift+P → "Reload Window"

3. **Check Extension Host:**
   - View → Output → "Extension Host"
   - Look for errors

### 6. Terminal Issues

**Symptoms:**

- Terminal won't open
- Commands not found
- Wrong shell

**Solutions:**

1. **Set Default Shell:**

   ```json
   // In settings.json
   "terminal.integrated.defaultProfile.linux": "bash"
   ```

2. **Fix PATH:**
   ```bash
   # In ~/.bashrc
   export PATH=$PATH:/usr/local/bin:/usr/bin
   ```

### 7. Port Forwarding Issues

**Symptoms:**

- Can't access localhost:3000
- Services not reachable from browser

**Solutions:**

1. **Check Port Forwarding:**
   - Ports tab in VSCode
   - Ensure ports are forwarded

2. **Manual Forward:**
   ```bash
   # In .vscode/settings.json
   "remote.autoForwardPorts": true
   ```

## 🛠️ Advanced Troubleshooting

### Complete Reset Procedure

When nothing else works:

```bash
# 1. Close VSCode completely

# 2. In PowerShell (Admin)
wsl --shutdown

# 3. Clear all VSCode data
wsl
rm -rf ~/.vscode-server
rm -rf ~/.vscode

# 4. Clear Windows VSCode cache
# In PowerShell
Remove-Item -Recurse -Force "$env:APPDATA\Code"
Remove-Item -Recurse -Force "$env:USERPROFILE\.vscode"

# 5. Restart computer

# 6. Start fresh
wsl
cd ~/projects/SaSarjan-AppStore
code .
```

### Performance Profiling

```bash
# Check WSL resource usage
free -h
top

# Check VSCode server processes
ps aux | grep vscode-server

# Check disk I/O
iostat -x 1

# Check network
netstat -tulpn | grep node
```

### Debug Logging

Enable verbose logging:

```json
// In .vscode/settings.json
"remote.WSL.debug": true,
"remote.extensionLogLevel": "trace"
```

Check logs:

- Help → Toggle Developer Tools
- View → Output → "WSL"

## 🔍 Diagnostic Commands

### System Information

```bash
# WSL version
wsl -l -v

# Ubuntu version
lsb_release -a

# Node/npm versions
node --version
npm --version
pnpm --version

# Docker status
docker --version
docker ps
```

### VSCode Information

```bash
# VSCode server version
ls ~/.vscode-server/bin/

# Extension list
code --list-extensions

# Process check
ps aux | grep -E "(node|code)"
```

## 📋 Prevention Checklist

### Daily Best Practices

- [ ] Start Docker Desktop first
- [ ] Always launch VSCode from WSL terminal
- [ ] Keep project files in WSL filesystem
- [ ] Close unused editor tabs
- [ ] Restart VSCode if it's been running for days

### Weekly Maintenance

- [ ] Update VSCode and extensions
- [ ] Clear Docker cache: `docker system prune`
- [ ] Check disk space: `df -h`
- [ ] Review and disable unused extensions
- [ ] Update WSL: `sudo apt update && sudo apt upgrade`

### Monthly Checkup

- [ ] Review .wslconfig settings
- [ ] Update Windows and WSL2
- [ ] Clean VSCode cache
- [ ] Review system performance
- [ ] Backup important work

## 🆘 When to Escalate

Contact system administrator if:

- Hardware issues (constant crashes)
- Network connectivity problems
- Permission errors that persist
- WSL2 kernel issues
- Windows Update problems

## 📚 Resources

- [VSCode Remote Troubleshooting](https://code.visualstudio.com/docs/remote/troubleshooting)
- [WSL Troubleshooting](https://docs.microsoft.com/en-us/windows/wsl/troubleshooting)
- [Docker Desktop Troubleshooting](https://docs.docker.com/desktop/troubleshooting/)

---

Remember: Most issues are solved by starting VSCode from WSL terminal instead of Windows!
