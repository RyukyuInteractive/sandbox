/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./../routes/__root"
import { Route as IndexImport } from "./../routes/index"
import { Route as ProjectsProjectImport } from "./../routes/projects.$project"

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any)

const ProjectsProjectRoute = ProjectsProjectImport.update({
  id: "/projects/$project",
  path: "/projects/$project",
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
    "/projects/$project": {
      id: "/projects/$project"
      path: "/projects/$project"
      fullPath: "/projects/$project"
      preLoaderRoute: typeof ProjectsProjectImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute
  "/projects/$project": typeof ProjectsProjectRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute
  "/projects/$project": typeof ProjectsProjectRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexRoute
  "/projects/$project": typeof ProjectsProjectRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: "/" | "/projects/$project"
  fileRoutesByTo: FileRoutesByTo
  to: "/" | "/projects/$project"
  id: "__root__" | "/" | "/projects/$project"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ProjectsProjectRoute: typeof ProjectsProjectRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ProjectsProjectRoute: ProjectsProjectRoute,
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
        "/projects/$project"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/projects/$project": {
      "filePath": "projects.$project.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
