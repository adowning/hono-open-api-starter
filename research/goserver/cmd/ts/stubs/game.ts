// Game properties flags
export const GPcasc = 1 << 0;
export const GPlsel = 1 << 1;
export const GPjack = 1 << 2;
export const GPfill = 1 << 3;
export const GPfghas = 1 << 4;
export const GPretrig = 1 << 5;
export const GPfgmult = 1 << 6;
export const GPfgreel = 1 << 7;
export const GPscat = 1 << 8;
export const GPwild = 1 << 9;
export const GPwmult = 1 << 10;
export const GPrwild = 1 << 11;
export const GPbwild = 1 << 12;
export const GPwturn = 1 << 13;
export const GPbsym = 1 << 14;

// Game information class
export class GameInfo {
  constructor(
    public Name: string,
    public Prov: string,
    public SX: number,
    public SY: number,
    public SN: number,
    public LN: number,
    public WN: number,
    public GP: number,
    public RTP: number[],
    public AlgDescr: AlgDescr
  ) {}

  FindClosest(mrtp: number): number {
    if (this.RTP.length === 0) {
      return 0;
    }
    return this.RTP.reduce((prev, curr) => {
      return Math.abs(curr - mrtp) < Math.abs(prev - mrtp) ? curr : prev;
    });
  }
}

// Algorithm description
export class AlgDescr {}

// Filter function type
export type Filter = (gi: GameInfo) => boolean;

// A map of game information, keyed by game ID
export const InfoMap: { [key: string]: GameInfo } = {
  'megajack/slotopol': new GameInfo('Slotopol', 'Megajack', 5, 3, 12, 21, 0, 0, [95.0, 96.0, 97.0], new AlgDescr()),
  'novomatic/dolphinspearl': new GameInfo('Dolphins Pearl', 'Novomatic', 5, 3, 13, 9, 0, 0, [94.5, 95.5], new AlgDescr()),
};

// A function to get a filter by its name (string key)
export const GetFilter = (key: string): Filter | null => {
    if (key === 'all') {
        return (gi: GameInfo) => true;
    }
    return null; // Placeholder for other filters
};

// A function to check if a game passes a set of include/exclude filters
export const Passes = (gi: GameInfo, finclist: Filter[], fexclist: Filter[]): boolean => {
    let included = finclist.length === 0;
    for (const f of finclist) {
        if (f(gi)) {
            included = true;
            break;
        }
    }
    if (!included) {
        return false;
    }

    for (const f of fexclist) {
        if (f(gi)) {
            return false;
        }
    }

    return true;
};

// Scanner function type
export type Scanner = (exitctx: any, mrtp: number) => void;

// A factory for creating scanners for different games
export const ScanFactory: { [key: string]: Scanner } = {
    'megajack/slotopol': (exitctx: any, mrtp: number) => {
        console.log(`Scanning 'megajack/slotopol' with master RTP ${mrtp}...`);
    },
    'novomatic/dolphinspearl': (exitctx: any, mrtp: number) => {
        console.log(`Scanning 'novomatic/dolphinspearl' with master RTP ${mrtp}...`);
    },
    'novomatic/katana': (exitctx: any, mrtp: number) => {
        console.log(`Scanning 'novomatic/katana' with master RTP ${mrtp}...`);
    }
};
