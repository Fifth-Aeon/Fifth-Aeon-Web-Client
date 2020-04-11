const utils = require('./utils');

const account = "william-ritson"
const game = "fifth-aeon"
const sourceFolder = "standalone"
const platformInfo = {
    linux: {
        source: "fifth-aeon-linux-x64",
        channel: "linux",
        butler: "linux-amd64"
    },
    win32: {
        source: "fifth-aeon-win32-x64",
        channel: "win64",
        butler: "windows-amd64"
    },
    darwin: {
        source: "fifth-aeon-darwin-x64",
        channel: "mac",
        butler: "darwin-amd64"
    }
}

async function main() {
    const currentPlatformInfo = platformInfo[process.platform];
    console.log(process.platform, '->', currentPlatformInfo);
    try {
        await utils.exec(`curl -L -o butler.zip https://broth.itch.ovh/butler/${currentPlatformInfo.butler}/LATEST/archive/default`, { echo: true })
        await utils.exec(`unzip ./butler.zip`, { echo: true })
        await utils.exec(`./butler push ${sourceFolder} ${account}/${game}:${currentPlatformInfo.channel}`, { echo: true })
    } catch (e) {
        console.error(e.error);
        process.exit(e.code);
    }
}

main()
