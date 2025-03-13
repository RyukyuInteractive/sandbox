/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as RoomIdImport } from "./../routes/$roomId"
import { Route as rootRoute } from "./../routes/__root"
import { Route as IndexImport } from "./../routes/index"
import { Route as SettingsImport } from "./../routes/settings"

// Create/Update Routes

const SettingsRoute = SettingsImport.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => rootRoute,
} as any)

const RoomIdRoute = RoomIdImport.update({
  id: "/$roomId",
  path: "/$roomId",
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    "/$roomId": {
      id: "/$roomId"
      path: "/$roomId"
      fullPath: "/$roomId"
      preLoaderRoute: typeof RoomIdImport
      parentRoute: typeof rootRoute
    }
    "/settings": {
      id: "/settings"
      path: "/settings"
      fullPath: "/settings"
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute
  "/$roomId": typeof RoomIdRoute
  "/settings": typeof SettingsRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute
  "/$roomId": typeof RoomIdRoute
  "/settings": typeof SettingsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexRoute
  "/$roomId": typeof RoomIdRoute
  "/settings": typeof SettingsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: "/" | "/$roomId" | "/settings"
  fileRoutesByTo: FileRoutesByTo
  to: "/" | "/$roomId" | "/settings"
  id: "__root__" | "/" | "/$roomId" | "/settings"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  RoomIdRoute: typeof RoomIdRoute
  SettingsRoute: typeof SettingsRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  RoomIdRoute: RoomIdRoute,
  SettingsRoute: SettingsRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/$roomId",
        "/settings"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/$roomId": {
      "filePath": "$roomId.tsx"
    },
    "/settings": {
      "filePath": "settings.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
