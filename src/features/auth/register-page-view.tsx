import { Card } from "@mijn-ui/react"
import React from "react"
import { RegisterForm } from "./components/register-form"
import Link from "next/link"
import AuthLayout from "./components/auth-layout"

const RegisterPageView = () => {
  return (
    <AuthLayout>
      <Card className="flex aspect-video w-full max-w-md flex-col items-center justify-center p-4">
        <RegisterForm />
        <div className="mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <Link href={"/login"} className="text-blue-500 underline">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  )
}

export default RegisterPageView
