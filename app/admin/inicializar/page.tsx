"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { seedDatabase } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react"

export default function InicializarPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInitializeDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      await seedDatabase()
      setSuccess(true)

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al inicializar la base de datos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Inicializar Base de Datos</CardTitle>
          <CardDescription className="text-center">
            Crea usuarios y productos de prueba para comenzar a utilizar el panel de administración.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Base de datos inicializada</AlertTitle>
              <AlertDescription>
                Los datos de prueba se han creado correctamente. Serás redirigido al dashboard en unos segundos.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Se crearán los siguientes datos:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>3 usuarios (administradores y clientes)</li>
              <li>5 productos de diferentes categorías</li>
              <li>3 órdenes de compra de ejemplo</li>
            </ul>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium">Credenciales de administrador:</p>
            <p className="text-sm">Email: admin@yfell.com</p>
            <p className="text-sm">Contraseña: admin123</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleInitializeDatabase} disabled={loading || success} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completado
              </>
            ) : (
              "Inicializar Base de Datos"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
