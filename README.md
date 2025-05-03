# 🎁 Gift Cards

A secure, privacy-first application for managing all your gift cards in one place.

The system ensures **zero server knowledge** by encrypting sensitive data on the client side. It supports logging in from any device using your email and Google, and sends notifications when cards are about to expire—so you never forget to use them.

You can also **search for a store name** to instantly see:
- Which gift cards you already own that are valid for that store
- Which suppliers offer new gift cards for that store

Built with:

- **Frontend**: React + TypeScript + Vite + TailwindCSS  
- **Backend**: Node.js + Express + TypeScript + MongoDB  
- **Authentication**: JWT + Google OAuth + Email login  
- **Notifications**: Email alerts for expiring cards  
- **Deployment**: Vercel-ready frontend & server-compatible backend

---

## 🌟 Features

### 🔐 Security & Access
- Zero server knowledge: card data is encrypted client-side
- Login using Google or email to sync across devices
- JWT-based session authentication with refresh tokens

### 💳 Gift Card Management
- Add, encrypt, and organize gift cards
- Attach expiration dates and get notified before they expire
- Upload and view supplier logos

### ☁️ Cloud Storage
- Images are stored via Cloudinary
- Supplier metadata and images managed easily

---

## 🚀 Installation

### Prerequisites

- Node.js v18+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account
- Email SMTP credentials (e.g., Gmail or service provider)
- Google Developer credentials

---

### 📁 Clone & Install

```bash
git clone https://github.com/omerg864/gift-cards.git
cd gift-cards

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## ⚙️ Environment Variables

### Server (`/server/.env`)

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/giftcards

JWT_SECRET=your_jwt_secret
JWT_SECRET_REFRESH=your_jwt_refresh_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_BASE_FOLDER=gift-cards

EMAIL_USERNAME=your_email_username
EMAIL_SERVICE=gmail
EMAIL_ADDRESS=your_email_address
EMAIL_PASSWORD=your_email_password

HOST_ADDRESS=http://localhost:5000
ADMIN_EMAIL=your_email_address
```

### Client (`/client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🧪 Running the App

### Start the server

```bash
cd server
npm run dev
```

### Start the client

```bash
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Project Structure

```
gift-cards/
├── client/        # React frontend (Vite)
│   └── src/
├── server/        # Express backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   └── utils/
```

---

## ✅ Deployment Notes

- Frontend is ready to deploy on **Vercel**
- Backend can be deployed using **Render**, **Railway**, or any Node-compatible service
- Ensure all `.env` variables are set in the hosting environments

---

## 🤝 Contributing

Fork the repository, create a new branch, and submit a pull request. All improvements are welcome.
