"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Separator } from "@mijn-ui/react"
import { useForm } from "react-hook-form"
import { LoginFormValues, authServer, loginFormSchema } from "@/lib/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const LoginForm = () => {
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const defaultValues = {
    email: process.env.NODE_ENV === "development" ? "admin@example.com" : "",
    password: process.env.NODE_ENV === "development" ? "password" : "",
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)

    startTransition(async () => {
      try {
        await authServer.login(data)
        router.push("/chat")
      } catch (err: any) {
        setError(err.message || "Something went wrong.")
      }
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
          {error && <div className="mb-1 text-center text-sm text-danger-emphasis">{error}</div>}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <Button disabled={loading} variant="primary" className="w-full" type="submit">
            {loading ? "Signing In..." : "Login"}
          </Button>
        </form>
      </Form>
    </>
  )
}

export { LoginForm }
