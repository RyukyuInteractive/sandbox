import { createStorage as originalCreateStorage } from "unstorage"
import localStorageDriver from "unstorage/drivers/localstorage"

export const createStorage = (base: string) =>
  originalCreateStorage({
    driver: localStorageDriver({
      base,
    }),
  })
