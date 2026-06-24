# Custom UI sounds

Put your audio files in this folder and reference them from `manifest.json`.

Example:

```json
{
  "volume": 0.28,
  "sounds": {
    "click": "/sounds/ui/click.wav",
    "back": "/sounds/ui/back.wav",
    "success": "/sounds/ui/success.wav",
    "error": "/sounds/ui/error.wav",
    "duel": "/sounds/ui/duel-glitch.wav",
    "profile": "/sounds/ui/profile-loaded.wav",
    "comparison-1": "/sounds/ui/comparison-1.wav",
    "comparison-2": "/sounds/ui/comparison-2.wav",
    "comparison-3": "/sounds/ui/comparison-3.wav",
    "comparison-4": "/sounds/ui/comparison-4.wav"
  }
}
```

MP3, OGG, and WAV work in modern browsers. Short files without leading silence work best:

- `click`: 30-80 ms
- `back`: back buttons, closing overlays, and Escape
- `success`: Top Plays and Recent Plays loaded
- `error`: API request failed
- `duel`: around 2 seconds, matching the full Duel entrance sequence
- `profile`: full profile loaded
- `comparison-1`: one player comparison loaded
- `comparison-2`: two player comparison loaded
- `comparison-3`: three player comparison loaded
- `comparison-4`: four player comparison loaded

Empty entries use the synthesized fallback sound. Reload the page after changing the manifest or replacing a file.
