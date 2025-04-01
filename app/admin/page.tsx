"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ThemeProvider } from "@/components/theme-provider"
import AdminPanel from "@/components/admin-panel"
import AdminLogin from "@/components/admin-login"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("admin-authenticated") === "true"
    setAuthenticated(isAuth)
  }, [])

  const handleLogin = (password: string) => {
    if (password === "2122") {
      localStorage.setItem("admin-authenticated", "true")
      setAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    setAuthenticated(false)
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="femcare-theme">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        {authenticated ? (
          <AdminPanel onLogout={handleLogout} onBack={handleBack} />
        ) : (
          <AdminLogin onLogin={handleLogin} onBack={handleBack} />
        )}
      </motion.div>
    </ThemeProvider>
  )
}

