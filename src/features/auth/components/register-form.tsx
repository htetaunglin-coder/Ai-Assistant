"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Separator } from "@mijn-ui/react"
import { useForm } from "react-hook-form"
import { RegisterFormValues, registerFormSchema } from "@/lib/auth/schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { register } from "../api/action"

const RegisterForm = () => {
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: "", email: "", password: "" },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null)

    startTransition(async () => {
      try {
        await register(data)
        router.push("/chat")
      } catch (_) {
        setError("Failed to register. Please try again.")
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email..." disabled={loading} {...field} />
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
                  <Input type="password" placeholder="Choose a password..." disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <Button disabled={loading} variant="primary" className="w-full" type="submit">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </>
  )
}

export { RegisterForm }
