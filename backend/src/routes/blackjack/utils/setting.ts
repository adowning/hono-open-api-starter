



interface Setting {
    id: number;
}
const settings: Setting | null = null
//
// function mapSettingPathToField(path: string): keyof Setting {
//     // const parts = path.split('.');
//     // if (parts.length < 2) return path as keyof Setting;

//     // const main = parts[0];
//     // const sub = parts[1];

//     // const fieldName = `${main.slice(0, -1)}${sub.charAt(0).toUpperCase() + sub.slice(1)}Enabled`;
//     // return fieldName as keyof Setting;
// }

export async function settingInitDatabase(): Promise<void> {
    try {
        // settings = await prisma.setting.findFirst();

        // if (!settings) {
        //     console.log('No settings found, creating default settings...');
        //     settings = await prisma.setting.create({
        //         data: {
        //             generalMaintenanceEnabled: false,
        //             generalRainEnabled: false,
        //             generalLeaderboardEnabled: false,
        //             generalTipEnabled: false,
        //             generalAffiliateEnabled: false,
        //             generalRewardMultiplier: 1,
        //             chatMode: 'normal',
        //             chatEnabled: false,
        //             chatRoomEnEnabled: true,
        //             chatRoomTrEnabled: true,
        //             chatRoomDeEnabled: true,
        //             chatRoomEsEnabled: true,
        //             chatRoomBegEnabled: true,
        //             chatRoomWhaleEnabled: true,
        //             gameCrashEnabled: true,
        //             gameRollEnabled: true,
        //             gameBlackjackEnabled: true,
        //             gameDuelsEnabled: true,
        //             gameCombatLegendEnabled: true,
        //             gameMinesEnabled: true,
        //             gameTowersEnabled: true,
        //             gameUnboxEnabled: true,
        //             gameBattlesEnabled: true,
        //             gameUpgraderEnabled: true,
        //             robuxDepositEnabled: false,
        //             robuxWithdrawEnabled: false,
        //             limitedDepositEnabled: false,
        //             limitedWithdrawEnabled: false,
        //             steamDepositEnabled: false,
        //             steamWithdrawEnabled: false,
        //             cryptoDepositEnabled: false,
        //             cryptoWithdrawEnabled: false,
        //             giftDepositEnabled: false,
        //             giftWithdrawEnabled: false,
        //             creditDepositEnabled: false,
        //             creditWithdrawEnabled: false,
        //         },
        //     });
        // }
    } catch (err: any) {
        console.error(`Error initializing settings: ${err.message}`)
        process.exit(1)
    }
}

export function settingCheck(): void {
    // if (settings!.generalMaintenanceEnabled === true && user?.rank !== 'admin') {
    //     throw new Error('Site is in maintenance! Please try again later.');
    // }

    // if (valuePath) {
    //     const fieldName = mapSettingPathToField(valuePath);
    //     if (settings![fieldName] === false && user?.rank !== 'admin') {
    //         throw new Error('The action you’ve requested is currently unavailable.');
    //     }
    // }
}

export function settingGet(): Setting | null {
    return settings
}

// export const settingSetValue = async (settingKey: keyof Setting, value: any): Promise<Setting> => {
//     // const updatedSettings = await prisma.setting.update({
//     //     where: { id: settings!.id },
//     //     data: { [settingKey]: value },
//     // });

//     // settings = updatedSettings;
//     // return settings;
// };
