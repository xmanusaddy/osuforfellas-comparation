# 🎮 osu! PP Comparison — for the fellas

A simple but clean way to compare osu! player stats — built for me and my friends, because yeah... we always gotta know who's better.

Now it also has a Discord bot, because apparently the arguments had to leave the website and enter the server too xd

---

## 📋 Changelog

### v1.7 — Discord Bot + Visual Compare Images
- Added a **Discord bot** inside the same ASP.NET Core project
- Added `/osu-profile` for quick osu! profile snapshots in Discord
- Added `/osu-compare` to generate a **PNG comparison image** that looks like the website, not just a boring embed
- Added a hidden share/render mode: `?share=compare`
- Added Chromium screenshot support for Render deploys
- Docker now installs Chromium so Discord image generation can work in production

### v1.6 — Recent Plays + Choke Detector
- Added the **Recent Plays room**: `#/recent/:username`
- Recent Plays pulls all available recent plays from osu!'s 24h recent window
- Added manual refresh buttons for Top Plays and Recent Plays
- Added auto-refresh for Top Plays and Recent Plays rooms
- Increased expanded Top Plays to **10 plays**
- Added **Choke Detector Lite** chips for plays that look painful enough
- Choke chips can mark things like `1 miss choke`, high acc choke, and combo drop

### v1.5 — Rooms + Player Profiles
- Added internal hash routes for app rooms
- Added expanded **Player Profile** pages
- Added expanded **Top Plays** room
- Added cleaner Friends and History rooms so the landing page does not get crowded
- Added mod name tooltips
- Added the "created by manu is washed" footer

### v1.4 — osu! Login + Friends + History
- Added **osu! OAuth login** with server-side session handling
- Added logged-in user mini-card with avatar, username, title, and logout
- Added **friends list** for logged-in users using `friends.read`
- Friends now support search, favorites, and quick selection for comparisons
- Added **comparison history** with favorite comparisons, stored per logged-in user
- Added backend endpoints for `/api/me` and `/api/me/friends`

### v1.3 — Compare Insights + Themes (BETA)
- Added a new **comparison insights** strip for 2-4 players: PP lead, best accuracy, play count, and best top play
- PP lead now shows who the leader is ahead of, using the actual second top player's name
- Added **theme system beta** with Cyberpunk as the main theme and Heaven as an experimental theme
- Theme selector now appears on the landing page and results screen, with the selected theme saved locally
- Focus Mode now shows whether the top play was made on **osu!lazer** or **osu!stable**
- Improved Focus Mode layout behavior for zoom/scroll edge cases
- Creator styling now also applies when `manu is washed` (me), appears as the highlighted player in comparison insights

### v1.2 — Top Play Showcase + Focus Mode
- Each player card now shows their **#1 top play** (map, PP, mods, accuracy)
- **Single player mode** shows a full expanded top play layout
- **Focus Mode** — click any card to open a fullscreen detailed view
- Lang switch now hides when scrolling down, reappears on scroll up
- Creator badge visual update (manu is washed gets the red treatment 🩸)

### v1.1 — 4 Players + Multi-language
- Now supports **4-player** comparisons because somebody always got left out 😭
- Added multi-language support: **ES / EN / DE**

### v1.0 — Initial Release
- Compare up to 3 players
- PP, accuracy, playcount, playtime, global & country rank
- Leader detection + auto-refresh

---

## 🧠 What is this?

This is a small web app that lets you compare up to **4 osu! players** in real time.

It shows:
* PP (Performance Points)
* Accuracy
* Playcount
* Playtime
* Global & Country Rank
* **Top Play** (map, PP, mods, accuracy, rank)
* **Top Plays** list
* **Recent Plays**
* Small "did you choke that?" indicators, because pain should be documented

All in a cyberpunk UI with some personality, plus an experimental Heaven theme for when the page wants to look less like a basement and more like a dream.

---

## 👥 Why I made this

I made this thinking about my friends — we're always comparing stats, arguing, and joking around about who's ahead.

So instead of checking profiles one by one... I just built this.

And then we added a Discord bot, because opening the website was apparently too much work sometimes.

---

## 🚀 Live website

👉 https://osu-comparison-api.onrender.com

*(If it takes a few seconds to load, the server is waking up — free hosting moment)*

---

## 🤖 Discord bot

The Discord bot is part of the same project.

Current commands:
* `/osu-profile` — shows a clean profile snapshot
* `/osu-compare` — generates a visual comparison image, like the website took a screenshot for you

The goal is not to be another generic osu! bot. The cool part is making comparisons that actually look like **osu! for fellas**.

---

## 🛠 Tech

* Frontend: HTML, CSS, JS
* Backend: ASP.NET Core
* API: osu! official API
* Discord: Interactions API / slash commands
* Screenshots: Chromium headless
* Hosting: Render (Free)

---

## ✨ Features

* Compare up to 4 players
* osu! OAuth login and logout
* Logged-in user mini-card
* Friends list with search, favorites, and quick comparison selection
* Comparison history and favorite comparisons
* App rooms: Compare, Friends, History, Player Profile, Top Plays, Recent Plays
* Comparison insights for multi-player results
* Top Play Showcase per player
* Expanded Top Plays room with 10 plays
* Recent Plays room
* Choke Detector Lite
* Focus Mode for detailed player view
* osu!lazer / osu!stable indicator
* Multi-language (ES / EN / DE)
* Theme selector with Cyberpunk default and Heaven beta
* Discord bot with profile and visual compare commands
* Real-time fetch from osu! API
* Error handling for invalid players
* Leader detection + ranking highlight
* Auto-refresh for comparisons and score rooms

---

## 💭 Future ideas

* Better public share links
* More Discord commands
* Polish and optimize Heaven Theme...
* Horror Rhythm Theme
* Better animations
* Maybe more compare image layouts for Discord
* They are just things I came up with, maybe I'll do them (I probably will and then complain about it) xd

---

## 👀 Final note

Nothing crazy, just something built with a bit of personality.

Mostly for the fellas.
