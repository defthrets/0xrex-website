// 0xrex Authentication Logic
import { auth } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// If already logged in, redirect to portal
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('0xrex_logged_in', 'true');
    window.location.href = 'portal.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabs = document.querySelectorAll('.auth-tab');
  const msgEl = document.getElementById('authMessage');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'login') {
        loginForm.style.display = '';
        signupForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        signupForm.style.display = '';
      }
      msgEl.textContent = '';
      msgEl.className = 'auth-message';
    });
  });

  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className = 'auth-message ' + type;
  }

  function mapError(code) {
    var msgs = {
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return msgs[code] || 'An error occurred. Please try again.';
  }

  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;
    var pass = document.getElementById('loginPassword').value;
    showMsg('Authenticating...', '');
    signInWithEmailAndPassword(auth, email, pass)
      .then(() => {
        localStorage.setItem('0xrex_logged_in', 'true');
        window.location.href = 'portal.html';
      })
      .catch((err) => showMsg(mapError(err.code), 'error'));
  });

  // Signup
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    var email = document.getElementById('signupEmail').value;
    var pass = document.getElementById('signupPassword').value;
    var confirm = document.getElementById('signupConfirm').value;
    if (pass !== confirm) {
      showMsg('Passwords do not match.', 'error');
      return;
    }
    showMsg('Creating account...', '');
    createUserWithEmailAndPassword(auth, email, pass)
      .then(() => {
        localStorage.setItem('0xrex_logged_in', 'true');
        window.location.href = 'portal.html';
      })
      .catch((err) => showMsg(mapError(err.code), 'error'));
  });

  // Forgot password
  document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;
    if (!email) {
      showMsg('Enter your email above first.', 'error');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => showMsg('Password reset email sent.', 'success'))
      .catch((err) => showMsg(mapError(err.code), 'error'));
  });

  // Google sign-in
  document.getElementById('googleSignIn').addEventListener('click', () => {
    var provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        localStorage.setItem('0xrex_logged_in', 'true');
        window.location.href = 'portal.html';
      })
      .catch((err) => showMsg(mapError(err.code), 'error'));
  });
});
