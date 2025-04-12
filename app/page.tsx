import { redirect } from "next/navigation"

export default function Home() {
  // Redirigir a la página de inicio de sesión
  redirect("/login")
}
