import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore"

// Definición de tipos para el carrito
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Cart {
  userId: string
  items: CartItem[]
  total: number
  updatedAt: any
  createdAt: any
}

// Función para obtener el carrito de un usuario
export async function getUserCart(userId: string): Promise<Cart | null> {
  try {
    const cartDoc = await getDoc(doc(db, "carts", userId))

    if (cartDoc.exists()) {
      return cartDoc.data() as Cart
    }

    // Si no existe, crear un carrito vacío
    const newCart: Cart = {
      userId,
      items: [],
      total: 0,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }

    await setDoc(doc(db, "carts", userId), newCart)
    return newCart
  } catch (error) {
    console.error("Error al obtener el carrito:", error)
    return null
  }
}

// Función para añadir un producto al carrito
export async function addToCart(userId: string, item: CartItem): Promise<boolean> {
  try {
    const cartRef = doc(db, "carts", userId)
    const cartDoc = await getDoc(cartRef)

    if (!cartDoc.exists()) {
      // Crear un nuevo carrito si no existe
      const newCart: Cart = {
        userId,
        items: [item],
        total: item.price * item.quantity,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }
      await setDoc(cartRef, newCart)
    } else {
      // Verificar si el producto ya está en el carrito
      const cart = cartDoc.data() as Cart
      const existingItemIndex = cart.items.findIndex((i) => i.productId === item.productId)

      if (existingItemIndex >= 0) {
        // Actualizar cantidad si el producto ya está en el carrito
        const updatedItems = [...cart.items]
        updatedItems[existingItemIndex].quantity += item.quantity

        await updateDoc(cartRef, {
          items: updatedItems,
          total: cart.total + item.price * item.quantity,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Añadir nuevo producto al carrito
        await updateDoc(cartRef, {
          items: arrayUnion(item),
          total: cart.total + item.price * item.quantity,
          updatedAt: serverTimestamp(),
        })
      }
    }

    return true
  } catch (error) {
    console.error("Error al añadir al carrito:", error)
    return false
  }
}

// Función para actualizar la cantidad de un producto en el carrito
export async function updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
  try {
    const cartRef = doc(db, "carts", userId)
    const cartDoc = await getDoc(cartRef)

    if (!cartDoc.exists()) {
      return false
    }

    const cart = cartDoc.data() as Cart
    const itemIndex = cart.items.findIndex((item) => item.productId === productId)

    if (itemIndex === -1) {
      return false
    }

    const item = cart.items[itemIndex]
    const quantityDiff = quantity - item.quantity
    const priceDiff = item.price * quantityDiff

    // Actualizar la cantidad y recalcular el total
    const updatedItems = [...cart.items]
    updatedItems[itemIndex].quantity = quantity

    await updateDoc(cartRef, {
      items: updatedItems,
      total: cart.total + priceDiff,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error al actualizar cantidad:", error)
    return false
  }
}

// Función para eliminar un producto del carrito
export async function removeFromCart(userId: string, productId: string): Promise<boolean> {
  try {
    const cartRef = doc(db, "carts", userId)
    const cartDoc = await getDoc(cartRef)

    if (!cartDoc.exists()) {
      return false
    }

    const cart = cartDoc.data() as Cart
    const item = cart.items.find((item) => item.productId === productId)

    if (!item) {
      return false
    }

    const updatedItems = cart.items.filter((item) => item.productId !== productId)
    const newTotal = cart.total - item.price * item.quantity

    await updateDoc(cartRef, {
      items: updatedItems,
      total: newTotal,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error al eliminar del carrito:", error)
    return false
  }
}

// Función para vaciar el carrito
export async function clearCart(userId: string): Promise<boolean> {
  try {
    const cartRef = doc(db, "carts", userId)

    await updateDoc(cartRef, {
      items: [],
      total: 0,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error al vaciar el carrito:", error)
    return false
  }
}

// Función para migrar un carrito local a la base de datos
export async function migrateLocalCartToDatabase(userId: string, localCartItems: CartItem[]): Promise<boolean> {
  try {
    if (!localCartItems.length) {
      return true
    }

    const cartRef = doc(db, "carts", userId)
    const cartDoc = await getDoc(cartRef)

    if (!cartDoc.exists()) {
      // Crear un nuevo carrito con los items locales
      const total = localCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newCart: Cart = {
        userId,
        items: localCartItems,
        total,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }
      await setDoc(cartRef, newCart)
    } else {
      // Fusionar con el carrito existente
      const cart = cartDoc.data() as Cart
      const updatedItems = [...cart.items]
      let newTotal = cart.total

      // Procesar cada item del carrito local
      for (const localItem of localCartItems) {
        const existingItemIndex = updatedItems.findIndex((item) => item.productId === localItem.productId)

        if (existingItemIndex >= 0) {
          // Actualizar cantidad si el producto ya está en el carrito
          updatedItems[existingItemIndex].quantity += localItem.quantity
          newTotal += localItem.price * localItem.quantity
        } else {
          // Añadir nuevo producto al carrito
          updatedItems.push(localItem)
          newTotal += localItem.price * localItem.quantity
        }
      }

      await updateDoc(cartRef, {
        items: updatedItems,
        total: newTotal,
        updatedAt: serverTimestamp(),
      })
    }

    return true
  } catch (error) {
    console.error("Error al migrar el carrito local:", error)
    return false
  }
}

// Función para obtener todos los carritos activos (para análisis)
export async function getActiveCarts(): Promise<Cart[]> {
  try {
    const cartsQuery = query(collection(db, "carts"), where("items", "!=", []))
    const cartsSnapshot = await getDocs(cartsQuery)

    return cartsSnapshot.docs.map((doc) => doc.data() as Cart)
  } catch (error) {
    console.error("Error al obtener carritos activos:", error)
    return []
  }
}

// Función para obtener estadísticas de carritos abandonados
export async function getAbandonedCartStats(thresholdHours = 24): Promise<any> {
  try {
    const thresholdTime = new Date()
    thresholdTime.setHours(thresholdTime.getHours() - thresholdHours)

    const cartsQuery = query(collection(db, "carts"), where("items", "!=", []), where("updatedAt", "<", thresholdTime))

    const cartsSnapshot = await getDocs(cartsQuery)
    const abandonedCarts = cartsSnapshot.docs.map((doc) => doc.data() as Cart)

    // Calcular estadísticas
    const totalAbandoned = abandonedCarts.length
    const totalValue = abandonedCarts.reduce((sum, cart) => sum + cart.total, 0)
    const totalItems = abandonedCarts.reduce((sum, cart) => sum + cart.items.length, 0)

    return {
      totalAbandoned,
      totalValue,
      totalItems,
      carts: abandonedCarts,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas de carritos abandonados:", error)
    return {
      totalAbandoned: 0,
      totalValue: 0,
      totalItems: 0,
      carts: [],
    }
  }
}
