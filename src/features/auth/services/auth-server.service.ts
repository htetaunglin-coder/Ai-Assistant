import axiosServer from "@/lib/axios";
import { User } from "../types";

export const getMe = async (): Promise<User | null> => {
  try {
    const { data: user } = await axiosServer.get<User>("/auth/me");

    return user || null;
  } catch (error) {
    console.warn("Failed to fetch user profile:", error);
    return null;
  }
};
