/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as StudentRouteImport } from './routes/student'
import { Route as ServiceusageRouteImport } from './routes/serviceusage'
import { Route as ServiceRouteImport } from './routes/service'
import { Route as RoomtypeRouteImport } from './routes/roomtype'
import { Route as InvoiceRouteImport } from './routes/invoice'
import { Route as IndexRouteImport } from './routes/index'
import { Route as RoomIndexRouteImport } from './routes/room/index'
import { Route as ContractIndexRouteImport } from './routes/contract/index'
import { Route as RoomRoomIdRouteImport } from './routes/room/$roomId'
import { Route as ContractContractIdRouteImport } from './routes/contract/$contractId'

const StudentRoute = StudentRouteImport.update({
  id: '/student',
  path: '/student',
  getParentRoute: () => rootRouteImport,
} as any)
const ServiceusageRoute = ServiceusageRouteImport.update({
  id: '/serviceusage',
  path: '/serviceusage',
  getParentRoute: () => rootRouteImport,
} as any)
const ServiceRoute = ServiceRouteImport.update({
  id: '/service',
  path: '/service',
  getParentRoute: () => rootRouteImport,
} as any)
const RoomtypeRoute = RoomtypeRouteImport.update({
  id: '/roomtype',
  path: '/roomtype',
  getParentRoute: () => rootRouteImport,
} as any)
const InvoiceRoute = InvoiceRouteImport.update({
  id: '/invoice',
  path: '/invoice',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const RoomIndexRoute = RoomIndexRouteImport.update({
  id: '/room/',
  path: '/room/',
  getParentRoute: () => rootRouteImport,
} as any)
const ContractIndexRoute = ContractIndexRouteImport.update({
  id: '/contract/',
  path: '/contract/',
  getParentRoute: () => rootRouteImport,
} as any)
const RoomRoomIdRoute = RoomRoomIdRouteImport.update({
  id: '/room/$roomId',
  path: '/room/$roomId',
  getParentRoute: () => rootRouteImport,
} as any)
const ContractContractIdRoute = ContractContractIdRouteImport.update({
  id: '/contract/$contractId',
  path: '/contract/$contractId',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/invoice': typeof InvoiceRoute
  '/roomtype': typeof RoomtypeRoute
  '/service': typeof ServiceRoute
  '/serviceusage': typeof ServiceusageRoute
  '/student': typeof StudentRoute
  '/contract/$contractId': typeof ContractContractIdRoute
  '/room/$roomId': typeof RoomRoomIdRoute
  '/contract': typeof ContractIndexRoute
  '/room': typeof RoomIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/invoice': typeof InvoiceRoute
  '/roomtype': typeof RoomtypeRoute
  '/service': typeof ServiceRoute
  '/serviceusage': typeof ServiceusageRoute
  '/student': typeof StudentRoute
  '/contract/$contractId': typeof ContractContractIdRoute
  '/room/$roomId': typeof RoomRoomIdRoute
  '/contract': typeof ContractIndexRoute
  '/room': typeof RoomIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/invoice': typeof InvoiceRoute
  '/roomtype': typeof RoomtypeRoute
  '/service': typeof ServiceRoute
  '/serviceusage': typeof ServiceusageRoute
  '/student': typeof StudentRoute
  '/contract/$contractId': typeof ContractContractIdRoute
  '/room/$roomId': typeof RoomRoomIdRoute
  '/contract/': typeof ContractIndexRoute
  '/room/': typeof RoomIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/invoice'
    | '/roomtype'
    | '/service'
    | '/serviceusage'
    | '/student'
    | '/contract/$contractId'
    | '/room/$roomId'
    | '/contract'
    | '/room'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/invoice'
    | '/roomtype'
    | '/service'
    | '/serviceusage'
    | '/student'
    | '/contract/$contractId'
    | '/room/$roomId'
    | '/contract'
    | '/room'
  id:
    | '__root__'
    | '/'
    | '/invoice'
    | '/roomtype'
    | '/service'
    | '/serviceusage'
    | '/student'
    | '/contract/$contractId'
    | '/room/$roomId'
    | '/contract/'
    | '/room/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  InvoiceRoute: typeof InvoiceRoute
  RoomtypeRoute: typeof RoomtypeRoute
  ServiceRoute: typeof ServiceRoute
  ServiceusageRoute: typeof ServiceusageRoute
  StudentRoute: typeof StudentRoute
  ContractContractIdRoute: typeof ContractContractIdRoute
  RoomRoomIdRoute: typeof RoomRoomIdRoute
  ContractIndexRoute: typeof ContractIndexRoute
  RoomIndexRoute: typeof RoomIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/student': {
      id: '/student'
      path: '/student'
      fullPath: '/student'
      preLoaderRoute: typeof StudentRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/serviceusage': {
      id: '/serviceusage'
      path: '/serviceusage'
      fullPath: '/serviceusage'
      preLoaderRoute: typeof ServiceusageRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/service': {
      id: '/service'
      path: '/service'
      fullPath: '/service'
      preLoaderRoute: typeof ServiceRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/roomtype': {
      id: '/roomtype'
      path: '/roomtype'
      fullPath: '/roomtype'
      preLoaderRoute: typeof RoomtypeRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/invoice': {
      id: '/invoice'
      path: '/invoice'
      fullPath: '/invoice'
      preLoaderRoute: typeof InvoiceRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/room/': {
      id: '/room/'
      path: '/room'
      fullPath: '/room'
      preLoaderRoute: typeof RoomIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contract/': {
      id: '/contract/'
      path: '/contract'
      fullPath: '/contract'
      preLoaderRoute: typeof ContractIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/room/$roomId': {
      id: '/room/$roomId'
      path: '/room/$roomId'
      fullPath: '/room/$roomId'
      preLoaderRoute: typeof RoomRoomIdRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contract/$contractId': {
      id: '/contract/$contractId'
      path: '/contract/$contractId'
      fullPath: '/contract/$contractId'
      preLoaderRoute: typeof ContractContractIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  InvoiceRoute: InvoiceRoute,
  RoomtypeRoute: RoomtypeRoute,
  ServiceRoute: ServiceRoute,
  ServiceusageRoute: ServiceusageRoute,
  StudentRoute: StudentRoute,
  ContractContractIdRoute: ContractContractIdRoute,
  RoomRoomIdRoute: RoomRoomIdRoute,
  ContractIndexRoute: ContractIndexRoute,
  RoomIndexRoute: RoomIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
