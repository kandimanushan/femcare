"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { translations } from "@/lib/translations"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof translations.title>("english")
  const [isNewUser, setIsNewUser] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("femcare-isLoggedIn")
    if (isLoggedIn === "true") {
      router.push("/dashboard")
    }

    // Load language preference
    const savedLanguage = localStorage.getItem("femcare-language") as keyof typeof translations.title
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isNewUser) {
      // Registration
      if (formData.password !== formData.confirmPassword) {
        setError(translations.auth[currentLanguage].passwordsDontMatch)
        return
      }

      if (formData.password.length < 6) {
        setError(translations.auth[currentLanguage].passwordTooShort)
        return
      }

      // Save user data
      localStorage.setItem("femcare-user-data", JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password, // In a real app, this should be hashed
      }))
      localStorage.setItem("femcare-isLoggedIn", "true")
      router.push("/dashboard")
    } else {
      // Login
      const savedUserData = localStorage.getItem("femcare-user-data")
      if (!savedUserData) {
        setError(translations.auth[currentLanguage].userNotFound)
        return
      }

      const userData = JSON.parse(savedUserData)
      if (userData.email !== formData.email || userData.password !== formData.password) {
        setError(translations.auth[currentLanguage].invalidCredentials)
        return
      }

      localStorage.setItem("femcare-isLoggedIn", "true")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isNewUser ? translations.auth[currentLanguage].createAccount : translations.auth[currentLanguage].login}
            </CardTitle>
            <CardDescription className="text-center">
              {isNewUser
                ? translations.auth[currentLanguage].createAccountDescription
                : translations.auth[currentLanguage].loginDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isNewUser && (
                <div className="space-y-2">
                  <Label htmlFor="name">{translations.auth[currentLanguage].name}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder={translations.auth[currentLanguage].enterName}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{translations.auth[currentLanguage].email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder={translations.auth[currentLanguage].enterEmail}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{translations.auth[currentLanguage].password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder={translations.auth[currentLanguage].enterPassword}
                />
              </div>
              {isNewUser && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{translations.auth[currentLanguage].confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder={translations.auth[currentLanguage].confirmPassword}
                  />
                </div>
              )}
              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}
              <Button type="submit" className="w-full">
                {isNewUser ? translations.auth[currentLanguage].createAccount : translations.auth[currentLanguage].login}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              onClick={() => {
                setIsNewUser(!isNewUser)
                setError("")
              }}
            >
              {isNewUser
                ? translations.auth[currentLanguage].alreadyHaveAccount
                : translations.auth[currentLanguage].needAccount}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 