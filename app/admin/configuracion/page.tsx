"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save, User, Bell, Store } from "lucide-react"

export default function ConfiguracionPage() {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [storeSettings, setStoreSettings] = useState({
    storeName: "YFELL",
    storeDescription: "Tienda de productos exclusivos",
    lowStockThreshold: "10",
    currency: "ARS",
    enablePublicRegistration: true,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    newOrderNotifications: true,
    marketingEmails: false,
  })

  const [profileData, setProfileData] = useState({
    name: userData?.name || "",
    email: user?.email || "",
    phone: userData?.phone || "",
  })

  const handleStoreSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setStoreSettings({
      ...storeSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const saveProfileSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: profileData.name,
        phone: profileData.phone,
        updatedAt: new Date(),
      })

      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar tu perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveStoreSettings = async () => {
    setSaving(true)
    try {
      // En una implementación real, esto guardaría en una colección de configuración
      // Por ahora, solo simulamos el guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Configuración guardada",
        description: "La configuración de la tienda ha sido actualizada",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSaving(true)
    try {
      // En una implementación real, esto guardaría en una colección de configuración
      // Por ahora, solo simulamos el guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Preferencias guardadas",
        description: "Tus preferencias de notificación han sido actualizadas",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar las preferencias",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Tienda</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificaciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" value={profileData.email} disabled placeholder="tu@email.com" />
                <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Tu número de teléfono"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfileSettings} disabled={saving}>
                {saving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Tienda</CardTitle>
              <CardDescription>Personaliza la configuración general de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nombre de la tienda</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={storeSettings.storeName}
                  onChange={handleStoreSettingChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Descripción</Label>
                <Input
                  id="storeDescription"
                  name="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={handleStoreSettingChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Umbral de stock bajo</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="1"
                    value={storeSettings.lowStockThreshold}
                    onChange={handleStoreSettingChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={storeSettings.currency}
                    onChange={handleStoreSettingChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="enablePublicRegistration"
                  name="enablePublicRegistration"
                  checked={storeSettings.enablePublicRegistration}
                  onCheckedChange={(checked) =>
                    setStoreSettings({ ...storeSettings, enablePublicRegistration: checked })
                  }
                />
                <Label htmlFor="enablePublicRegistration">Permitir registro público de usuarios</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveStoreSettings} disabled={saving}>
                {saving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones importantes por correo electrónico
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="lowStockAlerts">Alertas de stock bajo</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas cuando el stock de un producto esté por debajo del umbral
                  </p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={notificationSettings.lowStockAlerts}
                  onCheckedChange={(checked) => handleSwitchChange("lowStockAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="newOrderNotifications">Nuevas órdenes</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones cuando se realice una nueva compra
                  </p>
                </div>
                <Switch
                  id="newOrderNotifications"
                  checked={notificationSettings.newOrderNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("newOrderNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails">Emails de marketing</Label>
                  <p className="text-sm text-muted-foreground">Recibe información sobre promociones y novedades</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} disabled={saving}>
                {saving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Preferencias
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
