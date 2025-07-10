"use server";

import { AuthResponse } from "./types";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/auth";
import axiosServer from "@/lib/axios";
import { deleteCookie, setCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { LoginFormValues, RegisterFormValues } from "./schema";

export async function login(values: LoginFormValues) {
  try {
    const response = await axiosServer.post<AuthResponse>("/auth/login", {
      ...values,
    });

    const { accessToken, refreshToken } = response.data as AuthResponse;

    await setCookie(ACCESS_TOKEN, accessToken);
    await setCookie(REFRESH_TOKEN, refreshToken);
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Invalid credentials.",
    };
  }

  redirect("/dashboard");
}

export async function register(values: RegisterFormValues) {
  try {
    const response = await axiosServer.post<AuthResponse>("/auth/signin", {
      ...values,
    });

    const { accessToken, refreshToken } = response.data as AuthResponse;

    await setCookie(ACCESS_TOKEN, accessToken);
    await setCookie(REFRESH_TOKEN, refreshToken);
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Invalid credentials.",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  await deleteCookie(ACCESS_TOKEN);
  await deleteCookie(REFRESH_TOKEN);
}
