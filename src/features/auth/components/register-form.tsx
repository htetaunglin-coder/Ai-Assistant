"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Separator } from "@mijn-ui/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { RegisterFormValues, authServer, registerFormSchema } from "@/lib/auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const RegisterForm = () => {
  const [loading, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: "", email: "", password: "" },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    startTransition(async () => {
      try {
        await authServer.register(data)
        toast.success("Registration successful!")
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
