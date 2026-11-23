<div align="center">

# 🧑‍💼 CandyAdminJS

### Admin dashboard app for managing the CandyApp store

[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Axios](https://img.shields.io/badge/Axios-REST_API-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)
[![Platform](https://img.shields.io/badge/Platform-Android_|_iOS-3DDC84?style=for-the-badge&logo=android&logoColor=white)](#)

[✨ Features](#-features) • [🛠 Tech Stack](#-tech-stack) • [📁 Structure](#-project-structure) • [🚀 Getting Started](#-getting-started) • [🔗 Ecosystem](#-candyapp-ecosystem)

</div>

---

## 📖 About

**CandyAdminJS** is the admin mobile app of the CandyApp platform. Store admins and super admins can manage products, orders, customers and notifications right from their phone. It connects to the [CandyApp Customer Backend](https://github.com/piyush22uk-cyber/candyapp-customer-backend) REST API.

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Role-based Login** | Separate login for admins and super admins |
| 📊 | **Dashboard** | Quick overview of the store |
| 🍭 | **Product Management** | Add, edit and delete products, with image picker |
| 📦 | **Order Management** | View orders and update their status |
| 👥 | **Customers** | View registered users |
| 🔔 | **Notifications** | Send and view notifications, plus new-order push alerts |
| 🛡️ | **Super Admin Tools** | Create and manage admin accounts |
| 🔑 | **Permission Control** | Grant or restrict admin access screen by screen |
| 🚫 | **Access Guard** | Restricted screens show a clear "no access" view |

## 🛠 Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | React Native 0.88, Expo SDK 58 |
| **Navigation** | React Navigation (Native Stack, Bottom Tabs) |
| **Networking** | Axios |
| **Storage** | AsyncStorage |
| **Media** | Expo Image Picker |
| **Notifications** | Expo Notifications |
| **UI** | Lucide Icons, React Native SVG, Reanimated |

## 📁 Project Structure

```
CandyAdminJS/
├── App.js / index.js        # Entry points
├── navigation/
│   ├── AdminNavigator.js    # Root navigation
│   └── AdminTabs.js         # Bottom tabs
├── screens/
│   ├── DashboardScreen.js
│   ├── ProductsScreen.js
│   ├── OrdersScreen.js
│   ├── CustomersScreen.js
│   ├── NotificationsScreen.js
│   ├── ManageAdminsScreen.js
│   ├── AdminPermissionsScreen.js
│   └── ...                  # Login, Account, About screens
├── components/
│   └── PermissionScreen.js  # Access guard
├── services/api.js          # Axios client
└── utils/notification.js    # Push notification helpers
```

## 🚀 Getting Started

### 📋 Prerequisites

- ✅ Node.js 18 or higher
- ✅ Android Studio / Xcode, or a development build on a physical device
- ✅ The [backend](https://github.com/piyush22uk-cyber/candyapp-customer-backend) up and running

### 📥 Installation

```bash
git clone https://github.com/piyush22uk-cyber/CandyAdminJS.git
cd CandyAdminJS
npm install
```

### 🔧 Configure the API URL

Open `services/api.js` and set your backend address:

```js
const API_BASE_URL = "http://<your-computer-ip>:2005/api";
```

> 💡 Use your computer's local network IP (not `localhost`) when testing on a real device.

### ▶️ Run the app

```bash
npx expo start
npx expo start --android
```

🔔 Push notifications need a **development build**:

```bash
eas build --profile development --platform android
```

## 🔗 CandyApp Ecosystem

| Project | Description |
|---|---|
| 📱 [CandyApp](https://github.com/piyush22uk-cyber/CandyApp) | Customer mobile app |
| 🧑‍💼 [CandyAdminJS](https://github.com/piyush22uk-cyber/CandyAdminJS) | Admin mobile app (this repo) |
| ⚙️ [candyapp-customer-backend](https://github.com/piyush22uk-cyber/candyapp-customer-backend) | REST API (Node.js, Express, MongoDB) |

## 👨‍💻 Author

**Piyush** • [@piyush22uk-cyber](https://github.com/piyush22uk-cyber)

<div align="center">

⭐ If you like this project, give it a star!

</div>
