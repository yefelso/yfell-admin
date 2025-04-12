"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingBag, Database } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [databaseEmpty, setDatabaseEmpty] = useState(false)
  const [checkingDatabase, setCheckingDatabase] = useState(true)
  const router = useRouter()

  // Verificar si la base de datos está vacía
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Verificar si hay usuarios
        const usersQuery = query(collection(db, "users"), limit(1))
        const usersSnapshot = await getDocs(usersQuery)

        // Verificar si hay productos
        const productsQuery = query(collection(db, "products"), limit(1))
        const productsSnapshot = await getDocs(productsQuery)

        // Si ambas colecciones están vacías, la base de datos está vacía
        setDatabaseEmpty(usersSnapshot.empty && productsSnapshot.empty)
      } catch (error) {
        console.error("Error al verificar la base de datos:", error)
      } finally {
        setCheckingDatabase(false)
      }
    }

    checkDatabase()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Intentar iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Verificar si el usuario ya tiene un documento en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // Si no existe, significa que es el primer inicio de sesión
        // Crear un documento de usuario con rol de "admin"
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "admin", // Asignar rol de administrador por primera vez
          createdAt: new Date(),
        })
        // Redirigir a la página de administración
        router.push("/admin/dashboard")
      } else {
        // Si el documento ya existe, verificar el rol
        const userData = userDoc.data()
        if (userData?.role === "admin") {
          // Redirigir si es administrador
          router.push("/admin/dashboard")
        } else {
          // Cerrar sesión si no es administrador
          await auth.signOut()
          setError("No tienes permisos de administrador")
        }
      }
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingDatabase) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p>Verificando base de datos...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <ShoppingBag className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">YFELL Admin</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          {databaseEmpty && (
            <Alert className="mb-4">
              <Database className="h-4 w-4 mr-2" />
              <AlertDescription>
                La base de datos está vacía. Puedes{" "}
                <Link href="/admin/inicializar" className="font-medium underline">
                  inicializarla con datos de prueba
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">Panel exclusivo para administradores</p>
        </CardFooter>
      </Card>
    </div>
  )
}
