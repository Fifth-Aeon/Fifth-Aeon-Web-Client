const utils = require('./utils');

const account = "william-ritson"
const game = "fifth-aeon"
const sourceFolder = "standalone"
const platformInfo = {
    linux: {
        source: "fifth-aeon-win32-x64",
        channel: "fifth-aeon-linux",
        butler: "linux-amd64"
    },
    win32: {
        source: "fifth-aeon-linux-x64",
        channel: "fifth-aeon-win64",
        butler: "windows-amd64"
    },
    darwin: {
        source: "fifth-aeon-darwin-x64",
        channel: "fifth-aeon-mac",
        butler: "darwin-amd64"
    }
}

async function main() {
    const currentPlatformInfo = platformInfo[process.platform];
    await utils.exec(`curl -L -o butler.zip https://broth.itch.ovh/butler/${currentPlatformInfo.butler}/LATEST/archive/default`)
    await utils.exec(`unzip ./butler.zip`)
    await utils.exec(`./butler push ${sourceFolder}/${currentPlatformInfo.source} ${account}/${game}:${currentPlatformInfo.channel}`)
}

main()
