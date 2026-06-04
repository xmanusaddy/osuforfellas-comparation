# 🎮 osu! PP Comparison — for the fellas

A simple but clean way to compare osu! players stats — built for me and my friends, because yeah… we always gotta know who's better.

---

## 📋 Changelog

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

All in a clean cyberpunk UI with a bit of personality.

---

## 👥 Why I made this

I made this thinking about my friends — we're always comparing stats, arguing, and joking around about who's ahead.

So instead of checking profiles one by one… I just built this.

---

## 🚀 Live website

👉 https://osu-comparison-api.onrender.com

*(If it takes a few seconds to load, the server is waking up — free hosting moment)*

---

## 🛠 Tech

* Frontend: HTML, CSS, JS
* Backend: ASP.NET Core
* API: osu! official API
* Hosting: Render (Free)

---

## ✨ Features

* Compare up to 4 players
* osu! OAuth login and logout
* Logged-in user mini-card
* Friends list with search, favorites, and quick comparison selection
* Comparison history and favorite comparisons
* Comparison insights for multi-player results
* Top Play Showcase per player
* Focus Mode for detailed player view
* osu!lazer / osu!stable indicator inside Focus Mode
* Multi-language (ES / EN / DE)
* Theme selector with Cyberpunk default and Heaven beta
* Real-time fetch from osu! API
* Error handling for invalid players
* Leader detection + ranking highlight
* Auto-refresh every 60 seconds

---

## 💭 Future ideas

* Shareable comparison links
* Polish and optimize Heaven Theme...
* Horror Rhythm Theme
* Better animations
* They are just things I came up with, maybe I'll do them (I don't think so) xd

---

## 👀 Final note

Nothing crazy, just something built with a bit of personality.
