import axios, { InternalAxiosRequestConfig } from "axios";

const isClient = typeof window !== undefined;

const api = axios.create({
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;

let failedRequestsQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedRequestsQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    if (!isClient) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookiesString = cookieStore
        .getAll()
        .map((item) => `${item.name}=${item.value}`)
        .join("; ");

      config.headers.cookie = cookiesString;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (isClient && error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/api/auth/refresh");
        processQueue(null);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        if (isClient) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
