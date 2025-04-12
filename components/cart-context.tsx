"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getUserCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  type CartItem,
} from "@/lib/cart-service"
import { getLocalCart, clearLocalCart, migrateCartOnLogin } from "@/lib/cart-migration"

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  loading: boolean
  addItem: (item: CartItem) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearItems: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  items: [],
  total: 0,
  itemCount: 0,
  loading: true,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearItems: async () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Calcular el número total de items en el carrito
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Cargar el carrito cuando el usuario cambia
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)

      try {
        if (user) {
          // Usuario autenticado - cargar desde Firebase
          await migrateCartOnLogin(user.uid)
          const userCart = await getUserCart(user.uid)

          if (userCart) {
            setItems(userCart.items || [])
            setTotal(userCart.total || 0)
          } else {
            setItems([])
            setTotal(0)
          }
        } else {
          // Usuario no autenticado - cargar desde localStorage
          const localCart = getLocalCart()
          setItems(localCart)
          setTotal(localCart.reduce((sum, item) => sum + item.price * item.quantity, 0))
        }
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
        setItems([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Añadir un item al carrito
  const addItem = async (item: CartItem) => {
    try {
      if (user) {
        // Añadir a Firebase
        await addToCart(user.uid, item)

        // Actualizar estado local
        const userCart = await getUserCart(user.uid)
        if (userCart) {
          setItems(userCart.items || [])
          setTotal(userCart.total || 0)
        }
      } else {
        // Añadir a localStorage
        const localCart = getLocalCart()
        const existingItemIndex = localCart.findIndex((i) => i.productId === item.productId)

        if (existingItemIndex >= 0) {
          localCart[existingItemIndex].quantity += item.quantity
        } else {
          localCart.push(item)
        }

        localStorage.setItem("yfell_cart", JSON.stringify(localCart))

        // Actualizar estado local
        setItems(localCart)
        setTotal(localCart.reduce((sum, item) => sum + item.price * item.quantity, 0))
      }
    } catch (error) {
      console.error("Error al añadir item al carrito:", error)
    }
  }

  // Eliminar un item del carrito
  const removeItem = async (productId: string) => {
    try {
      if (user) {
        // Eliminar de Firebase
        await removeFromCart(user.uid, productId)

        // Actualizar estado local
        const userCart = await getUserCart(user.uid)
        if (userCart) {
          setItems(userCart.items || [])
          setTotal(userCart.total || 0)
        }
      } else {
        // Eliminar de localStorage
        const localCart = getLocalCart().filter((item) => item.productId !== productId)
        localStorage.setItem("yfell_cart", JSON.stringify(localCart))

        // Actualizar estado local
        setItems(localCart)
        setTotal(localCart.reduce((sum, item) => sum + item.price * item.quantity, 0))
      }
    } catch (error) {
      console.error("Error al eliminar item del carrito:", error)
    }
  }

  // Actualizar la cantidad de un item en el carrito
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId)
        return
      }

      if (user) {
        // Actualizar en Firebase
        await updateCartItemQuantity(user.uid, productId, quantity)

        // Actualizar estado local
        const userCart = await getUserCart(user.uid)
        if (userCart) {
          setItems(userCart.items || [])
          setTotal(userCart.total || 0)
        }
      } else {
        // Actualizar en localStorage
        const localCart = getLocalCart()
        const itemIndex = localCart.findIndex((item) => item.productId === productId)

        if (itemIndex >= 0) {
          localCart[itemIndex].quantity = quantity
          localStorage.setItem("yfell_cart", JSON.stringify(localCart))

          // Actualizar estado local
          setItems(localCart)
          setTotal(localCart.reduce((sum, item) => sum + item.price * item.quantity, 0))
        }
      }
    } catch (error) {
      console.error("Error al actualizar cantidad en el carrito:", error)
    }
  }

  // Vaciar el carrito
  const clearItems = async () => {
    try {
      if (user) {
        // Vaciar en Firebase
        await clearCart(user.uid)

        // Actualizar estado local
        setItems([])
        setTotal(0)
      } else {
        // Vaciar localStorage
        clearLocalCart()

        // Actualizar estado local
        setItems([])
        setTotal(0)
      }
    } catch (error) {
      console.error("Error al vaciar el carrito:", error)
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
