/**
 * Defines the structure for any message coming from a client WebSocket.
 */
export interface ClientMessage<T = unknown> {
    event: string;
    payload: T;
    requestId?: string; // Optional, but required for messages expecting a direct response
}

/**
 * Defines the structure for a direct response from the server to a client.
 */
export interface ServerResponse<T = unknown> {
    event: 'response';
    requestId: string; // Mirrors the requestId from the client's message
    payload: T | null;
    error: { message: string } | null;
}

/**
 * Defines the structure for a broadcast message from the server to a topic.
 */
export interface ServerBroadcast<T = unknown> {
    event: string; // e.g., 'tableUpdate'
    payload: T;
}

/**
 * Defines the data context attached to each authenticated WebSocket connection.
 */
export interface BlackjackWebSocketContext {
    id: string; // User ID
    username: string;
    rank: string;
}

// You can also define specific payload types for each event
export interface JoinPayload {
    table: number;
    seat: number;
}

export interface BetPayload {
    table: number;
    bets: {
        seat: number;
        amount: {
            main: number;
            sideLeft: number;
            sideRight: number;
        };
    }[];
}

export interface BlackjackTable {
    table: number;
    game: any;
    players: Player[];
    playersPos: number | 'all' | null;
}

export interface Player {
    seat: number;
    user: any;
    bet: any;
}

// We can add more payload types here as we refactor other events...