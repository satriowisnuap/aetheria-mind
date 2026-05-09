# 🌌 Aetheria: Mind in Motion

Aetheria is a sensory-rich, interactive workspace designed to transform abstract thoughts into tangible, floating vessels of light. Built with a focus on immersive aesthetics and fluid interaction, it provides a "stellar dimension" for your ideas.

---

## 🌟 The Experience

In Aetheria, thoughts are not just text—they are **Orbs**.
- **Cast Thoughts**: Type your mind and watch it manifest as a floating orb with a unique color, size, and glow based on the emotional weight of your words.
- **Stellar Fusion**: Drag two related orbs together to trigger a fusion process, merging their concepts and visual identities.
- **Constellation Mode**: Reveal the invisible threads connecting your thoughts. Aetheria automatically finds relationships between orbs based on shared keywords and weight categories.

---

## 🕹️ Interactive Modalities

### 🖐️ Hand Tracking Control
Leveraging **MediaPipe Hands**, Aetheria allows you to interact with the void without touching your mouse or screen:
- **Point**: A cosmic cursor follows your finger. Hover over an orb to highlight it.
- **Pinch**: Grab and move orbs through the void.
- **Flick (Burn)**: Throw an orb upward with velocity to release it back into the cosmic dust.
- **Palm**: Open your hand to pause time and freeze all animations.

### 🔊 Procedural Audio
Experience a living soundscape generated entirely in your browser via the **Web Audio API**:
- **Dynamic Drone**: The ambient background hum shifts frequency and complexity based on the number of orbs in your void.
- **Spatial SFX**: Crystal-clear chimes for creation, harmonic intervals for fusion, and frequency-glide "burns" for deletion.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 13](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with Glassmorphism principles
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Machine Learning**: [MediaPipe](https://developers.google.com/mediapipe) for client-side hand tracking (WebAssembly)
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Google Auth](https://firebase.google.com/docs/auth)
- **Audio Engine**: Web Audio API (Procedural Oscillator-based synthesis)

---

## 📁 Directory Structure

```text
aetheria/
├── app/                # Next.js App Router (Pages & Globals)
├── components/         # Modular UI Components
│   ├── HandTracker     # MediaPipe Integration
│   ├── Soundscape      # Audio Lifecycle Management
│   └── Orb             # Core Interactive Thought Vessels
├── hooks/              # Custom React Hooks (State & ML)
├── lib/                # Logic (Audio Engine, Emotion Analysis)
├── context/            # Theme & Auth Context Providers
├── public/             # Static Assets
└── firebase.json       # Backend Configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Firebase project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/aetheria.git
   cd aetheria
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy

Aetheria follows the **Cosmic Glass** design system:
- **Depth**: Multi-layered nebula backgrounds with varying blur levels.
- **Tactility**: Haptic-like visual feedback on every interaction.
- **Dimension**: Seamless switching between Light (Aether) and Dark (Void) modes, with color-adaptive glassmorphism.
- **Accessibility**: Support for reduced motion and screen-reader friendly interactive elements.

---

## 🔒 Security & Privacy

- **Client-Side Processing**: Hand tracking and audio synthesis run 100% in your browser. No camera data ever leaves your device.
- **Cloud Sync**: Thoughts are safely stored in your private Firestore collection if signed in, or persisted in LocalStorage if visiting as a guest.

---

*“The void is not empty; it is a canvas for your thoughts.”* 🌌
