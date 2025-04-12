"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { BarChart3, Box, Home, LogOut, Package, Settings, ShoppingBag, ShoppingCart, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userData } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col items-center justify-center py-4">
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">YFELL Admin</h1>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")} tooltip="Dashboard">
              <button onClick={() => router.push("/admin/dashboard")}>
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/productos")} tooltip="Productos">
              <button onClick={() => router.push("/admin/productos")}>
                <Package className="h-5 w-5" />
                <span>Productos</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/usuarios")} tooltip="Usuarios">
              <button onClick={() => router.push("/admin/usuarios")}>
                <Users className="h-5 w-5" />
                <span>Usuarios</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/compras")} tooltip="Compras">
              <button onClick={() => router.push("/admin/compras")}>
                <ShoppingCart className="h-5 w-5" />
                <span>Compras</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/carritos")} tooltip="Carritos">
              <button onClick={() => router.push("/admin/carritos")}>
                <ShoppingBag className="h-5 w-5" />
                <span>Carritos</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/stock")} tooltip="Stock">
              <button onClick={() => router.push("/admin/stock")}>
                <Box className="h-5 w-5" />
                <span>Stock</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/reportes")} tooltip="Reportes">
              <button onClick={() => router.push("/admin/reportes")}>
                <BarChart3 className="h-5 w-5" />
                <span>Reportes</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/configuracion")} tooltip="Configuración">
              <button onClick={() => router.push("/admin/configuracion")}>
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.photoURL || ""} />
              <AvatarFallback>{userData?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userData?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
