"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function ProductoDetallePage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", params.id))

        if (productDoc.exists()) {
          setProduct({
            id: productDoc.id,
            ...productDoc.data(),
          })
        } else {
          toast({
            title: "Producto no encontrado",
            description: "El producto que buscas no existe",
            variant: "destructive",
          })
          router.push("/admin/productos")
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el producto",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, router, toast])

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", params.id))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      })
      router.push("/admin/productos")
    } catch (error) {
      console.error("Error al eliminar el producto:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el producto",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Cargando detalles del producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="mt-4 text-center">
          <p>Producto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold ml-4">Detalles del Producto</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/productos/editar/${params.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="aspect-square rounded-md bg-muted flex items-center justify-center overflow-hidden mb-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-24 w-24 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Badge className="mb-2">{product.category}</Badge>
              <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                {product.stock > 10 ? "Disponible" : "Stock bajo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <CardDescription>ID: {params.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Descripción</h3>
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Precio</h3>
                <p className="text-xl font-bold">{formatCurrency(product.price || 0)}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Stock</h3>
                <p className="text-xl font-bold">{product.stock} unidades</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Categoría</h3>
              <p className="capitalize">{product.category}</p>
            </div>

            {product.createdAt && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Fecha de creación</h3>
                <p>{new Date(product.createdAt.seconds * 1000).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
