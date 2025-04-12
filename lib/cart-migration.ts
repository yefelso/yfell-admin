import { getUserCart, migrateLocalCartToDatabase, type CartItem } from "@/lib/cart-service"

// Clave para el carrito en localStorage
const LOCAL_CART_KEY = "yfell_cart"

// Función para obtener el carrito del localStorage
export function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const cartData = localStorage.getItem(LOCAL_CART_KEY)
    return cartData ? JSON.parse(cartData) : []
  } catch (error) {
    console.error("Error al obtener carrito local:", error)
    return []
  }
}

// Función para limpiar el carrito del localStorage
export function clearLocalCart(): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.removeItem(LOCAL_CART_KEY)
  } catch (error) {
    console.error("Error al limpiar carrito local:", error)
  }
}

// Función para migrar el carrito cuando el usuario inicia sesión
export async function migrateCartOnLogin(userId: string): Promise<void> {
  try {
    // Obtener carrito local
    const localCart = getLocalCart()

    if (localCart.length > 0) {
      // Migrar carrito local a la base de datos
      const success = await migrateLocalCartToDatabase(userId, localCart)

      if (success) {
        // Limpiar carrito local después de migrar
        clearLocalCart()
        console.log("Carrito migrado exitosamente a la base de datos")
      }
    }

    // Obtener el carrito actualizado del usuario
    await getUserCart(userId)
  } catch (error) {
    console.error("Error en la migración del carrito:", error)
  }
}
