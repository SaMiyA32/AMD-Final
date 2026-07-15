# Crystal Clear - Premium Cleaning Services

Crystal Clear is a cross-platform mobile application developed using React Native Expo for booking and managing professional cleaning services. It provides a seamless experience for both customers (to book services) and administrators (to manage orders).

## Features

- **User Authentication**: Secure Login & Registration using Firebase Auth.
- **Role-Based Access**: Separate interfaces for Customers and Administrators.
- **Service Booking (CRUD)**:
  - **Create**: Book various cleaning services (House Cleaning, Office Cleaning, Deep Clean, etc.) with date and time pickers.
  - **Read**: View appointment history and statuses (Pending, Accepted, Rejected, Cancelled).
  - **Update**: Edit or reschedule pending appointments. Admins can update order statuses.
  - **Delete**: Cancel appointments with reasons.
- **Rating & Reviews System**: Customers can leave, edit, and delete ratings and reviews for completed services.
- **Email Notifications (Innovation)**: Integrated Node.js backend to send real-time automated emails to users when their order is Accepted, Rejected, or Cancelled (Powered by Brevo SMTP).
- **State Management**: Implemented using React Context API (`AuthContext`) for global state management of user sessions.
- **Navigation**: Uses Expo Router with both Tab Navigation (Main App) and Stack Navigation (Auth/Admin flows).

## Technologies Used

- **Frontend**: React Native, Expo, NativeWind (Tailwind CSS for styling).
- **Backend/Database**: Firebase Firestore (BaaS) and Node.js with Express for email server.
- **Authentication**: Firebase Authentication.
- **State Management**: React Context API.
- **Email Service**: Nodemailer & Brevo SMTP.

## Project Structure

- `/app` - Expo Router screens and navigation (Stack and Tabs).
- `/components` - Reusable UI components.
- `/context` - Global state management (`AuthContext`).
- `/services` - Firebase configuration and API services.
- `/email-server` - Node.js backend for sending email notifications.

## Setup & Run Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- Expo Go app installed on your physical mobile device (or an Android/iOS Emulator on your PC).

### 2. Install Dependencies
Navigate to the project root and install the required packages:
```bash
npm install
```

### 3. Configure Environment Variables (For Email Server)
Navigate to the `email-server` directory and create a `.env` file based on `.env.example`:
```bash
cd email-server
```
Create a `.env` file inside `email-server` and add your Brevo SMTP credentials:
```env
EMAIL_USER=your_brevo_smtp_login
EMAIL_PASS=your_brevo_smtp_password
SENDER_EMAIL=your_sender_email@gmail.com
```

### 4. Run the Application
You can start both the React Native Expo app and the Node.js Email Server simultaneously using the following command from the project root:
```bash
npm run dev
```
*(This command uses a custom script that launches the Node server in a new window and starts the Expo CLI interactively).*

### 5. Open on your Device
- **Android**: Scan the QR code from the terminal using the Expo Go app.
- **iOS**: Scan the QR code using the default Camera app.
- **Web**: Press `w` in the terminal to open the app in a web browser.

## Admin Access
To access the Admin Dashboard, log in using the designated admin credentials (configured via Firebase Auth).


