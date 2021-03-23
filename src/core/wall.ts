/**wall is appended to target tile upon creation*/
export default class Wall {
    wall: HTMLDivElement;
    constructor(
        target: HTMLDivElement,
        neighborTop: boolean,
        neighborRight: boolean,
        neighborBottom: boolean,
        neighborLeft: boolean
    ) {
        this.wall = document.createElement("div");
        this.wall.style.backgroundColor = "grey";

        if(neighborBottom && neighborRight) {
            this.wall.style.clipPath ="polygon(0% 0%, 101% 0%, 101% 50%, 50% 50%, 50% 101%, 0% 101%)";

        }

        this.wall.style.height =
            50 +
            50 * ((neighborBottom||neighborTop) && (!(neighborTop && (neighborLeft || neighborRight))||(neighborTop && neighborBottom)) ? 1 : 0) +
            "%";
            this.wall.style.width =
            50 +
            50 * ((neighborLeft || neighborRight) && (!(neighborLeft && (neighborTop || neighborBottom))||(neighborLeft && neighborRight))? 1 : 0) +
            "%";

        
        
            
        this.addBorderRadius(neighborBottom, neighborLeft, neighborRight, neighborTop);
        this.wall.setAttribute("role", "wall");
        target.appendChild(this.wall);
    }

    private addBorderRadius(neighborBottom: boolean, neighborLeft: boolean, neighborRight: boolean, neighborTop: boolean) {
        if (!neighborBottom && !neighborLeft) {
            this.wall.style.borderBottomLeftRadius = "2px";
        }
        if (!neighborBottom && !neighborRight) {
            this.wall.style.borderBottomRightRadius = "2px";
        }
        if (!neighborTop && !neighborLeft) {
            this.wall.style.borderTopLeftRadius = "2px";
        }
        if (!neighborTop && !neighborRight) {
            this.wall.style.borderTopRightRadius = "2px";
        }
    }
}
