# Fifth Aeon Client

A web client for the # Fifth Aeon collectible card game, written using Angular and Typescript.

You can find the coresponding server at <https://github.com/Fifth-Aeon/CCG-Server>. The game's core logic is shared between the client and the server. To facilitate this sharing it uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) which is hosted at <https://github.com/WilliamRitson/CCG-Model>.

## Installation
Install [Git LFS](https://git-lfs.github.com/) and make sure its avalible in your path.

Run `git clone --recursive https://github.com/WilliamRitson/CCG-Client.git
` to clone the project and its submodule (do this wherever you want the project stored on your computer).

Install [node](https://nodejs.org/en/) using an installer. This should also install npm.

Run `npm install -g @angular/cli` to get [angular cli](https://github.com/angular/angular-cli).

Run `npm install` within the project directory (the place you cloned it) to install the project's dependencies.

## Editor
I use visual studio code as my editor and use the TSLint, Prettier and EditorConfig plugins. You can use any editor you like, but its recommended to have a plugin to enforce the linter rules.

## Images
The project uses svg (vector) images which are then rendered into png (bitmap) images before being released. However, only the svg sources should be stored in the repository. There is a script in the images folder which should render all the svgs. It requires [inkscape](https://inkscape.org/en/release/0.92.2/) be available in your path. Inkscape is also useful for creating new images.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
