export const notificationsHandler = {
    open(ws) {
        console.log('WebSocket connection opened for notifications')
        ws.subscribe('notifications')
    },
    close(ws) {
        console.log('WebSocket connection closed for notifications')
        ws.unsubscribe('notifications')
    },
    message(message) {
        console.log('Received message on notifications:', message)
    },
}
