import { Gamble } from '../stubs/game';

// Access Level enum
export enum AL {
    MEMBER = 1 << 0,
    DEALER = 1 << 1,
    BOOKER = 1 << 2,
    MASTER = 1 << 3,
    ADMIN = 1 << 4,
    ALL = MEMBER | DEALER | BOOKER | MASTER | ADMIN,
}

// User Flag enum
export enum UF {
    ACTIVATED = 1 << 0,
    SIGNCODE = 1 << 1,
}

export class ClubData {
    cid: number;
    ctime: Date;
    utime: Date;
    name: string;
    bank: number = 0;
    fund: number = 0;
    lock: number = 0;
    rate: number = 2.5;
    mrtp: number = 0;
}

export class User {
    uid: number;
    ctime: Date;
    utime: Date;
    email: string;
    secret: string;
    name: string;
    code: number = 0;
    status: UF = 0;
    gal: AL = 0;
    props: Map<number, Props> = new Map();

    constructor(uid: number, email: string, secret: string, name: string) {
        this.uid = uid;
        this.email = email;
        this.secret = secret;
        this.name = name;
        this.ctime = new Date();
        this.utime = new Date();
    }

    getWallet(cid: number): number {
        const props = this.props.get(cid);
        return props ? props.wallet : 0;
    }

    getAL(cid: number): AL {
        const props = this.props.get(cid);
        return props ? props.access : 0;
    }

    getRTP(cid: number): number {
        const props = this.props.get(cid);
        return props ? props.mrtp : 0;
    }

    insertProps(props: Props): void {
        this.props.set(props.cid, props);
    }
}

export class Story {
    gid: number;
    cid: number;
    uid: number;
    alias: string;
    ctime: Date;
}

export class Scene {
    story: Story;
    sid: number;
    game: Gamble;

    get GID() { return this.story.gid; }
    get CID() { return this.story.cid; }
    get UID() { return this.story.uid; }
    get Alias() { return this.story.alias; }
}

export class Props {
    cid: number;
    uid: number;
    ctime: Date;
    utime: Date;
    wallet: number = 0;
    access: AL = 0;
    mrtp: number = 0;
}

// Log types
export class Spinlog {
    sid: number;
    gid: number;
    ctime: Date;
    mrtp: number;
    game: string; // JSON string
    wins: string; // JSON string
    gain: number;
    wallet: number;
}

export class Multlog {
    id: number;
    gid: number;
    ctime: Date;
    mrtp: number;
    mult: number;
    risk: number;
    win: boolean;
    gain: number;
    wallet: number;
}

export class Walletlog {
    id: number;
    cid: number;
    uid: number;
    aid: number;
    ctime: Date;
    wallet: number;
    sum: number;
}

export class Banklog {
    id: number;
    ctime: Date;
    bank: number;
    fund: number;
    lock: number;
    bankSum: number;
    fundSum: number;
    lockSum: number;
}
