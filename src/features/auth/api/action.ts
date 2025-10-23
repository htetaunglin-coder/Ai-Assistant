"use server"

import { LoginFormValues, RegisterFormValues } from "@/lib/auth/schema"
import { authServerAPI } from "@/lib/auth/server"

export async function login(data: LoginFormValues) {
  return authServerAPI.login(data)
}

export async function register(data: RegisterFormValues) {
  return authServerAPI.register(data)
}

export async function logout() {
  return authServerAPI.logout()
}
