import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Operator } from '@/sdk/generated/operator.gen'
import { Wallet } from '@/sdk/generated'

// type Operator = InferResponseType<typeof api.operators.$get>[0]
// export type Wallet = InferResponseType<typeof api.me.$get>['wallet']

export const useDepositStore = defineStore('deposit', () => {
    // State
    const wallet = ref<Wallet>()
    const operator = ref<Operator>()

    // Actions
    function setDepositInfo(data: { wallet: Wallet; operator?: Operator }) {
        wallet.value = data.wallet
        operator.value = data.operator
    }

    function clearDepositInfo() {
        wallet.value = undefined
        operator.value = undefined
    }

    return {
        wallet,
        operator,
        setDepositInfo,
        clearDepositInfo,
    }
})
