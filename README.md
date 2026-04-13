# 🏍️ MotoLog: Smart Motorcycle Maintenance Tracker

![MotoLog Banner](https://img.shields.io/badge/Status-Beta_V1.0-ff6600?style=for-the-badge) ![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Realm](https://img.shields.io/badge/Realm_Database-39477F?style=for-the-badge&logo=realm&logoColor=white)

**MotoLog** is a local-first, blazing fast React Native application designed specifically for bikers to keep track of their motorcycle's service history, monitor parts lifespan, and manage expenses seamlessly. Built with a stunning dark-mode tailored aesthetic, MotoLog acts as your proactive virtual garage assistant.

---

## 📸 Screenshots

<p align="center">
  <img src="screenshots/Simulator%20Screenshot%20-%20iPhone%2016%20Pro%20-%202026-04-13%20at%2014.33.36.png" width="23%" />
  <img src="screenshots/Simulator%20Screenshot%20-%20iPhone%2016%20Pro%20-%202026-04-13%20at%2014.33.43.png" width="23%" />
  <img src="screenshots/Simulator%20Screenshot%20-%20iPhone%2016%20Pro%20-%202026-04-13%20at%2014.33.49.png" width="23%" />
  <img src="screenshots/Simulator%20Screenshot%20-%20iPhone%2016%20Pro%20-%202026-04-13%20at%2014.34.00.png" width="23%" />
</p>

---

## ✨ Key Features

- **Blazing Fast Offline-First Database**: Powered by Realm DB, MotoLog works 100% offline. No loading spinners, no waiting for server responses. Your data stays securely on your device.
- **Smart Parts Health Tracker**: Intelligent algorithm that parses your service history to calculate the lifespan of your Engine Oil, Brake Pads, and V-Belt/Chain based on your latest Odometer reading.
- **Multi-Garage Management**: Do you own more than one motorcycle? Easily switch between multiple profiles, each maintaining its own isolated service history and stats.
- **Expense Breakdown**: Visualizes your spending habits. Instantly know your total maintenance costs and your average monthly expense.
- **Native Push Notifications**: Never miss an oil change again! Set up time and distance-based local reminders powered by `@notifee`. The app will alert you safely even when closed.
- **Quick Odo Update**: Effortlessly update your motorcycle's current KM reading with a frictionless modal directly from the Home Screen.
- **Premium Aesthetics**: Crafted entirely with `twrnc` (Tailwind for React Native), it utilizes a cohesive, sleek dark-mode design with modern typography and interactive native Sliders.

---

## 🛠️ Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) (v0.79.0)
- **Local Database**: [@realm/react](https://github.com/realm/realm-js)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with AsyncStorage Persistence)
- **Styling**: [twrnc](https://github.com/vadimdemedes/twrnc) (Tailwind CSS for React Native)
- **Navigation**: React Navigation V7 (Stack & Bottom Tabs)
- **Icons**: [Lucide React Native](https://lucide.dev/)
- **Native Notifications**: [@notifee/react-native](https://notifee.app/)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have set up your React Native environment as per the [official documentation](https://reactnative.dev/docs/environment-setup).

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd MotoLog
   ```

2. **Install JavaScript dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Install Native iOS Dependencies**:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the Application

**For iOS:**
```bash
yarn ios
```

**For Android:**
```bash
yarn android
```

---

## 📝 Roadmap (V2.0 Ideas)
- ⛽ **Fuel Tracker**: Monitor fuel consumption (KM/Liter).
- ☁️ **Data Backup & Restore**: Export encrypted JSON backups to easily migrate data between devices.
- 📊 **Advanced Analytics Screen**: Deep dive into spending categories through gorgeous interactive charts.

---
_Crafted with passion for riders, by riders._ 🏍️💨
