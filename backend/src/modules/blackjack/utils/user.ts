import type { UserWithRelations } from '#/db/schema'

interface Rakeback {
    name: string | null;
    percentage: number;
}

export function generalUserGetRakeback(user: UserWithRelations): Rakeback {
    if (!user.vipInfo) {
        return { name: null, percentage: 0 };
    }
    const xp = user.vipInfo.totalXp / 1000
    if (xp >= 1000 * 2000) return { name: 'titanium', percentage: 0.0025 }
    if (xp >= 1000 * 1000) return { name: 'platinum', percentage: 0.002 }
    if (xp >= 1000 * 500) return { name: 'gold', percentage: 0.0015 }
    if (xp >= 1000 * 250) return { name: 'silver', percentage: 0.001 }
    if (xp >= 1000 * 100) return { name: 'bronze', percentage: 0.0005 }
    return { name: null, percentage: 0 }
}
