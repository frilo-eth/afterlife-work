'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Input, Button } from '@nextui-org/react'
import { Lock } from 'lucide-react'

function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background/95 backdrop-blur-xl">
      <Card className="w-full max-w-md mx-4 p-8 bg-background/20 backdrop-blur-sm border border-border">
        <div className="space-y-4 text-center mb-8">
          <span className="font-mono text-sm tracking-wider opacity-50 uppercase block">
            Admin Access
          </span>
          <h2 className="text-3xl font-bold">
            Enter Password
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={error}
            isInvalid={!!error}
            startContent={<Lock size={18} className="text-foreground-subtle" />}
            classNames={{
              label: "text-foreground-muted text-sm",
              input: "bg-transparent text-sm",
              inputWrapper: [
                "bg-background/20",
                "backdrop-blur-sm",
                "border border-border",
                "hover:border-border-strong",
                "px-3",
                "!rounded-lg",
              ]
            }}
          />
          <Button
            type="submit"
            className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-sm font-medium"
            isLoading={loading}
          >
            Login
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage 