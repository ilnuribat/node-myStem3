#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp');
const request = require('request');
const tar = require('tar');
const extractZip = require('extract-zip');
const { rimraf } = require('rimraf');
const https = require('https');
const http = require('http');


const TARBALL_URLS = {
  linux: {
    ia32: 'https://download.cdn.yandex.net/mystem/mystem-3.0-linux3.5-32bit.tar.gz',
    x64:  'http://download.cdn.yandex.net/mystem/mystem-3.1-linux-64bit.tar.gz',
  },
  darwin: {
    x64: 'http://download.cdn.yandex.net/mystem/mystem-3.1-macosx.tar.gz',
  },
  win32: {
    ia32: 'https://download.cdn.yandex.net/mystem/mystem-3.0-win7-32bit.zip',
    x64: 'http://download.cdn.yandex.net/mystem/mystem-3.1-win-64bit.zip',
  },
  freebsd: {
    x64: 'https://download.cdn.yandex.net/mystem/mystem-3.0-freebsd9.0-64bit.tar.gz',
  },
};

async function downloadFile(url, dest) {
  console.log('Downloading %s', url);

  const protocol = url.startsWith('https') ? https : http;
  const ws = fs.createWriteStream(dest);

  await new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      if ([301, 302].includes(res.statusCode)) {
        return downloadFile(res.headers.location, dest)
          .then(resolve)
          .catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(`http(s) error: code ${res.statusCode}`);
      }

      res.pipe(ws);
      res.on('error', (...e) => {
        console.log('request error', e);
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        reject();
      });

      ws.on('finish', () => {
        ws.close();
        console.log('downloaded');
        resolve();
      });
    });
  });
}

async function extractFile(isZip, src, dest) {
  console.log('Extracting %s to %s', src, dest);

  if (isZip) {
    await extractZip(src, { dir: dest });
  } else {
    await tar.extract({ file: src,  cwd: dest }, null);
  }
}

async function main() {
  const targetDir = path.join(__dirname, '..', 'vendor', process.platform);
  const tmpFile = path.join(targetDir, 'mystem.tar.gz');
  const url = TARBALL_URLS[process.platform][process.arch];
  const isZip = url.match(/\.zip$/);

  console.log('Cleanup targetDir [%s]', targetDir);
  await rimraf.sync(targetDir);

  await mkdirp(targetDir);

  await downloadFile(url, tmpFile);

  await extractFile(isZip, tmpFile, targetDir);

  console.log('Unlink', tmpFile);
  await fs.promises.unlink(tmpFile).catch((e) => err(e));
  console.log(`$tmpFile was deleted`);
}

main().catch((e) => {
  console.log(e);

  process.exit(1);
});
