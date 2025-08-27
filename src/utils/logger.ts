import pino from "pino"

const isDev = process.env.NODE_ENV === "development"

export const logger = pino({
  level: isDev ? "debug" : "warn",
  browser: { asObject: true },

  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
      },
    },
  }),
})
