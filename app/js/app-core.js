/**
 * MICRO2MOVE SYDNEY - Core App Module
 *
 * Handles:
 * - Firebase initialization
 * - User authentication
 * - Firestore data sync
 * - Stripe payments
 * - Offline support
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
  user: null,
  isOnline: navigator.onLine,
  isPremium: false,
  userProfile: null,
  favorites: [],
  routeHistory: [],
  earnedBadges: [],
  totalPoints: 0,
  pendingSync: []
};

// ============================================
// FIREBASE INITIALIZATION
// ============================================
let auth = null;
let db = null;
let analytics = null;

async function initializeFirebase() {
  if (typeof firebaseConfig === 'undefined') {
    console.warn('Firebase config not found. Running in demo mode.');
    return false;
  }

  try {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed: multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence not supported');
        }
      });

    // Analytics (optional)
    if (firebase.analytics) {
      analytics = firebase.analytics();
    }

    // Listen for auth state changes
    auth.onAuthStateChanged(handleAuthStateChange);

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
}

// ============================================
// AUTHENTICATION
// ============================================
async function handleAuthStateChange(user) {
  if (user) {
    AppState.user = user;
    await loadUserProfile(user.uid);
    // Mark onboarding as complete
    localStorage.setItem('micro2move_onboarding_complete', 'true');
    hideOnboarding();
    showMainApp();
    syncUserData();
  } else {
    AppState.user = null;
    AppState.userProfile = null;
    // Only show onboarding if not already completed
    const hasCompletedOnboarding = localStorage.getItem('micro2move_onboarding_complete');
    if (!hasCompletedOnboarding) {
      showOnboarding();
    }
  }
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    showLoadingOverlay('Signing in...');
    await auth.signInWithPopup(provider);
    hideLoadingOverlay();
    showToast('Welcome to Micro2Move! 🚴');
  } catch (error) {
    hideLoadingOverlay();
    console.error('Google sign-in error:', error);
    showToast('Sign in failed. Please try again.');
  }
}

async function signInWithApple() {
  const provider = new firebase.auth.OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');

  try {
    showLoadingOverlay('Signing in...');
    await auth.signInWithPopup(provider);
    hideLoadingOverlay();
    showToast('Welcome to Micro2Move! 🚴');
  } catch (error) {
    hideLoadingOverlay();
    console.error('Apple sign-in error:', error);
    showToast('Sign in failed. Please try again.');
  }
}

async function signInWithEmail(email, password) {
  try {
    showLoadingOverlay('Signing in...');
    await auth.signInWithEmailAndPassword(email, password);
    hideLoadingOverlay();
  } catch (error) {
    hideLoadingOverlay();
    if (error.code === 'auth/user-not-found') {
      // Create new account
      await createAccountWithEmail(email, password);
    } else {
      showToast('Invalid email or password');
    }
  }
}

async function createAccountWithEmail(email, password) {
  try {
    showLoadingOverlay('Creating account...');
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await createUserProfile(result.user);
    hideLoadingOverlay();
    showToast('Account created! Welcome! 🎉');
  } catch (error) {
    hideLoadingOverlay();
    console.error('Account creation error:', error);
    showToast('Failed to create account');
  }
}

async function signOut() {
  try {
    await auth.signOut();
    AppState.user = null;
    AppState.userProfile = null;
    showToast('Signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

function continueAsGuest() {
  AppState.user = { isGuest: true, uid: 'guest_' + Date.now() };
  // Mark onboarding as complete
  localStorage.setItem('micro2move_onboarding_complete', 'true');
  hideOnboarding();
  showMainApp();
  showToast('Continuing as guest. Sign in to save progress!');
}

// ============================================
// USER PROFILE
// ============================================
async function createUserProfile(user) {
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Cyclist',
    photoURL: user.photoURL || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    // Cycling preferences
    preferences: {
      defaultBikeType: 'ebike',
      preferShade: false,
      preferScenic: false,
      preferSafe: true,
      preferFlat: false
    },
    // Stats
    stats: {
      totalPoints: 200, // Welcome bonus
      totalRides: 0,
      totalKm: 0,
      co2Saved: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0
    },
    // Progress
    completedModules: [],
    completedQuizzes: [],
    earnedBadges: ['first_ride'],
    favorites: [],
    // Subscription
    isPremium: false,
    premiumUntil: null,
    // Rewards
    redeemedRewards: [],
    availableDiscounts: []
  };

  await db.collection('users').doc(user.uid).set(profile);
  AppState.userProfile = profile;
  AppState.totalPoints = profile.stats.totalPoints;

  return profile;
}

async function loadUserProfile(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();

    if (doc.exists) {
      AppState.userProfile = doc.data();
      AppState.totalPoints = AppState.userProfile.stats?.totalPoints || 0;
      AppState.isPremium = AppState.userProfile.isPremium || false;
      AppState.favorites = AppState.userProfile.favorites || [];
      AppState.earnedBadges = AppState.userProfile.earnedBadges || [];

      // Update USER_PROGRESS for education module
      if (typeof USER_PROGRESS !== 'undefined') {
        USER_PROGRESS.total_points = AppState.totalPoints;
        USER_PROGRESS.completed_modules = AppState.userProfile.completedModules || [];
        USER_PROGRESS.completed_quizzes = AppState.userProfile.completedQuizzes || [];
        USER_PROGRESS.badges = AppState.earnedBadges;
        USER_PROGRESS.redeemed_rewards = AppState.userProfile.redeemedRewards || [];
      }

      // Update last active
      await db.collection('users').doc(uid).update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Profile doesn't exist, create it
      await createUserProfile(AppState.user);
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

async function updateUserProfile(updates) {
  if (!AppState.user || AppState.user.isGuest) {
    console.log('Guest user, storing locally');
    Object.assign(AppState.userProfile || {}, updates);
    return;
  }

  try {
    await db.collection('users').doc(AppState.user.uid).update(updates);
    Object.assign(AppState.userProfile, updates);
  } catch (error) {
    console.error('Error updating profile:', error);
    // Queue for later sync
    AppState.pendingSync.push({ type: 'profile', data: updates });
  }
}

// ============================================
// DATA SYNC
// ============================================
async function syncUserData() {
  if (!AppState.user || AppState.user.isGuest || !AppState.isOnline) return;

  try {
    // Sync pending changes
    for (const item of AppState.pendingSync) {
      if (item.type === 'profile') {
        await db.collection('users').doc(AppState.user.uid).update(item.data);
      } else if (item.type === 'favorite') {
        await updateUserProfile({
          favorites: firebase.firestore.FieldValue.arrayUnion(item.data)
        });
      } else if (item.type === 'points') {
        await db.collection('users').doc(AppState.user.uid).update({
          'stats.totalPoints': firebase.firestore.FieldValue.increment(item.data)
        });
      }
    }
    AppState.pendingSync = [];
  } catch (error) {
    console.error('Sync error:', error);
  }
}

async function addPoints(amount, reason) {
  AppState.totalPoints += amount;

  // Update local education progress
  if (typeof USER_PROGRESS !== 'undefined') {
    USER_PROGRESS.total_points = AppState.totalPoints;
  }

  if (AppState.user && !AppState.user.isGuest && AppState.isOnline) {
    await db.collection('users').doc(AppState.user.uid).update({
      'stats.totalPoints': firebase.firestore.FieldValue.increment(amount)
    });

    // Log points history
    await db.collection('users').doc(AppState.user.uid)
      .collection('pointsHistory').add({
        amount,
        reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
  } else {
    AppState.pendingSync.push({ type: 'points', data: amount });
  }

  updatePointsDisplay();
}

async function addFavorite(item) {
  if (!AppState.favorites.includes(item.id)) {
    AppState.favorites.push(item.id);

    if (AppState.user && !AppState.user.isGuest) {
      await updateUserProfile({
        favorites: firebase.firestore.FieldValue.arrayUnion(item.id)
      });
    }
  }
}

async function removeFavorite(itemId) {
  AppState.favorites = AppState.favorites.filter(id => id !== itemId);

  if (AppState.user && !AppState.user.isGuest) {
    await updateUserProfile({
      favorites: firebase.firestore.FieldValue.arrayRemove(itemId)
    });
  }
}

// ============================================
// STRIPE PAYMENTS
// ============================================
let stripe = null;

function initializeStripe() {
  if (typeof stripeConfig === 'undefined' || !stripeConfig.publishableKey) {
    console.warn('Stripe config not found');
    return;
  }

  stripe = Stripe(stripeConfig.publishableKey);
}

async function purchasePremium(priceId) {
  if (!stripe || !AppState.user || AppState.user.isGuest) {
    showToast('Please sign in to purchase');
    return;
  }

  try {
    showLoadingOverlay('Redirecting to checkout...');

    // Create checkout session via Cloud Function
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        userId: AppState.user.uid,
        email: AppState.user.email
      })
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      showToast(result.error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Payment failed. Please try again.');
  } finally {
    hideLoadingOverlay();
  }
}

async function redeemPointsForDiscount(rewardId, pointsCost) {
  if (AppState.totalPoints < pointsCost) {
    showToast('Not enough points!');
    return null;
  }

  try {
    // Deduct points
    await addPoints(-pointsCost, `Redeemed: ${rewardId}`);

    // Generate discount code
    const discountCode = generateDiscountCode(rewardId);

    // Save to user's discounts
    if (AppState.user && !AppState.user.isGuest) {
      await db.collection('users').doc(AppState.user.uid).update({
        availableDiscounts: firebase.firestore.FieldValue.arrayUnion({
          code: discountCode,
          rewardId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
          used: false
        }),
        redeemedRewards: firebase.firestore.FieldValue.arrayUnion(rewardId)
      });
    }

    showToast(`Discount code: ${discountCode}`);
    return discountCode;
  } catch (error) {
    console.error('Redeem error:', error);
    showToast('Failed to redeem. Please try again.');
    return null;
  }
}

function generateDiscountCode(rewardId) {
  const prefix = rewardId.includes('ebike') ? 'EBIKE' : 'M2M';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

// ============================================
// OFFLINE SUPPORT
// ============================================
function setupOfflineSupport() {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    AppState.isOnline = true;
    showToast('Back online! Syncing...');
    syncUserData();
  });

  window.addEventListener('offline', () => {
    AppState.isOnline = false;
    showToast('You\'re offline. Changes will sync when connected.');
  });
}

// ============================================
// SERVICE WORKER
// ============================================
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdatePrompt();
          }
        });
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

function showUpdatePrompt() {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-4 right-4 z-50 glass bg-primary/90 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between';
  toast.innerHTML = `
    <span>New version available!</span>
    <button onclick="updateApp()" class="px-4 py-2 bg-white text-primary font-bold rounded-xl">
      Update
    </button>
  `;
  document.body.appendChild(toast);
}

function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// ============================================
// UI HELPERS
// ============================================

// Onboarding Screen State
let splashAutoAdvanceTimer = null;
let splashShowing = false;

function showOnboarding() {
  // Prevent multiple calls from resetting the splash timer
  if (splashShowing) return;
  splashShowing = true;

  // Hide main app and other screens
  document.getElementById('mainApp')?.classList.add('hidden');
  document.getElementById('signInScreen')?.classList.add('hidden');
  document.getElementById('signUpScreen')?.classList.add('hidden');

  // Show splash screen
  document.getElementById('splashScreen')?.classList.remove('hidden');

  console.log('Showing splash screen for 3 seconds...');

  // Auto-advance from splash to sign-in after 3 seconds
  splashAutoAdvanceTimer = setTimeout(() => {
    console.log('Advancing to sign-in screen');
    showSignInScreen();
  }, 3000);
}

function hideOnboarding() {
  // Clear any pending timer
  if (splashAutoAdvanceTimer) {
    clearTimeout(splashAutoAdvanceTimer);
    splashAutoAdvanceTimer = null;
  }

  // Reset splash state
  splashShowing = false;

  document.getElementById('splashScreen')?.classList.add('hidden');
  document.getElementById('signInScreen')?.classList.add('hidden');
  document.getElementById('signUpScreen')?.classList.add('hidden');
  document.getElementById('termsModal')?.classList.add('hidden');
}

function showSignInScreen() {
  // Clear splash timer if tapped early
  if (splashAutoAdvanceTimer) {
    clearTimeout(splashAutoAdvanceTimer);
    splashAutoAdvanceTimer = null;
  }

  document.getElementById('splashScreen')?.classList.add('hidden');
  document.getElementById('signInScreen')?.classList.remove('hidden');
  document.getElementById('signUpScreen')?.classList.add('hidden');

  // Clear any previous errors
  clearSignInErrors();
}

function showSignUpScreen() {
  document.getElementById('splashScreen')?.classList.add('hidden');
  document.getElementById('signInScreen')?.classList.add('hidden');
  document.getElementById('signUpScreen')?.classList.remove('hidden');

  // Clear any previous errors
  clearSignUpErrors();
}

// ============================================
// SIGN IN FORM HANDLING
// ============================================
function clearSignInErrors() {
  document.getElementById('emailError')?.classList.add('hidden');
  document.getElementById('passwordError')?.classList.add('hidden');
}

function showSignInError(field, message) {
  const errorEl = document.getElementById(field + 'Error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

async function handleSignIn(event) {
  event.preventDefault();
  clearSignInErrors();

  const email = document.getElementById('signInEmail')?.value?.trim();
  const password = document.getElementById('signInPassword')?.value;

  // Validation
  let hasError = false;

  if (!email) {
    showSignInError('email', 'Email is required.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showSignInError('email', 'Invalid email/ Email does not exist.');
    hasError = true;
  }

  if (!password) {
    showSignInError('password', 'Password is required.');
    hasError = true;
  } else if (password.length < 6) {
    showSignInError('password', 'Incorrect password. Try again.');
    hasError = true;
  }

  if (hasError) return;

  // Attempt sign in
  try {
    showLoadingOverlay('Signing in...');
    await auth.signInWithEmailAndPassword(email, password);
    hideLoadingOverlay();
  } catch (error) {
    hideLoadingOverlay();
    console.error('Sign in error:', error);

    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
      showSignInError('email', 'Invalid email/ Email does not exist.');
    } else if (error.code === 'auth/wrong-password') {
      showSignInError('password', 'Incorrect password. Try again.');
    } else {
      showSignInError('password', 'Sign in failed. Try again.');
    }
  }
}

// ============================================
// SIGN UP FORM HANDLING
// ============================================
let uploadedGovId = null;
let uploadedSelfie = null;

function clearSignUpErrors() {
  ['nameError', 'dobError', 'signUpEmailError', 'signUpPasswordError', 'termsError', 'idVerificationError'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
}

function showSignUpError(field, message) {
  const errorEl = document.getElementById(field);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(dateStr) {
  // DD/MM/YYYY format
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

function calculateAge(dateStr) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return 0;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

async function handleSignUp(event) {
  event.preventDefault();
  clearSignUpErrors();

  const name = document.getElementById('signUpName')?.value?.trim();
  const dob = document.getElementById('signUpDob')?.value?.trim();
  const email = document.getElementById('signUpEmail')?.value?.trim();
  const password = document.getElementById('signUpPassword')?.value;
  const acceptedTerms = document.getElementById('acceptTerms')?.checked;

  // Validation
  let hasError = false;

  // Name validation
  if (!name || name.length < 2) {
    showSignUpError('nameError', 'Invalid name.');
    hasError = true;
  }

  // DOB validation
  if (!dob) {
    showSignUpError('dobError', 'Date of birth is required.');
    hasError = true;
  } else if (!isValidDate(dob)) {
    showSignUpError('dobError', 'Invalid date format.');
    hasError = true;
  } else if (calculateAge(dob) < 16) {
    showSignUpError('dobError', 'Age should be 16 years or more.');
    hasError = true;
  }

  // Email validation
  if (!email) {
    showSignUpError('signUpEmailError', 'Email is required.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showSignUpError('signUpEmailError', 'Invalid email.');
    hasError = true;
  }

  // Password validation
  if (!password) {
    showSignUpError('signUpPasswordError', 'Password is required.');
    hasError = true;
  } else if (password.length < 6) {
    showSignUpError('signUpPasswordError', 'Invalid password.');
    hasError = true;
  }

  // Terms validation
  if (!acceptedTerms) {
    showSignUpError('termsError', 'You must accept Terms & Conditions.');
    hasError = true;
  }

  // ID verification (optional for now - can be made required)
  // if (!uploadedGovId || !uploadedSelfie) {
  //   showSignUpError('idVerificationError', 'Please upload ID and selfie.');
  //   hasError = true;
  // }

  if (hasError) return;

  // Create account
  try {
    showLoadingOverlay('Creating account...');
    const result = await auth.createUserWithEmailAndPassword(email, password);

    // Update display name
    await result.user.updateProfile({ displayName: name });

    // Create user profile with additional info
    await createUserProfileWithDetails(result.user, {
      fullName: name,
      dateOfBirth: dob,
      govIdUploaded: !!uploadedGovId,
      selfieUploaded: !!uploadedSelfie
    });

    hideLoadingOverlay();
    showToast('Account created! Welcome!');
  } catch (error) {
    hideLoadingOverlay();
    console.error('Sign up error:', error);

    if (error.code === 'auth/email-already-in-use') {
      showSignUpError('signUpEmailError', 'Email already exists.');
    } else if (error.code === 'auth/weak-password') {
      showSignUpError('signUpPasswordError', 'Invalid password.');
    } else {
      showToast('Failed to create account. Please try again.');
    }
  }
}

async function createUserProfileWithDetails(user, details) {
  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: details.fullName || user.displayName || 'Cyclist',
    fullName: details.fullName,
    dateOfBirth: details.dateOfBirth,
    photoURL: user.photoURL || null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    // Verification status
    verification: {
      govIdUploaded: details.govIdUploaded || false,
      selfieUploaded: details.selfieUploaded || false,
      verified: false
    },
    // Cycling preferences
    preferences: {
      defaultBikeType: 'ebike',
      preferShade: false,
      preferScenic: false,
      preferSafe: true,
      preferFlat: false
    },
    // Stats
    stats: {
      totalPoints: 200, // Welcome bonus
      totalRides: 0,
      totalKm: 0,
      co2Saved: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0
    },
    // Progress
    completedModules: [],
    completedQuizzes: [],
    earnedBadges: ['first_ride'],
    favorites: [],
    // Subscription
    isPremium: false,
    premiumUntil: null,
    // Rewards
    redeemedRewards: [],
    availableDiscounts: []
  };

  if (db) {
    await db.collection('users').doc(user.uid).set(profile);
  }

  AppState.userProfile = profile;
  AppState.totalPoints = profile.stats.totalPoints;

  return profile;
}

// ============================================
// ID UPLOAD FUNCTIONS
// ============================================
function uploadGovernmentId() {
  // Create a file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadedGovId = file;
      document.getElementById('govIdStatus').textContent = 'Uploaded';
      document.getElementById('govIdIcon').innerHTML = '<span class="material-icons-round text-green-500">check_circle</span>';
      showToast('Government ID uploaded');
    }
  };
  input.click();
}

function takeSelfieWithId() {
  // Create a file input for camera
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'user'; // Front camera
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadedSelfie = file;
      document.getElementById('selfieStatus').textContent = 'Uploaded';
      document.getElementById('selfieIcon').innerHTML = '<span class="material-icons-round text-green-500">check_circle</span>';
      showToast('Selfie uploaded');
    }
  };
  input.click();
}

// ============================================
// TERMS & CONDITIONS
// ============================================
function showTermsModal() {
  document.getElementById('termsModal')?.classList.remove('hidden');
}

function hideTermsModal() {
  document.getElementById('termsModal')?.classList.add('hidden');
}

function acceptTermsAndClose() {
  document.getElementById('acceptTerms').checked = true;
  hideTermsModal();
}

function showFullTerms() {
  // Could open a full page or external link
  showToast('Full terms would open in a new page');
}

function showMainApp() {
  document.getElementById('mainApp')?.classList.remove('hidden');
}

function showLoadingOverlay(message = 'Loading...') {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'fixed inset-0 z-[100] bg-black/50 flex items-center justify-center';
    overlay.innerHTML = `
      <div class="glass bg-white/95 dark:bg-slate-900/95 p-6 rounded-2xl text-center">
        <div class="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4"></div>
        <p class="font-medium dark:text-white" id="loadingMessage">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('loadingMessage').textContent = message;
    overlay.classList.remove('hidden');
  }
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay')?.classList.add('hidden');
}

function updatePointsDisplay() {
  const pointsEls = document.querySelectorAll('[data-points-display]');
  pointsEls.forEach(el => {
    el.textContent = AppState.totalPoints.toLocaleString();
  });
}

// ============================================
// INITIALIZATION
// ============================================
async function initializeApp() {
  console.log('Initializing Micro2Move...');

  // Register service worker
  await registerServiceWorker();

  // Setup offline support
  setupOfflineSupport();

  // Initialize Firebase
  await initializeFirebase();

  // Initialize Stripe
  initializeStripe();

  // Check if user has completed onboarding before
  const hasCompletedOnboarding = localStorage.getItem('micro2move_onboarding_complete');

  if (hasCompletedOnboarding) {
    // Returning user - skip to main app
    hideOnboarding();
    showMainApp();
  } else {
    // New user - show onboarding (splash screen first)
    showOnboarding();
  }

  console.log('Micro2Move initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for use
window.AppState = AppState;
window.signInWithGoogle = signInWithGoogle;
window.signInWithApple = signInWithApple;
window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.continueAsGuest = continueAsGuest;
window.addPoints = addPoints;
window.addFavorite = addFavorite;
window.removeFavorite = removeFavorite;
window.purchasePremium = purchasePremium;
window.redeemPointsForDiscount = redeemPointsForDiscount;
// Onboarding screen navigation
window.showSignInScreen = showSignInScreen;
window.showSignUpScreen = showSignUpScreen;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.uploadGovernmentId = uploadGovernmentId;
window.takeSelfieWithId = takeSelfieWithId;
window.showTermsModal = showTermsModal;
window.hideTermsModal = hideTermsModal;
window.acceptTermsAndClose = acceptTermsAndClose;
window.showFullTerms = showFullTerms;
