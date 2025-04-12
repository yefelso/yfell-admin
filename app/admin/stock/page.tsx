"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Search, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function StockPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [newStock, setNewStock] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"))
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Ordenar productos por stock (de menor a mayor)
        productsData.sort((a, b) => (a.stock || 0) - (b.stock || 0))

        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const handleUpdateStock = async () => {
    if (!editingProduct) return

    try {
      await updateDoc(doc(db, "products", editingProduct.id), {
        stock: newStock,
      })

      // Actualizar estado local
      const updatedProducts = products.map((product) =>
        product.id === editingProduct.id ? { ...product, stock: newStock } : product,
      )

      // Ordenar productos por stock (de menor a mayor)
      updatedProducts.sort((a, b) => (a.stock || 0) - (b.stock || 0))

      setProducts(updatedProducts)
      setFilteredProducts(
        updatedProducts.filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )

      toast({
        title: "Stock actualizado",
        description: `El stock de ${editingProduct.name} ha sido actualizado a ${newStock} unidades`,
      })
    } catch (error) {
      console.error("Error al actualizar stock:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el stock",
        variant: "destructive",
      })
    } finally {
      setEditingProduct(null)
    }
  }

  const lowStockCount = products.filter((product) => (product.stock || 0) < 10).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Control de Stock</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Productos con menos de 10 unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Promedio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0
                ? Math.round(products.reduce((acc, product) => acc + (product.stock || 0), 0) / products.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Unidades por producto</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <p>Cargando productos...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock || 0} unidades</TableCell>
                    <TableCell>
                      <Badge variant={(product.stock || 0) > 10 ? "default" : "destructive"}>
                        {(product.stock || 0) > 10 ? "Disponible" : "Stock bajo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product)
                          setNewStock(product.stock || 0)
                        }}
                      >
                        Actualizar Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Stock</DialogTitle>
            <DialogDescription>Actualiza el stock del producto {editingProduct?.name}</DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {editingProduct.imageUrl ? (
                    <img
                      src={editingProduct.imageUrl || "/placeholder.svg"}
                      alt={editingProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{editingProduct.name}</p>
                  <p className="text-sm text-muted-foreground">{editingProduct.category}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock actual: {editingProduct.stock || 0} unidades</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(Number.parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStock}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
