# osu! PP Comparison - for the fellas

A simple but clean way to compare osu! player stats, built for me and my friends because yeah... we always gotta know who's better.

Now it also has a Discord bot, custom rooms, a 1v1 duel mode, map score boards, snipes, animations, sounds, and enough neon to make a ranked argument look official xd

---

## Changelog

### v1.9 - Map Scores, Snipes and theme transitions
- Added a **Map Scores room**: search a beatmap by ID or link and view its score board
- Added support for **global scores** and **friend scores** when logged in with osu!
- Added automatic **snipe detection** for visible map scores, because yes, getting passed on a map deserves documentation
- Added a full **Snipe Focus** view with both players, avatars, ranks, score gap, PP gap, accuracy gap, positions and score details
- Added a richer beatmap hero for the scores room and snipe detail view
- Added proper `No Mod` chips in score boards instead of letting NM look like it came from the basement
- Added a cinematic **theme switch transition**: fade to black, swap theme, fade back in

Small note: this is the first big pass for the map score/snipe system. The core is there now, but I still want to make the snipe side feel even more like its own little rivalry room later.

### v1.8 - Direct Duel, animations and UI sounds
- Added a **Direct Duel / 1v1 mode** for 2-player comparisons
- Duel Mode now scores players across PP, accuracy, activity, rank, top play, top 5 PP, max combo, total hits, total score and replays watched
- Added a more detailed **comparison breakdown** for normal multi-player comparisons
- Added **style tags** like PP Leader, Accuracy Demon, Grinder, Top Play Carry, Underdog and Balanced
- Added **GSAP-based animations** for Focus Mode, rooms and Duel Mode
- Added a first pass of **custom UI sounds** with mute and volume controls
- Expanded Focus/Profile stats with max combo, total hits and replays watched when osu! provides them

Small honesty note: the sounds are still kind of provisional/customizable for now. They work, but I still want to tune the exact vibe. Same with Duel Mode and the animations: they are already usable, but this is the first serious pass, not the final anime opening.

### v1.7 - Discord Bot + Visual Compare Images
- Added a **Discord bot** inside the same ASP.NET Core project
- Added `/osu-profile` for quick osu! profile snapshots in Discord
- Added `/osu-compare` to generate a **PNG comparison image** that looks like the website, not just a boring embed
- Added visual room images for Profile, Top Plays and Recent Plays from Discord buttons/selects
- Added a hidden share/render mode for compare and rooms
- Added Chromium screenshot support for Render deploys
- Docker now installs Chromium so Discord image generation can work in production

### v1.6 - Recent Plays + Choke Detector
- Added the **Recent Plays room**: `#/recent/:username`
- Recent Plays pulls all available recent plays from osu!'s recent window
- Added manual refresh buttons for Top Plays and Recent Plays
- Added auto-refresh for Top Plays and Recent Plays rooms
- Increased expanded Top Plays to **10 plays**
- Added **Choke Detector Lite** chips for plays that look painful enough
- Choke chips can mark things like `1 miss choke`, high acc choke and combo drop

### v1.5 - Rooms + Player Profiles
- Added internal hash routes for app rooms
- Added expanded **Player Profile** pages
- Added expanded **Top Plays** room
- Added cleaner Friends and History rooms so the landing page does not get crowded
- Added mod name tooltips
- Added the "created by manu is washed" footer

### v1.4 - osu! Login + Friends + History
- Added **osu! OAuth login** with server-side session handling
- Added logged-in user mini-card with avatar, username, title and logout
- Added **friends list** for logged-in users using `friends.read`
- Friends support search, favorites and quick selection for comparisons
- Added **comparison history** with favorite comparisons, stored per logged-in user
- Added backend endpoints for `/api/me` and `/api/me/friends`

### v1.3 - Compare Insights + Themes (BETA)
- Added a comparison insights strip for 2-4 players: PP lead, best accuracy, play count and best top play
- PP lead shows who the leader is ahead of, using the actual second top player's name
- Added theme system beta with Cyberpunk as the main theme and Heaven as an experimental theme
- Focus Mode shows whether the top play was made on **osu!lazer** or **osu!stable**
- Improved Focus Mode layout behavior for zoom/scroll edge cases
- Creator styling also applies when `manu is washed` appears as highlighted player

### v1.2 - Top Play Showcase + Focus Mode
- Each player card shows their #1 top play
- Single player mode shows a full expanded top play layout
- Added **Focus Mode**: click any card to open a fullscreen detailed view
- Lang switch hides when scrolling down and reappears on scroll up
- Creator badge visual update for `manu is washed`

### v1.1 - 4 Players + Multi-language
- Supports **4-player** comparisons because somebody always got left out
- Added multi-language support: **ES / EN / DE**

### v1.0 - Initial Release
- Compare osu! players
- PP, accuracy, play count, play time, global rank and country rank
- Leader detection + auto-refresh

---

## What is this?

This is a small web app that lets you compare up to **4 osu! players** in real time.

It shows:
- PP
- Accuracy
- Play count
- Play time
- Global and country rank
- Peak rank and 90-day rank trend when osu! provides it
- Activity status from `last_visit`
- Top Play and expanded Top Plays
- Recent Plays
- Map Scores by beatmap ID or link
- Friend/global score boards when osu! lets us see them
- Detected snipes between visible map scores
- Max combo, total hits and replays watched when available
- Stable/Lazer score indicator
- Small "did you choke that?" indicators, because pain should be documented

All in a cyberpunk UI with some personality, plus an experimental Heaven theme for when the page wants to look less like a basement and more like a dream.

---

## Why I made this

I made this thinking about my friends. We are always comparing stats, arguing, joking around and checking who is ahead.

So instead of opening four osu! profiles and doing math like it is homework... I just built this.

And then we added a Discord bot, because apparently opening the website was still too much work sometimes.

---

## Live website

https://osu-comparison-api.onrender.com

If it takes a few seconds to load, the server is probably waking up. Free hosting moment.

---

## Discord bot

The Discord bot is part of the same ASP.NET Core project.

Current commands:
- `/osu-profile` - shows a clean profile snapshot
- `/osu-compare` - generates a visual comparison image, like the website took a screenshot for you

The compare message also lets you open visual Profile, Top Plays and Recent Plays images for each player.

The goal is not to be another generic osu! bot. The cool part is making comparisons that actually look like **osu! for fellas**.

---

## Tech

- Frontend: HTML, CSS, JavaScript
- Backend: ASP.NET Core
- API: osu! official API
- Auth: osu! OAuth with server-side sessions
- Discord: Interactions API / slash commands
- Screenshots: Chromium headless
- Animations: GSAP + CSS
- Sounds: Web Audio API + custom WAV assets
- Hosting: Render

---

## Features

- Compare 1-4 osu! players
- Normal comparison view with leader, cards, top plays and summary stats
- Comparison breakdown for multi-player results
- Direct Duel / 1v1 mode for two players
- Style tags per player
- Focus Mode for detailed player view
- Expanded Player Profile room
- Expanded Top Plays room with 10 plays
- Recent Plays room
- Map Scores room
- Snipe detection and Snipe Focus view
- Choke Detector Lite
- Replay download links when osu! exposes replay availability
- osu!lazer / osu!stable indicator for scores
- osu! OAuth login and logout
- Logged-in user mini-card
- Friends list with search, favorites and quick comparison selection
- Comparison history and favorite comparisons
- Multi-language: ES / EN / DE
- Theme selector: Cyberpunk and Heaven
- Cinematic theme switching transition
- GSAP animations for major views
- UI sound system with mute and volume controls
- Legal Terms and Privacy pages for Discord verification
- Discord bot with profile, visual compare and visual room images
- Auto-refresh for comparisons and score rooms

---

## Future ideas

- Keep polishing Duel Mode so it feels more premium and less "first boss fight prototype"
- Better animation language across the whole app
- Better sound set and maybe different sound profiles later
- Polish and optimize Heaven Theme
- Crimson Night / Horror Rhythm seasonal theme for Halloween
- More Discord commands and layouts
- Better public share links
- Maybe richer historical/player analysis if osu! API gives us enough good data

Nothing here is a promise carved in stone. It is more like "I will probably get curious at 2 AM and add it anyway" xd

---

## Final note

Nothing crazy, just something built with a bit of personality.

Mostly for the fellas.
