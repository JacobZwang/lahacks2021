/**wall is appended to target tile upon creation*/
export default class Wall {
    wall: HTMLDivElement;
    constructor(
        target: HTMLDivElement,
        neighbortWalls: [boolean, boolean, boolean, boolean]
    ) {
        this.wall = document.createElement("div");
        this.wall.style.height = "100%";
        this.wall.style.width = "50%";
        this.wall.style.margin = "auto";
        this.wall.style.backgroundColor = "grey";
        this.wall.setAttribute("role", "wall");
        target.appendChild(this.wall);

        if (
            neighbortWalls[0] === false &&
            neighbortWalls[1] === true &&
            neighbortWalls[2] === false &&
            neighbortWalls[3] === true
        ) {
            this.wall.style.height = "50%";
            this.wall.style.width = "100%";
        }

        if (
            neighbortWalls[0] === false &&
            neighbortWalls[1] === false &&
            neighbortWalls[2] === false &&
            neighbortWalls[3] === true
        ) {
            this.wall.style.height = "50%";
            this.wall.style.width = "100%";
        }

        if (
            neighbortWalls[0] === false &&
            neighbortWalls[1] === true &&
            neighbortWalls[2] === false &&
            neighbortWalls[3] === false
        ) {
            this.wall.style.height = "50%";
            this.wall.style.width = "100%";
        }
    }
}