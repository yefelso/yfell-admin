"use client"

import { useEffect, useState } from "react"
import { getActiveCarts, getAbandonedCartStats, type Cart } from "@/lib/cart-service"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, AlertTriangle, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CarritosPage() {
  const [activeCarts, setActiveCarts] = useState<Cart[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<any>({
    totalAbandoned: 0,
    totalValue: 0,
    totalItems: 0,
    carts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCartsData = async () => {
      try {
        const active = await getActiveCarts()
        const abandoned = await getAbandonedCartStats(24) // Carritos abandonados por más de 24 horas

        setActiveCarts(active)
        setAbandonedCarts(abandoned)
      } catch (error) {
        console.error("Error al cargar datos de carritos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCartsData()
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Convertir timestamp de Firestore a Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Carritos</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Carritos Activos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCarts.length}</div>
            <p className="text-xs text-muted-foreground">Carritos con productos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Carritos Abandonados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonedCarts.totalAbandoned}</div>
            <p className="text-xs text-muted-foreground">Sin actividad por más de 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activeCarts.reduce((sum, cart) => sum + (cart.total || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Productos en carritos activos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Carritos Activos</span>
          </TabsTrigger>
          <TabsTrigger value="abandoned" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Carritos Abandonados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Carritos Activos</CardTitle>
              <CardDescription>Carritos con productos pendientes de compra</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <p>Cargando carritos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Última Actualización</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCarts.length > 0 ? (
                      activeCarts.map((cart) => (
                        <TableRow key={cart.userId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{cart.userId.substring(0, 8)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cart.items.length} productos</TableCell>
                          <TableCell>{formatCurrency(cart.total || 0)}</TableCell>
                          <TableCell>{formatDate(cart.updatedAt)}</TableCell>
                          <TableCell>
                            <Badge variant="default">Activo</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No hay carritos activos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Carritos Abandonados</CardTitle>
              <CardDescription>Carritos sin actividad por más de 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <p>Cargando carritos abandonados...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Productos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Última Actualización</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abandonedCarts.carts.length > 0 ? (
                      abandonedCarts.carts.map((cart: Cart) => (
                        <TableRow key={cart.userId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{cart.userId.substring(0, 8)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cart.items.length} productos</TableCell>
                          <TableCell>{formatCurrency(cart.total || 0)}</TableCell>
                          <TableCell>{formatDate(cart.updatedAt)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Enviar Recordatorio
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No hay carritos abandonados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
