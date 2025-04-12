import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDgfWATSHtW0cGqpv6aMRIr5t-23w1pEYs",
  authDomain: "yfell-f59ac.firebaseapp.com",
  projectId: "yfell-f59ac",
  storageBucket: "yfell-f59ac.appspot.com",
  messagingSenderId: "73696561528",
  appId: "1:73696561528:web:ea2db7b48a06f76bf0608d",
  measurementId: "G-HQF0N0522F",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
