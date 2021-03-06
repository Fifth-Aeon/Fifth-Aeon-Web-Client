const packager = require('electron-packager')
const fs = require('fs');

const copy = (from, to) => {
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

copy('electron-index.js', 'dist/index.js');
copy('package.json', 'dist/package.json');

packager({
    executableName: 'fifth-aeon',
    name: 'fifth-aeon',
    dir: 'dist',
    out: 'standalone',
    arch: 'x64',
    platform: process.platform,
    overwrite: true
}).then(appPaths => {
    console.log('Done, created:', appPaths.join(', '));
});