# 🏎️ Just Diecast Minis

### *Some Dreams Belong on the Road. Others on Your Shelf.*

**Just Diecast Minis** is a full-stack e-commerce platform built for diecast model collectors, focused on 1:64 scale model cars and automotive collectibles.

The platform provides a complete shopping experience with product discovery, authentication, cart and wishlist management, online payments, order tracking, reviews, pre-orders, stock notifications, and an administrative management system.

> **Built as both a real-world e-commerce project and a portfolio demonstration of full-stack web development.**

---

## 🚗 Features

### 🛒 Customer Experience

* Browse and filter diecast models
* Dynamic product catalog
* Product details and image galleries
* Shopping cart
* Wishlist
* User registration and authentication
* Password reset functionality
* Order placement and order history
* Order details and tracking
* Product reviews and ratings
* Pre-order support
* Stock availability notifications
* Responsive design for desktop and mobile

### 💳 Payments & Checkout

* Razorpay payment integration
* Secure checkout flow
* Automatic order creation after successful payment
* Shipping calculation
* Free shipping threshold
* Order validation and stock handling

### 👨‍💼 Admin Dashboard

The custom admin dashboard provides controls for managing the store without directly modifying the database.

* Product management
* Product inventory and stock levels
* Product categories
* Scale management
* Manufacturer / brand management
* Product types
* Pre-orders
* Orders
* Order status management
* Customer reviews
* Announcements
* Store settings
* Stock notification management

### 📧 Automated Email System

Email automation is handled using **Brevo**.

The backend includes automated transactional and notification workflows for:

* Order-related emails
* Payment/order status communication
* Shipping and delivery updates
* Review request emails
* Stock availability notifications
* Password reset emails
* Email retry handling

A scheduled review-email service automatically identifies eligible delivered orders and sends customers review requests after the configured delivery period.

### 📦 Stock Notification System

Customers can request notifications for products that are currently unavailable.

A backend scheduler periodically checks inventory and identifies products that have returned to stock, allowing notification emails to be sent automatically.

### ⭐ Review System

* Customers can submit product reviews
* Review images are supported
* Review requests are sent automatically after eligible orders
* Token-based review access
* Admin review management

### 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* Protected API routes
* Admin authorization
* Password reset workflow
* Environment-based configuration for secrets and API credentials

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **Vite**
* **JavaScript (ES6+)**
* **React Router**
* **CSS**
* **Bootstrap**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**
* **REST APIs**

### Integrations

* **Razorpay** — payment processing
* **Brevo** — transactional and automated email delivery
* **Shiprocket** — shipping integration

### Development Tools

* Git
* GitHub
* npm
* ESLint
* Vite

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    │   React Frontend     │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Express / Node.js │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌───────────┐   ┌────────────┐
        │ MongoDB   │    │ Razorpay  │   │   Brevo    │
        │ Database  │    │ Payments  │   │   Email    │
        └───────────┘    └───────────┘   └────────────┘
                               │
                               ▼
                         ┌────────────┐
                         │ Shiprocket │
                         │  Shipping  │
                         └────────────┘
```

---

## 📂 Project Structure

```text
JustDiecastMinis/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── schedulers/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── seed.js
│   └── server.js
│
├── public/
│   └── images/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Core Backend Systems

The backend is structured around separate REST API routes and MongoDB models.

### API Areas

```text
/auth
/products
/orders
/preorders
/reviews
/interests
/announcement
/contact
/storeSettings
/user
/admin
```

This separation keeps product, authentication, order, review, and administrative functionality independently manageable.

---

## 📧 Brevo Email Automation

One of the major backend features is the automated email infrastructure.

The application uses scheduled backend services to perform tasks such as:

```text
Order placed
     │
     ▼
Order processing
     │
     ├── Payment confirmation
     │
     ├── Shipping updates
     │
     └── Delivery
            │
            ▼
     Review request scheduler
            │
            ▼
        Brevo email
```

The backend also includes retry handling for emails that fail to send, allowing transient email delivery failures to be handled without manually resending messages.

---

## 💰 Payment Flow

```text
Customer
   │
   ▼
Cart
   │
   ▼
Checkout
   │
   ▼
Razorpay
   │
   ▼
Payment Verification
   │
   ▼
Order Creation
   │
   ▼
MongoDB
```

Payment verification is handled on the backend before the order is finalized.

---

## 🚚 Shipping

The platform includes shipping integration through **Shiprocket**, allowing the backend to work with shipping and delivery workflows.

The checkout system also supports configurable domestic shipping rules, including free shipping above a specified order value.

---

## 🧑‍💻 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/MuhammadIbrahim9551/JustDiecastMinis.git
cd JustDiecastMinis
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create:

```text
.env.local
```

in the project root.

Example:

```env
VITE_API_URL=http://localhost:5000
```

Create:

```text
backend/.env
```

and configure the required backend variables for:

* MongoDB
* JWT
* Razorpay
* Brevo
* Shiprocket
* Frontend/backend URLs
* Other application secrets

> **Never commit environment files or API credentials to GitHub.**

### 5. Start the backend

```bash
cd backend
npm start
```

### 6. Start the frontend

Open another terminal:

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## 🔒 Environment Variables

Sensitive configuration is intentionally excluded from version control through `.gitignore`.

The repository ignores:

```text
.env
.env.local
.env.*.local
backend/.env
```

This keeps API keys, database credentials, authentication secrets, and third-party service credentials out of the public repository.

---

## 📸 Screenshots

Screenshots of the storefront, product pages, checkout, and admin dashboard can be added here.

```text
Coming soon
```

---

## 🎯 Project Highlights

This project demonstrates practical implementation of:

* Full-stack React development
* REST API design
* MongoDB data modeling
* Authentication and authorization
* Payment gateway integration
* E-commerce workflows
* Automated email systems
* Scheduled backend jobs
* Inventory management
* Review and notification systems
* Administrative dashboards
* Third-party API integration
* Responsive frontend development
* Environment and secret management

---

## 🔮 Future Improvements

Potential future additions include:

* Production deployment
* CDN-based image delivery
* Advanced analytics dashboard
* Improved product search
* Coupon and promotional systems
* Automated inventory synchronization
* Customer loyalty features
* International shipping support
* More advanced shipping-rate calculation

---

## 👨‍💻 Developer

**Muhammad Ibrahim**

Computer Science Engineering student and full-stack developer interested in software engineering, AI, and automotive technology.

### Built with ❤️ for diecast collectors and automotive enthusiasts.

---

## 📄 License

This project is currently intended primarily as a personal portfolio and demonstration project.

© 2026 Muhammad Ibrahim. All rights reserved.

This repository is published for portfolio and educational viewing purposes.
Unauthorized reproduction, redistribution, or commercial use of the source code
is not permitted without prior written permission.
