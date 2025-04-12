"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function ReportesPage() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Obtener datos de ventas por mes
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const orders = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Agrupar ventas por mes
        const salesByMonth: Record<string, number> = {}
        orders.forEach((order) => {
          const date = order.createdAt?.toDate() || new Date()
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

          if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0
          }

          salesByMonth[monthYear] += order.total || 0
        })

        // Convertir a formato para gráfico
        const formattedSalesData = Object.entries(salesByMonth).map(([month, total]) => ({
          month,
          total,
        }))

        // Ordenar por mes
        formattedSalesData.sort((a, b) => {
          const [aMonth, aYear] = a.month.split("/")
          const [bMonth, bYear] = b.month.split("/")

          if (aYear !== bYear) {
            return Number.parseInt(aYear) - Number.parseInt(bYear)
          }

          return Number.parseInt(aMonth) - Number.parseInt(bMonth)
        })

        setSalesData(formattedSalesData)

        // Obtener productos más vendidos
        // Simulación de datos (en una app real, esto vendría de la base de datos)
        setTopProducts([
          { name: "Camiseta Premium", value: 120 },
          { name: "Zapatillas Runner", value: 85 },
          { name: "Reloj Inteligente", value: 65 },
          { name: "Auriculares Bluetooth", value: 45 },
          { name: "Mochila Urbana", value: 30 },
        ])

        // Obtener usuarios activos por mes
        // Simulación de datos (en una app real, esto vendría de la base de datos)
        setActiveUsers([
          { month: "1/2023", users: 45 },
          { month: "2/2023", users: 52 },
          { month: "3/2023", users: 68 },
          { month: "4/2023", users: 75 },
          { month: "5/2023", users: 92 },
          { month: "6/2023", users: 105 },
        ])
      } catch (error) {
        console.error("Error al cargar datos de reportes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`Total: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reportes y Gráficos</h1>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Ventas por Mes</CardTitle>
              <CardDescription>Total de ventas mensuales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="total" name="Ventas" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 5 productos con mayor número de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} unidades`, "Vendidos"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios Activos</CardTitle>
              <CardDescription>Evolución de usuarios activos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeUsers}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" name="Usuarios Activos" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
