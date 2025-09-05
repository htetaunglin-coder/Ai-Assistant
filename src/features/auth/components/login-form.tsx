"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Separator } from "@mijn-ui/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { LoginFormValues, authServer, loginFormSchema } from "@/lib/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const LoginForm = () => {
  const [loading, startTransition] = useTransition()
  const router = useRouter()

  const defaultValues = {
    username: "emilys",
    password: "emilyspass",
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginFormValues) => {
    startTransition(async () => {
      try {
        await authServer.login(data)
        toast.success("Login successful!")
        router.push("/chat")
      } catch (err: any) {
        toast.error(err.message || "Something went wrong.")
      }
    })
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username..." disabled={loading} {...field} />
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
