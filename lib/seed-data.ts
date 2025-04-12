import { collection, getDocs, addDoc, query, limit, setDoc, doc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"

// Añadir importación para el servicio de carrito
import { addToCart } from "@/lib/cart-service"

// Función para verificar si ya existen datos en la colección
const collectionHasData = async (collectionName: string): Promise<boolean> => {
  const q = query(collection(db, collectionName), limit(1))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

// Datos de prueba para usuarios
const sampleUsers = [
  {
    email: "admin@yfell.com",
    password: "admin123",
    name: "Administrador Principal",
    role: "admin",
  },
  {
    email: "cliente1@ejemplo.com",
    password: "cliente123",
    name: "Cliente Ejemplo",
    role: "cliente",
  },
  {
    email: "vendedor@yfell.com",
    password: "vendedor123",
    name: "Vendedor YFELL",
    role: "admin",
  },
]

// Datos de prueba para productos
const sampleProducts = [
  {
    name: "Camiseta Premium",
    description: "Camiseta de algodón 100% de alta calidad con diseño exclusivo.",
    price: 5999.99,
    stock: 25,
    category: "ropa",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Zapatillas Runner",
    description: "Zapatillas deportivas ideales para running con amortiguación avanzada.",
    price: 15999.99,
    stock: 12,
    category: "calzado",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Reloj Inteligente",
    description: "Smartwatch con monitoreo de actividad física, notificaciones y más.",
    price: 24999.99,
    stock: 8,
    category: "electronica",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Mochila Urbana",
    description: "Mochila resistente al agua con compartimentos para laptop y accesorios.",
    price: 8999.99,
    stock: 18,
    category: "accesorios",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    name: "Auriculares Bluetooth",
    description: "Auriculares inalámbricos con cancelación de ruido y gran autonomía.",
    price: 12999.99,
    stock: 5,
    category: "electronica",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
]

// Datos de prueba para órdenes
const sampleOrders = [
  {
    customerName: "Juan Pérez",
    customerEmail: "juan@ejemplo.com",
    items: [
      { productId: "1", name: "Camiseta Premium", price: 5999.99, quantity: 2 },
      { productId: "3", name: "Reloj Inteligente", price: 24999.99, quantity: 1 },
    ],
    total: 36999.97,
    status: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
  },
  {
    customerName: "María González",
    customerEmail: "maria@ejemplo.com",
    items: [{ productId: "2", name: "Zapatillas Runner", price: 15999.99, quantity: 1 }],
    total: 15999.99,
    status: "processing",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
  },
  {
    customerName: "Carlos Rodríguez",
    customerEmail: "carlos@ejemplo.com",
    items: [
      { productId: "4", name: "Mochila Urbana", price: 8999.99, quantity: 1 },
      { productId: "5", name: "Auriculares Bluetooth", price: 12999.99, quantity: 1 },
    ],
    total: 21999.98,
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
  },
]

// Función para crear usuarios de prueba
const seedUsers = async (): Promise<void> => {
  try {
    for (const user of sampleUsers) {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password)
      const uid = userCredential.user.uid

      // Crear documento de usuario en Firestore
      await setDoc(doc(db, "users", uid), {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date(),
      })

      console.log(`Usuario creado: ${user.email}`)
    }
  } catch (error) {
    console.error("Error al crear usuarios de prueba:", error)
  }
}

// Función para crear productos de prueba
const seedProducts = async (): Promise<void> => {
  try {
    for (const product of sampleProducts) {
      // Crear documento de producto en Firestore
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
      })
    }
    console.log("Productos de prueba creados")
  } catch (error) {
    console.error("Error al crear productos de prueba:", error)
  }
}

// Función para crear órdenes de prueba
const seedOrders = async (): Promise<void> => {
  try {
    for (const order of sampleOrders) {
      // Crear documento de orden en Firestore
      await addDoc(collection(db, "orders"), order)
    }
    console.log("Órdenes de prueba creadas")
  } catch (error) {
    console.error("Error al crear órdenes de prueba:", error)
  }
}

// Añadir después de la función seedOrders
// Función para crear carritos de prueba
const seedCarts = async (): Promise<void> => {
  try {
    // Crear algunos carritos de ejemplo
    const cartItems = [
      {
        userId: "usuario1", // Este ID debería coincidir con un ID de usuario real
        items: [
          {
            productId: "1",
            name: "Camiseta Premium",
            price: 5999.99,
            quantity: 2,
            imageUrl: "/placeholder.svg?height=200&width=200",
          },
        ],
      },
      {
        userId: "usuario2", // Este ID debería coincidir con un ID de usuario real
        items: [
          {
            productId: "2",
            name: "Zapatillas Runner",
            price: 15999.99,
            quantity: 1,
            imageUrl: "/placeholder.svg?height=200&width=200",
          },
          {
            productId: "5",
            name: "Auriculares Bluetooth",
            price: 12999.99,
            quantity: 1,
            imageUrl: "/placeholder.svg?height=200&width=200",
          },
        ],
      },
    ]

    // Añadir los carritos a la base de datos
    for (const cart of cartItems) {
      for (const item of cart.items) {
        await addToCart(cart.userId, item)
      }
      console.log(`Carrito creado para el usuario: ${cart.userId}`)
    }

    console.log("Carritos de prueba creados")
  } catch (error) {
    console.error("Error al crear carritos de prueba:", error)
  }
}

// Modificar la función seedDatabase para incluir la inicialización de carritos
export const seedDatabase = async (): Promise<void> => {
  try {
    // Verificar si ya existen datos
    const hasUsers = await collectionHasData("users")
    const hasProducts = await collectionHasData("products")
    const hasOrders = await collectionHasData("orders")
    const hasCarts = await collectionHasData("carts")

    // Crear datos solo si no existen
    if (!hasUsers) {
      await seedUsers()
    } else {
      console.log("Ya existen usuarios en la base de datos")
    }

    if (!hasProducts) {
      await seedProducts()
    } else {
      console.log("Ya existen productos en la base de datos")
    }

    if (!hasOrders) {
      await seedOrders()
    } else {
      console.log("Ya existen órdenes en la base de datos")
    }

    if (!hasCarts) {
      await seedCarts()
    } else {
      console.log("Ya existen carritos en la base de datos")
    }

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  }
}
