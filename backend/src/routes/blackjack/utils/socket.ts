import type { UserWithRelations } from '#/db/schema'

interface SocketActiveConnections {
  [key: string]: string[]
}

const socketActiveConnections: SocketActiveConnections = {
  general: [],
  crash: [],
  roll: [],
  blackjack: [],
  duels: [],
  combat_legend: [],
  mines: [],
  towers: [],
  unbox: [],
  slots: [],
  battles: [],
  upgrader: [],
  cashier: [],
  admin: [],
}

const socketActiveRequests: string[] = []

export function socketCheckUserData(
  user: UserWithRelations | null,
  checkAuth: boolean
): void {
  if (checkAuth && !user) {
    throw new Error('You need to sign in to perform this action.')
  }
}

export function socketAddConnectionLimit(
  room: string,
  identifier: string
): void {
  if (socketActiveConnections[room]) {
    socketActiveConnections[room].push(identifier.toString())
  }
}

export function socketRemoveConnectionLimit(
  _room: string,
  _identifier: string
): void {
  // This function is a placeholder and does not have any functionality.
}

export function socketCheckAntiSpam(_identifier: string): Promise<void> {
  return new Promise(async (resolve) => {
    resolve()
  })
}

export function socketRemoveAntiSpam(identifier: string): void {
  const index = socketActiveRequests.indexOf(identifier.toString())
  if (index !== -1) {
    socketActiveRequests.splice(index, 1)
  }
}
