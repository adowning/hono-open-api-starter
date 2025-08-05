import { ClubData, User, Scene, Props, AL } from './models';

// In-memory store for the application state.
// In a real application, this would be backed by a database.

export const Clubs = new Map<number, ClubData>();
export const Users = new Map<number, User>();
export const Scenes = new Map<number, Scene>();

// Counters
export let StoryCounter = 0;
export let SpinCounter = 0;
export let MultCounter = 0;

export const nextStoryId = () => ++StoryCounter;
export const nextSpinId = () => ++SpinCounter;
export const nextMultId = () => ++MultCounter;

// Pre-populate with data from play_test.go
function initStore() {
    // Create club
    const virtualClub = new ClubData();
    virtualClub.cid = 1;
    virtualClub.name = "Virtual";
    virtualClub.bank = 100000;
    Clubs.set(virtualClub.cid, virtualClub);

    // Create users
    const admin = new User(1, "admin@example.org", "0YBoaT", "Admin");
    admin.gal = AL.ALL;
    const player = new User(3, "player@example.org", "iVI05M", "Player");

    // Create props for users in the club
    const adminProps = new Props();
    adminProps.cid = virtualClub.cid;
    adminProps.uid = admin.uid;
    adminProps.access = AL.ALL;
    admin.insertProps(adminProps);

    const playerProps = new Props();
    playerProps.cid = virtualClub.cid;
    playerProps.uid = player.uid;
    playerProps.access = AL.MEMBER;
    playerProps.wallet = 100; // Initial wallet balance
    player.insertProps(playerProps);

    Users.set(admin.uid, admin);
    Users.set(player.uid, player);
}

initStore();
