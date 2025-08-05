import { User, Scene, Story } from '../models/models';
import { Clubs, Scenes, Users, nextStoryId } from '../models/store';
import { Cfg } from '../stubs/config';
import { GameFactory, Gamble } from '../stubs/game';
import { ErrNoAliase, ErrNotOpened } from './errors';

// GetRTP calculates the effective RTP for a user in a club.
export function GetRTP(user: User | undefined, clubId: number): number {
    const club = Clubs.get(clubId);
    if (!club) {
        return Cfg.DefMRTP;
    }

    if (user) {
        const props = user.props.get(clubId);
        if (props && props.mrtp !== 0) {
            return props.mrtp;
        }
    }

    if (club.mrtp !== 0) {
        return club.mrtp;
    }

    return Cfg.DefMRTP;
}

// GetScene retrieves a game scene from the cache or creates a new one.
// In the original Go code, it falls back to loading from a database.
// Here, we'll just check the cache. A separate function will create new scenes.
export function GetScene(gid: number): Scene | null {
    return Scenes.get(gid) || null;
}

// CreateScene creates a new game scene and adds it to the cache.
export function CreateScene(cid: number, uid: number, alias: string): Scene | null {
    const maker = GameFactory[alias.toLowerCase()];
    if (!maker) {
        return null;
    }

    const user = Users.get(uid);
    const club = Clubs.get(cid);
    if (!user || !club) {
        return null;
    }

    const game = maker();
    const story = new Story();
    story.gid = nextStoryId();
    story.cid = cid;
    story.uid = uid;
    story.alias = alias;
    story.ctime = new Date();

    const scene = new Scene();
    scene.story = story;
    scene.game = game;

    Scenes.set(scene.GID, scene);
    return scene;
}
