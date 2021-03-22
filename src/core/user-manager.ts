import type User from "./user"

export default class UserManager {
    users: Map<string, User>;

    constructor(target: HTMLDivElement) {
        this.users = new Map();
    }
}