# 🎮 Multi-Platform Chat Viewer

A unified, real-time chat viewer for **Twitch**, **Kick**, and **YouTube** that combines all your chats into one beautiful stream. Perfect for streamers, moderators, and viewers who want to see all their communities in one place.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 🔗 Multi-Platform Support
- **Twitch** - Real-time IRC WebSocket connection (no auth required)
- **Kick** - Live Pusher WebSocket integration
- **YouTube** - Live chat polling (API key required)

### 🎨 Rich Chat Experience
- **Emote Support**
  - 7TV (global + custom emote sets)
  - BetterTTV (global + channel-specific)
  - FrankerFaceZ (global emotes)
- **Platform Badges** - Color-coded badges for each platform (toggle on/off)
- **Username Colors** - Displays user colors from Twitch
- **Auto-scroll** - Automatically scrolls to show latest messages
- **Message Limit** - Keeps last 500 messages for performance

### ⚙️ Customization Options
- **Hide/Show Platform Badges** - Toggle TWITCH/KICK/YOUTUBE labels
- **Hide/Show System Messages** - Toggle connection/status messages
- **Transparent Mode** - Perfect for OBS browser sources
- **Persistent Settings** - Saved to localStorage
- **URL Parameters** - Quick setup for OBS scenes

### 🎥 OBS Ready
- Works as **Browser Dock** for easy monitoring
- Works as **Browser Source** with transparent background
- Clean, minimal design perfect for overlays
- Customizable via URL parameters

## 🚀 Quick Start

### Option 1: Direct Configuration (Easiest)
1. Download `index.html`
2. Open it in your browser
3. Click the **⚙️ Configure** button
4. Enter your channel names
5. Click **Save & Connect**

### Option 2: URL Parameters (Best for OBS)
Open the file with URL parameters:
```
index.html?twitch=CHANNEL&kick=CHANNEL&youtube=VIDEOID&transparent=true
```

**Example:**
```
index.html?twitch=xqc&kick=trainwreckstv&transparent=true&7tv=01HE0VJNH8000BVF8508908803
```

## 📖 Configuration

### Required Settings

| Platform | Required | How to Get |
|----------|----------|------------|
| **Twitch** | Channel username | Just the channel name (e.g., `xqc`) |
| **Kick** | Channel username | Just the channel name (e.g., `trainwreckstv`) |
| **YouTube** | Video ID + API Key | Video ID from URL + [Google Cloud API Key](https://console.cloud.google.com/) |

### Optional Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **7TV Emote Set ID** | Custom emote set to load | None |
| **Show Platform Badges** | Show TWITCH/KICK/YOUTUBE labels | ✅ On |
| **Show System Messages** | Show connection messages | ✅ On |
| **Transparent Mode** | Transparent background for OBS | ❌ Off |

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `twitch` | Twitch channel name | `?twitch=xqc` |
| `kick` | Kick channel name | `?kick=trainwreckstv` |
| `youtube` | YouTube video ID | `?youtube=dQw4w9WgXcQ` |
| `youtubekey` | YouTube API key | `?youtubekey=AIza...` |
| `7tv` | 7TV emote set ID | `?7tv=01HE0...` |
| `transparent` | Enable transparent mode | `?transparent=true` |

**Full Example:**
```
index.html?twitch=shroud&kick=trainwreckstv&youtube=abc123&youtubekey=AIza...&transparent=true&7tv=01HE0VJNH8000BVF8508908803
```

## 🎥 OBS Setup

### As a Browser Dock (Recommended for monitoring)
1. In OBS, go to **View** → **Docks** → **Custom Browser Docks**
2. Add a new dock:
   - **Name:** Multi-Chat
   - **URL:** `file:///C:/path/to/index.html?twitch=CHANNEL&kick=CHANNEL`
3. Click **Apply**
4. Your chat dock will appear in OBS!

### As a Browser Source (For on-stream overlay)
1. Add a **Browser Source** to your scene
2. Set the URL:
   ```
   file:///C:/path/to/index.html?twitch=CHANNEL&transparent=true
   ```
3. Set dimensions (e.g., 400x800)
4. Check **Shutdown source when not visible** (optional)
5. Done! You now have a transparent chat overlay

### Pro Tips for OBS
- Use `transparent=true` for browser sources
- Hide platform badges and system messages for cleaner overlay
- Set a custom width/height to fit your scene
- Use different URL parameters for different scenes

## 🔧 YouTube Setup

To use YouTube chat, you need a **free** API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **YouTube Data API v3**
4. Create credentials → **API Key**
5. Copy the key and paste it in the config or URL parameter

**Note:** YouTube API has a free quota of 10,000 units/day (plenty for chat monitoring)

## 🎨 Custom Emotes

### 7TV Emote Sets
You can add custom 7TV emote sets:

1. Find your emote set URL: `https://7tv.app/emote-sets/YOUR_SET_ID`
2. Copy the ID (e.g., `01HE0VJNH8000BVF8508908803`)
3. Add it in config or use `?7tv=YOUR_SET_ID`

The app automatically loads:
- ✅ 7TV global emotes
- ✅ 7TV custom emote sets (if provided)
- ✅ BTTV global emotes
- ✅ BTTV channel-specific emotes
- ✅ FrankerFaceZ global emotes

## 🛠️ Technical Details

### Technologies Used
- **Pure HTML/CSS/JavaScript** - No dependencies, no build process
- **WebSocket Connections** - Real-time chat for Twitch and Kick
- **REST API Polling** - YouTube Live Chat API (5-second interval)
- **localStorage** - Persistent settings between sessions

### Browser Support
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Any modern browser with WebSocket support

### Performance
- Lightweight single-file application
- Message limit of 500 (oldest removed automatically)
- Efficient emote caching
- Minimal CPU/memory usage

## 🐛 Troubleshooting

### Twitch not connecting
- Make sure the channel name is correct (lowercase)
- Check browser console for errors
- Try refreshing the page

### Kick not connecting
- Verify the channel name is correct
- Check if the channel exists: `https://kick.com/CHANNEL`
- Look for error messages in the chat or console

### YouTube not working
- Verify your API key is valid
- Make sure the video ID is correct (from live stream URL)
- Check if the stream is actually live
- Verify API quota hasn't been exceeded

### Emotes not showing
- Some channels may not have BTTV/FFZ emotes
- 7TV emotes require a valid emote set ID
- Check browser console for API errors
- Try refreshing to reload emote cache

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Credits

Built with ❤️ for the streaming community

**Emote Providers:**
- [7TV](https://7tv.app/)
- [BetterTTV](https://betterttv.com/)
- [FrankerFaceZ](https://www.frankerfacez.com/)

**Platform APIs:**
- [Twitch IRC](https://dev.twitch.tv/docs/chat/irc/)
- [Kick.com](https://kick.com/)
- [YouTube Live Streaming API](https://developers.google.com/youtube/v3/live/)

---

**Made for streamers, by streamers** 🎮

Need help? Found a bug? [Open an issue](../../issues)!