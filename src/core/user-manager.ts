import type StateManager from "./state-manager";
import User from "./user";

export default class UserManager {
    users: Map<string, User>;
    activeUser: User;
    manager: StateManager;

    constructor(manager: StateManager) {
        this.users = new Map();
        this.activeUser = undefined;
        this.manager = manager;
    }

    createUser(payload: { id: string }) {
        const self = this;
        const user = new User(self, payload);
        this.users.set(user.id, user);
        return user;
    }

    setActiveUser(user: User) {
        this.activeUser = user;
    }

    setUser(payload: { id: string; location?: number }) {
        const user = this.users.get(payload.id);

        if (user) {
            user.setLocation(this.manager.tileManager.tiles[payload.location]);
        } else {
            console.log(payload);
            const user = this.createUser(payload);
            user.setLocation(this.manager.tileManager.tiles[payload.location]);
        }
    }

    deleteUser(id: string) {
        this.users.get(id)?.tileIn.removeUser();
        this.users.delete(id);
    }
}
