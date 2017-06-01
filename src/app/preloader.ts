const images = [
    "assets/battleship.png",
    "assets/carrier.png",
    "assets/destroyer.png",
    "assets/cruiser.png",
    "assets/splash.png",
    "assets/explosion.png",
    "assets/submarine.png",
]

export function preload() {
    for (let image of images) {
        let img = new Image();
        img.src = image;
    }
}
