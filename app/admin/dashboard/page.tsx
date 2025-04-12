"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Box, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Obtener total de productos
        const productsSnapshot = await getDocs(collection(db, "products"))
        const totalProducts = productsSnapshot.size

        // Contar productos con stock bajo
        const lowStockQuery = query(collection(db, "products"), where("stock", "<", 10))
        const lowStockSnapshot = await getDocs(lowStockQuery)
        const lowStockProducts = lowStockSnapshot.size

        // Obtener total de usuarios
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Obtener total de ventas y monto
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const totalSales = ordersSnapshot.size
        let totalRevenue = 0

        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data()
          totalRevenue += orderData.total || 0
        })

        // Obtener órdenes recientes
        const recentOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
        const recentOrdersData = recentOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setStats({
          totalProducts,
          totalUsers,
          totalSales,
          totalRevenue,
          lowStockProducts,
        })

        setRecentOrders(recentOrdersData)
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockProducts} productos con stock bajo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Órdenes procesadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Ingresos por ventas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Últimas Compras</CardTitle>
            <CardDescription>Las 5 compras más recientes en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{order.customerName || "Cliente"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "processing"
                                  ? "secondary"
                                  : order.status === "pending"
                                    ? "outline"
                                    : "destructive"
                            }
                          >
                            {order.status || "pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total || 0)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No hay compras recientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
            <CardDescription>Productos que necesitan reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center text-center">
                <Box className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-2xl font-bold">{stats.lowStockProducts}</h3>
                <p className="text-sm text-muted-foreground">Productos con menos de 10 unidades en stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Rápido</CardTitle>
            <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Package className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Gestionar Productos</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Gestionar Usuarios</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Ver Compras</h3>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Ver Reportes</h3>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
