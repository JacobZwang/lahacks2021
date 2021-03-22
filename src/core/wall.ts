/**wall is appended to target tile upon creation*/
export default class Wall {
    wall: HTMLDivElement;
    constructor(
        target: HTMLDivElement,
        neighborTop: boolean,
        neighborRight: boolean,
        neighborBottom: boolean,
        neighborLeft: boolean,
    ) {
        this.wall = document.createElement("div");
        this.wall.style.backgroundColor = "grey";
        this.wall.setAttribute("role", "wall");
        target.appendChild(this.wall);

        if (
            neighborTop === false &&
            neighborBottom === false &&
            neighborLeft === true &&
            neighborRight === true
        ) {
            this.wall.style.height = "50%";
            this.wall.style.width = "100%";
            this.wall.style.marginTop = "25%";
        } else if (
            neighborTop === true &&
            neighborBottom === true &&
            neighborLeft === false &&
            neighborRight === false) {
            this.wall.style.height = "100%";
            this.wall.style.width = "50%";
            this.wall.style.marginLeft = "25%";
        } else if (
            neighborTop === false &&
            neighborBottom === false &&
            neighborLeft === true &&
            neighborRight === false) {
            this.wall.style.height = "50%";
            this.wall.style.width = "50%";
            this.wall.style.marginRight = "25%";
            this.wall.style.marginTop = "25%";
        } else if (
            neighborTop === false &&
            neighborBottom === false &&
            neighborLeft === true &&
            neighborRight === false) {
            this.wall.style.height = "50%";
            this.wall.style.width = "50%";
            this.wall.style.marginLeft = "25%";
            this.wall.style.marginTop = "25%";
        } else {
            this.wall.style.height = "50%";
            this.wall.style.width = "50%";
            this.wall.style.marginLeft = "25%";
            this.wall.style.marginTop = "25%";
        }
    }
}