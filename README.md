# Google Translate Audio Looper (Chrome Extension) 🎨🎧

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/google-translate-audio-lo/cgjpahgdgkogojeiakjinihplpbpkhoa)

A minimalist, Mondrian-style Chrome extension designed for language learners. This tool adds an "audio looping" panel to Google Translate, allowing you to focus on repetition and pronunciation of both source and translated text.

![Project Preview](https://via.placeholder.com/800x450.png?text=Mondrian+Audio+Looper+Preview)

## ✨ Features

- **Infinite Looping**: Repeat the source or translated audio indefinitely.
- **Unified Controls**: One-click play for source/target and one unified stop button.
- **Mondrian Aesthetic**: Clean, modern UI inspired by Piet Mondrian's primary color compositions.
- **Snap-to-Edge**: Draggable panel with magnetic snapping to screen edges and visual indicators.
- **Global Support**: Works across all international Google Translate domains.
- **Keyboard Shortcuts**:
  - `I`: Toggle Source Playback
  - `O`: Toggle Target Playback
  - `P`: Stop All Playback

## 📂 Project Structure

```text
.
├── app/                # Root directory for the Chrome extension
│   ├── manifest.json   # Browser extension configuration
│   ├── content.js      # Main logic (injection, looping, snapping)
│   ├── content.css     # Minimalist UI styles
│   └── icons/          # Extension icons (Mondrian style)
└── README.md           # You are here
```

## 🛠 Installation

### 🌐 Chrome Web Store (Recommended)
You can install the official version from the [Chrome Web Store](https://chromewebstore.google.com/detail/google-translate-audio-lo/cgjpahgdgkogojeiakjinihplpbpkhoa).

### 🛠 Developer Mode (Manual)
1.  **Clone the repository**: `git clone https://github.com/your-username/google-translate-audio-looper-ext.git`
2.  **Open Chrome Extensions**: Navigate to `chrome://extensions/`.
3.  **Enable Developer Mode**: Toggle the switch in the upper right corner.
4.  **Load Unpacked**: Click "Load unpacked" and select the **`app`** folder within this project.

## 🚀 Publication Status
This extension is published and available on the [Chrome Web Store](https://chromewebstore.google.com/detail/google-translate-audio-lo/cgjpahgdgkogojeiakjinihplpbpkhoa).

## 📜 License
This project is open-source and available under the MIT License.

