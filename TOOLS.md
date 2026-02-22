# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Environment keys / IDs

### WalletConnect / Reown
- Project ID: `e442eaaa1d55a9f4a094cccd35c0d0ad`
  - Use as: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### X (Twitter)
- Handle: `@TheBotTeamHQ`
- Note: API keys must be stored in environment variables (never committed). For auto-posting we need X API credentials; xAI API keys are not the same as X posting keys.

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
