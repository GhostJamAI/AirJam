export type WebsocketMessage = | {
    type: "frame",
    data: string;
} | {
    type: "info",
    message: string
}