type Transform = {
    x: number;
    y: number;
    z: number;
};

export default class CanvasModel {
    tiles: Map<string, TileModel>;
    gridHeight: number;
    gridWidth: number;
    canvasViewModel: CanvasViewModel;

    constructor(
        canvas: HTMLCanvasElement,
        gridHeight: number,
        gridWidth: number
    ) {
        this.gridHeight = gridHeight;
        this.gridWidth = gridWidth;
        this.tiles = new Map();
        this.canvasViewModel = new CanvasViewModel(this);
    }

    createTiles() {
        new Array(this.gridWidth).fill("").forEach((_, x) => {
            new Array(this.gridHeight).fill("").forEach((_, y) => {
                this.tiles.set(`${x}:${y}`, new TileModel(this, x, y));
            });
        });
        console.log(this.tiles);
    }
}

export class CanvasViewModel {
    viewWidth: number;
    viewHeight: number;
    viewX: number;
    viewY: number;
    viewZ: number;
    view: CanvasView;
    tiles: Map<string, TileModel>;
    model: CanvasModel;

    constructor(model: CanvasModel) {
        this.viewHeight = window?.innerHeight ?? 1080;
        this.viewWidth = window?.innerWidth ?? 1920;
        this.viewX = 0;
        this.viewY = 0;
        this.view = new CanvasView(this);
        this.tiles = new Map();
        this.model = model;
    }

    transformView() {}

    transformX(x: number) {
        return (
            x * this.transformZ(this.viewZ) +
            this.viewWidth / 2 +
            ((this.viewX * this.viewHeight) / this.model.gridHeight) *
                this.viewZ
        );
    }

    transformY(y: number) {
        -y * this.transformZ(this.viewZ) +
            this.viewHeight / 2 -
            ((this.viewX * this.viewHeight) / this.model.gridHeight) *
                this.viewZ;
    }

    transformZ(z: number) {
        return (z * this.viewHeight) / this.model.gridHeight;
    }
}

export class CanvasView {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    viewModel: CanvasViewModel;
    tiles: Map<string, TileView>;

    constructor(viewModel: CanvasViewModel) {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
        this.viewModel = viewModel;
        this.tiles = new Map();

        this.viewModel.tiles.forEach((tile) => {
            new TileView(tile.viewModel);
        });
    }

    renderTiles() {
        this.tiles;
    }
}

export class TileModel {
    x: number;
    y: number;
    hasWall: boolean;
    viewModel: TileViewModel;

    constructor(
        controller: CanvasModel,
        x: number,
        y: number,
        hasWall: boolean = false
    ) {
        this.x = x;
        this.y = y;
        this.hasWall = hasWall;
        this.viewModel = new TileViewModel(this);
    }

    addWall() {}
}

export class TileViewModel {
    x: number;
    y: number;

    constructor(x: number, y: number, transform: Transform) {
        this.x = x;
        this.y = y;
    }
}

export class TileView {
    viewModel: TileViewModel;

    constructor(viewModel: TileViewModel) {
        this.viewModel = viewModel;
    }
}
