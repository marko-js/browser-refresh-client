/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const compiler = tryRequire("@marko/compiler");

if (compiler) {
  // when we have the Marko 5 compiler we enabled the browser refresh logic here.
  // in Marko 4 and below this logic existed within Marko itself.
  require('browser-refresh-client')
    .enableSpecialReload('*.marko marko.json marko-tag.json')
    .onFileModified(handleFileModified);
}


function handleFileModified(filename) {
  if (!fs.existsSync(filename)) {
    console.log(
      "[marko/hot-reload] WARNING cannot resolve template path: ",
      filename
    );
    return;
  }

  compiler.taglib.clearCaches();
  console.log(`[marko] File modified: ${cwdRelative(filename)}`);

  if (path.extname(filename) === ".json") {
    // If we taglib was modified then uncache *all* templates so that they will
    // all be reloaded
    for (const filename in require.cache) {
      if (path.extname(filename) === ".marko") {
        tryReload(filename);
      }
    }
  } else {
    tryReload(filename);
  }
};

function tryReload(filename) {
  try {
    delete require.cache[filename];
    require(filename);
    console.log(
      `[marko] Template successfully reloaded: ${cwdRelative(filename)}`
    );
  } catch (e) {
    console.error(e);
  }
}

function tryRequire(id) {
  let resolved;
  try {
    resolved = require.resolve(id);
  } catch (err) {
    return false;
  }

  return require(resolved);
}

function cwdRelative(filename) {
  return path.relative(process.cwd(), filename);
}
