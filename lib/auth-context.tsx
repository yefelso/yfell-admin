"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  userData: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        // Obtener datos adicionales del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          const userData = userDoc.data()
          setUserData(userData)

          // Verificar si el usuario tiene acceso a rutas de administrador
          if (pathname?.startsWith("/admin") && userData?.role !== "admin") {
            router.push("/login")
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error)
        }
      } else if (pathname?.startsWith("/admin")) {
        // Redirigir a login si no hay usuario autenticado
        router.push("/login")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
