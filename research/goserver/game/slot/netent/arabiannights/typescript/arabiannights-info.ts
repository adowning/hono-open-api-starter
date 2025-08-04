import {
    AlgInfo,
    Date,
    MakeRtpList,
    GTslot,
    GPlpay,
    GPlsel,
    GPretrig,
    GPfgreel,
    GPfgmult,
    GPscat,
    GPwild,
    GPwmult,
    Gamble,
} from './stubs/game';
import { ReelsMap } from './arabiannights-reel';
import { NewGame } from './arabiannights';
import { CalcStatReg } from './arabiannights-calc';

// Define the Info object with a placeholder for SetupFactory
export const Info: AlgInfo = {
    Aliases: [
        { Prov: "NetEnt", Name: "Arabian Nights", Date: Date(2005, 5, 15) },
    ],
    AlgDescr: {
        GT: GTslot,
        GP: GPlpay |
            GPlsel |
            GPretrig |
            GPfgreel |
            GPfgmult |
            GPscat |
            GPwild |
            GPwmult,
        SX:  5,
        SY:  3,
        SN:  12, // Corresponds to len(LinePay) in the Go code
        LN:  10, // Corresponds to len(BetLines) in the Go code
        BN:  0,
        RTP: MakeRtpList(ReelsMap),
    },
    SetupFactory: (factory: () => Gamble, calc: (ctx: any, mrtp: number) => number): void => {
        // In a real application, this would register the game factory and calculator.
        console.log(`Game factory and calculator registered for 'Arabian Nights'.`);
        // You could, for example, store them in a map:
        // gameRegistry.set("Arabian Nights", { factory, calc });
    }
};

// The original Go code has an init() function that calls SetupFactory.
// We can simulate this by calling it right after the object is defined,
// which is a common pattern for module initialization in JavaScript/TypeScript.
Info.SetupFactory(NewGame, CalcStatReg);
