import type StateManager from "./state-manager";
import User from "./user";

export default class UserManager {
    users: Map<string, User>;
    activeUser: User;

    constructor(manager: StateManager) {
        this.users = new Map();
        this.activeUser = undefined;
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
}
