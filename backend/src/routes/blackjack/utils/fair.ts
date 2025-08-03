import fetch from 'node-fetch'

interface FairData {
    success: boolean;
    data: any;
}

export function fairGetData(): Promise<FairData> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://eos.greymass.com/`, {
                headers: { 'Content-Type': 'application/json' }
            })

            if (response !== undefined && response.status === 200) {
                const data = await response.json()
                resolve({ success: true, data })
            } else {
                reject(new Error('Failed to fetch data'))
            }
        } catch (err) {
            reject(err)
        }
    })
}
