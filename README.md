# Card Game Client

A client for a websockets based card game, written using Angular and Typescript.

You can find the coresponding server at <https://github.com/WilliamRitson/CCG-Server>. The game's core logic is shared between the client and the server. To facilitate this sharing it uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) which is hosted at <https://github.com/WilliamRitson/CCG-Model>.

## Installation
Requires [node](https://nodejs.org/en/), [yarn](https://www.npmjs.com/package/yarn) and [typescript](https://www.typescriptlang.org/) to be installed and avalible in your path.

After installing the prereqs run `yarn` to install the dependencies.


## Images
The project uses svg (vector) images which are then rendered into png (bitmap) images before being released. However, only the svg sources should be stored in the repository. There is a script in the images folder which should render all the svgs. It requires [inkscape](https://inkscape.org/en/release/0.92.2/) be available in your path. Inkscape is also useful for creating new images.


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

# Ideas and Todo
See (https://trello.com/b/0YypsJaV/ccg).

