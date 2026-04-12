# MERP — MSME Energy Resilience Platform ⛽

**India's first real-time fuel intelligence system for 12.8 million MSMEs.**
Built for the informal economy during the West Asia Supply Chain Crisis of 2026.

---

## ⚡ The Challenge: Darkness for MSMEs
In March 2026, severe supply chain disruptions have triggered a national energy emergency. While large corporations have resilient backups, 12.8 million MSMEs (Micro, Small, and Medium Enterprises) are vulnerable:
- **Zero Visibility**: Hand-to-mouth fuel dependency with no real-time availability data.
- **Black Markets**: Predatory middlemen charging up to 300% premiums.
- **Shutdown Risk**: 110 million livelihoods at risk if factories go dark for just 3 days.

## 🚀 The Solution: MERP
MERP is a proactive, data-driven intelligence layer designed to predict energy shortages and dynamically reroute fuel before units shut down.

### Core Features
- **📞 Voice AI (IVR) Registration**: A zero-infrastructure, 8-language IVR system (powered by Vapi) that allows any MSME owner to register using a simple missed call—no smartphone or internet required.
- **🗺️ Interactive Risk Mapping**: Real-time geospatial tracking of 250+ MSME units across high-risk clusters (Morbi, Bhiwandi, Ludhiana) overlaid with dealer stock levels.
- **🔔 Predictive Shutdown Alerts**: Automated "Early Warning" system that notifies units via SMS 48-72 hours before their fuel runs out.
- **🔄 Dynamic Fuel Rerouting**: A QR-code voucher system that allows the government to allocate emergency fuel directly to critical units, bypassing black markets.
- **🏛️ District Official Dashboard**: Provides governance bodies (DICs) with daily "Morning Reports" on which factories face imminent shutdown risk.

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite + Framer Motion (for premium UI/animations)
- **Maps**: React-Leaflet + OpenStreetMap
- **Voice AI**: @vapi-ai/web (integrating high-fidelity voice agents)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Tailored Glassmorphism Design System)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Vapi.ai API Key (for the IVR Simulator)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/batmanven/fixforwardhackathon.git
   cd fixforwardhackathon
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_VAPI_PUBLIC_KEY="your_vapi_public_key"
   VITE_VAPI_ASSISTANT_ID="your_assistant_id"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Projected Impact (Year 1)
- **7,000+** MSMEs protected across 7 industrial clusters.
- **350,000+** Jobs secured from immediate displacement.
- **₹525 Cr** in revenue preserved for the informal economy.
- **57%** average reduction in fuel cost for emergency allocation.

---
**Built with ❤️ for the FixForward Hackathon 2026.**
*Turning a reactive government into a predictive one.*
