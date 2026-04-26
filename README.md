# 🩺 Teryaq - Comprehensive Telehealth Ecosystem

**Teryaq** is a high-performance, scalable telehealth platform designed to bridge the gap between patients and healthcare providers. It offers secure video consultations, automated appointment scheduling, and a robust medical record management system. Built with **Clean Architecture** principles, the project prioritizes maintainability, security, and developer experience.

---

## 🚀 Key Features

- **Secure Authentication:** Full JWT-based auth flow including account activation via email, password reset (SMTP), and role-based access control (RBAC).
- **Intelligent Appointments:** Advanced scheduling logic with **Slot Locking** to prevent race conditions and automated expiry for pending sessions.
- **Telehealth Video Suite:** Real-time, secure signaling server for video consultations using **Socket.io** and JWT validation.
- **Medical Record System:** Comprehensive clinical history management supporting multi-format attachments (Images/PDFs) with automated processing via **Sharp** and **Cloudinary**.
- **Stripe Payment Integration:** Secure checkout flow for bookings with automated status updates and refund logic.
- **Advanced Search & Filtering:** Global doctor discovery system with verification filters and specialization-based indexing.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js with **TypeScript** for type safety.
- **Framework:** Express.js.
- **Database:** MongoDB with **Mongoose** (utilizing Transactions for data integrity).
- **Real-time:** Socket.io (WebRTC signaling).
- **Media Management:** Cloudinary (Storage) & Sharp (Image Optimization).
- **Security:** Helmet, CORS, Express-Rate-Limit, and **Zod** for schema validation.
- **DevOps:** Git, Conventional Commits, and Clean Architecture folder structuring.

---

## ⚙️ Installation & Setup

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/MohammedYazji/Teryaq-Healthcare-System.git
    ```
2.  **Install Dependencies:**
    ```bash
    cd apps/api
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file from the provided `.env.example` and fill in your credentials:
    - `PORT`, `MONGO_URI`, `JWT_SECRET`
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
    - `STRIPE_SECRET_KEY`, `GMAIL_USER`, `GMAIL_PASS`
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 📖 API Documentation

The entire API is documented and published via **Postman**.

👉 **[View Postman API Documentation](https://documenter.getpostman.com/view/40776591/2sBXqGqgkF)**
