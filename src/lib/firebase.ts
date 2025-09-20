import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-3633278371-b85ab',
  appId: '1:171588518541:web:4495a414cabe17e8bc98c4',
  apiKey: 'AIzaSyD5VB4edntDJNTOaLGhArxzJPtfKtO8USs',
  authDomain: 'studio-3633278371-b85ab.firebaseapp.com',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
