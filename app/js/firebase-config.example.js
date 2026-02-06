/**
 * MICRO2MOVE SYDNEY - Firebase Configuration
 *
 * Copy this file to firebase-config.js and add your Firebase credentials
 *
 * Setup:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Add a web app to get your config
 * 4. Enable Authentication (Google, Apple, Email)
 * 5. Enable Firestore Database
 * 6. Copy credentials below
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};

// Stripe Configuration
const stripeConfig = {
  publishableKey: "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY",
  // Products/Prices (create these in Stripe Dashboard)
  prices: {
    premium_monthly: "price_xxxxxxxxxxxxx",
    premium_yearly: "price_xxxxxxxxxxxxx",
    ebike_discount_100: "price_xxxxxxxxxxxxx",
    ebike_discount_250: "price_xxxxxxxxxxxxx",
    ebike_discount_500: "price_xxxxxxxxxxxxx"
  }
};

// Export for use
window.firebaseConfig = firebaseConfig;
window.stripeConfig = stripeConfig;
