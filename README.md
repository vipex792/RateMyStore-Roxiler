# 🏪 Store Rating Platform

A secure, responsive, and robust Full-Stack Store Rating application featuring role-based access control, detailed ratings management, custom form validations, and interactive admin/owner dashboards. 

This project was built to meet the specifications of the Full-Stack Intern Coding Challenge.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite, React Router DOM v7, Axios, React Icons, Context API)
- **Backend**: Node.js & Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **Validation**: express-validator (for route-level protection)
- **Mailing**: Nodemailer (simulated verification mails output to console and API responses for easy testing)

---

## 🌟 Key Features & Role-Based Access Control

The platform implements a unified login portal with separate, gated panels depending on the user's role:

### 1. 🛡️ System Administrator
- **Analytics Dashboard**: Real-time stats displaying:
  - Total number of registered users.
  - Total number of registered stores.
  - Total number of ratings submitted.
- **User Management**:
  - Add new users (Admins, Store Owners, or Customers) with server-side validation.
  - View user listings with advanced filters (Name, Email, Address, Role) and order sorting.
  - Drill down to user detail views (includes store rating performance metrics for Store Owners).
- **Store Management**: Create new stores and assign them to registered store owners.

### 2. 🏪 Store Owner
- **Performance Analytics**: Display the store's overall average rating and total rating count.
- **Feedback Table**: View a list of customers who have rated their store. 
  - Displays customer name, email, rating value, and timestamp.
  - Supports ascending/descending sorting for all fields.
- **Profile Security**: Change and update passwords after logging in.

### 3. 👤 Normal User (Customer)
- **Authentication**: Self-registration (Signup) and secure Login.
- **Store Directory**: Browse all registered stores, with filters to search by store name or address.
- **Interactive Rating System**: 
  - Submit ratings (from 1 to 5 stars).
  - View overall store rating alongside your own submitted rating.
  - Instantly modify or update your rating.
- **Security Check**: Request verification codes (OTP) via mail to securely change or reset password.

---

## 🔒 Form Validations & Security

Both the frontend forms and backend APIs enforce validation parameters:
- **Name**: Length must be between 20 and 60 characters.
- **Address**: Text up to 400 characters.
- **Email**: Must follow standard email validation rules.
- **Password**: 8-16 characters, must include at least one uppercase letter and one special character (e.g. `Admin@1234`).
- **Authorization**: API endpoints are secured using JSON Web Tokens (JWT) via headers: `Authorization: Bearer <token>`.

---

## 💻 Installation & Setup

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MySQL Server** (running locally on port `3306`)

### 2. Database Creation
Create a database named `store_rating_platform` in your MySQL database server:
```sql
CREATE DATABASE store_rating_platform;
