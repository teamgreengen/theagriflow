import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCMJSt067LBP9MLZ8D32IaWYpDNX5wJnAk",
  authDomain: "gen-lang-client-0802465196.firebaseapp.com",
  projectId: "gen-lang-client-0802465196",
  storageBucket: "gen-lang-client-0802465196.firebasestorage.app",
  messagingSenderId: "484092079276",
  appId: "1:484092079276:web:f1fed958d4f849e4868309"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let messaging = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
});
export { messaging };

export default app;