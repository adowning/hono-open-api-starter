/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
// import { useSocketStore } from './socket'
// import { useNotificationStore } from './notifications'
// import { useModalsStore } from './modals'

interface ChatMessages {
    data: any[] | null
    loading: boolean
}

export const useChatStore = defineStore('chat', () => {
    const lastMessage = ref<number | null>(null)
    const scroll = ref(true)
    const room = ref(localStorage.getItem('chatRoom') || 'en')
    const online = reactive({
        en: 0,
        tr: 0,
        de: 0,
        es: 0,
        beg: 0,
        whale: 0,
    })
    const messages = reactive<ChatMessages>({
        data: null,
        loading: false,
    })

    // const socketStore = useSocketStore()
    // const notificationsStore = useNotificationStore()
    // const modalsStore = useModalsStore()

    const isChatOpen = ref(false)

    function setChatOpenState(isOpen: boolean) {
        isChatOpen.value = isOpen
    }

    function setLastMessage() {
        lastMessage.value = new Date().getTime()
    }

    function setScroll(value: boolean) {
        scroll.value = value
    }

    function setRoom(newRoom: string) {
        if (room.value === newRoom) return
        room.value = newRoom
        localStorage.setItem('chatRoom', newRoom)
        // getMessages({ room: newRoom })
    }

    function setOnline(data: {
        en: number
        tr: number
        de: number
        es: number
        beg: number
        whale: number
    }) {
        Object.assign(online, data)
    }

    function setMessages(data: any[]) {
        messages.data = data
    }

    function addMessage(message: any) {
        if (!messages.data) messages.data = []
        messages.data.push(message)
        if (messages.data.length > 50 && scroll.value) {
            removeOverdueMessages()
        }
    }

    function removeMessage(messageId: string) {
        if (!messages.data) return
        const index = messages.data.findIndex((msg) => msg._id === messageId)
        if (index !== -1) {
            messages.data.splice(index, 1)
        }
    }

    function removeOverdueMessages() {
        if (messages.data) {
            messages.data.splice(0, messages.data.length - 50)
        }
    }

    function clearMessages() {
        messages.data = []
    }

    function setLoading(value: boolean) {
        messages.loading = value
    }

    function socketInit(data: any) {
        setOnline(data.online)
        // getMessages({ room: room.value })
    }

    function socketOnline(data: any) {
        setOnline(data.online)
    }

    function socketMessage(data: any) {
        addMessage(data.message)
    }

    function socketRemove(data: any) {
        removeMessage(data.messageId)
    }

    function socketClear() {
        clearMessages()
    }

    // function getMessages(data: { room: string }) {
    //     // if (!socketStore.general || messages.loading) return
    //     // setLoading(true)
    //     // socketStore.general.emit('getChatMessages', data, (res: any) => {
    //     //     if (res.success) {
    //     //         setScroll(true)
    //     //         setMessages(res.messages)
    //     //     }
    //     //     setLoading(false)
    //     // })
    // }

    // function sendMessage(data: any) {
    //     // if (!socketStore.general || socketStore.sendLoading) return
    //     // socketStore.setSendLoading('ChatMessage')
    //     // socketStore.general.emit('sendChatMessage', data, (res: any) => {
    //     //     if (!res.success) {
    //     //         notificationsStore.show(res.error)
    //     //     }
    //     //     setLastMessage()
    //     //     socketStore.setSendLoading(null)
    //     // })
    // }

    // function sendRemove(data: any) {
    //     // if (!socketStore.general || socketStore.sendLoading) return
    //     // socketStore.setSendLoading('ChatRemove')
    //     // socketStore.general.emit('sendChatRemove', data, (res: any) => {
    //     //     if (res.success) {
    //     //         modalsStore.setShow(null)
    //     //     } else {
    //     //         notificationsStore.show(res.error)
    //     //     }
    //     //     socketStore.setSendLoading(null)
    //     // })
    // }

    // function sendClear(data: any) {
    //     // if (!socketStore.general || socketStore.sendLoading) return
    //     // socketStore.setSendLoading('ChatClear')
    //     // socketStore.general.emit('sendChatClear', data, (res: any) => {
    //     //     if (!res.success) {
    //     //         notificationsStore.show(res.error)
    //     //     }
    //     //     socketStore.setSendLoading(null)
    //     // })
    // }

    // function sendLock(data: any) {
    //     // if (!socketStore.general || socketStore.sendLoading) return
    //     // socketStore.setSendLoading('ChatLock')
    //     // socketStore.general.emit('sendChatLock', data, (res: any) => {
    //     //     if (!res.success) {
    //     //         notificationsStore.show(res.error)
    //     //     }
    //     //     socketStore.setSendLoading(null)
    //     // })
    // }

    return {
        lastMessage,
        scroll,
        room,
        online,
        messages,
        isChatOpen,
        setChatOpenState,
        setLastMessage,
        setScroll,
        setRoom,
        setOnline,
        setMessages,
        addMessage,
        removeMessage,
        removeOverdueMessages,
        clearMessages,
        setLoading,
        socketInit,
        socketOnline,
        socketMessage,
        socketRemove,
        socketClear,
        // getMessages,
        // sendMessage,
        // sendRemove,
        // sendClear,
        // sendLock,
    }
})
