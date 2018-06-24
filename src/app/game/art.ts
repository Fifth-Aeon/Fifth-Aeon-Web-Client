
import * as JSZip from 'jszip';
import * as JSZipUtils from 'jszip-utils';

export const cardArt = new Map<string, string>();

JSZipUtils.getBinaryContent('assets/card-art.zip', function (err, data) {
    if (err) {
        throw err; // or handle err
    }

    JSZip.loadAsync(data).then(function (zip) {
        zip.forEach(function (relativePath, zipEntry) {  // 2) print entries
            zipEntry.async('text').then(content => {
                // let newContent = 'data:image/svg+xml;base64,' + content;
                cardArt.set(zipEntry.name.replace('.svg', ''), content);
            });
        });
    });
});
