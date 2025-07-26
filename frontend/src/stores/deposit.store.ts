import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InferResponseType } from 'hono/client'
import { api } from '@/sdk/api'

type Operator = InferResponseType<typeof api.operators.$get>[0]
type Wallet = InferResponseType<typeof api.me.$get>['wallet']

export const useDepositStore = defineStore('deposit', () => {
    // State
    const wallet = ref<Wallet | null>(null)
    const operator = ref<Operator | null>(null)

    // Actions
    function setDepositInfo(data: { wallet: Wallet; operator: Operator }) {
        wallet.value = data.wallet
        operator.value = data.operator
    }

    function clearDepositInfo() {
        wallet.value = null
        operator.value = null
    }

    return {
        wallet,
        operator,
        setDepositInfo,
        clearDepositInfo,
    }
})
