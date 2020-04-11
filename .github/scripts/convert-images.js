const fs = require("fs");
const path = require("path");
const utils = require("./utils");

const inputDir = "src/assets/svg";
const outputDir = "src/assets/png";

async function main() {
  if (fs.existsSync(outputDir)) {
    fs.rmdirSync(outputDir, {recursive: true});
  }
  fs.mkdirSync(outputDir);

  for (const fileName of fs.readdirSync(inputDir)) {
    console.log(fileName);
    if (!fileName.endsWith('.svg')) {
      continue;
    }
    const inputPath = inputDir + '/' + fileName
    const outputPath = outputDir + '/' + fileName.replace('.svg', '.png')
    try {
      await utils.exec(`inkscape --export-png=${outputPath} ${inputPath}`, {echo:true})
    } catch(e) {
      console.error(e.error);
      process.exit(e.code);
    }
  }
}


main()
