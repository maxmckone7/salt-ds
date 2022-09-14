const watch = require("watch");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const del = require("del");
const sass = require("sass");

function buildStyles(entry) {
  const sourceFileName = path.basename(entry);
  const outputFileName = sourceFileName.replace(/\.scss$/, ".css");
  const outputFolder = path.join(
    __dirname,
    "../../../dist/jpmorganchase-uitk-ag-grid-theme"
  );
  const outputName = path.join(outputFolder, sourceFileName);
  del.sync([outputName], { force: true });
  const result = sass.compile(entry, {
    // https://sass-lang.com/documentation/js-api/interfaces/FileImporter
    importers: [
      {
        // An importer that redirects relative URLs starting with "~" to
        // `node_modules`.
        findFileUrl(url) {
          if (!url.startsWith("~")) return null;

          const nonPrefixedUrl = url.substring(1);
          const resolvedFile = require.resolve(
            nonPrefixedUrl.substring(0, nonPrefixedUrl.indexOf("/"))
          );
          const fileUrl = pathToFileURL(
            resolvedFile.substring(0, resolvedFile.indexOf("node_modules") + 13)
          );

          return new URL(nonPrefixedUrl, fileUrl);
        },
      },
    ],
  });

  const resultCSS =
    `/**** Auto generated by packages/ag-grid-theme/scripts/build.js ****/\n\n` +
    result.css;

  fs.mkdirSync(outputFolder, { recursive: true });
  fs.writeFileSync(path.join(__dirname, "..", outputFileName), resultCSS);
  fs.writeFileSync(path.join(outputFolder, outputFileName), resultCSS);

  fs.copyFileSync(
    path.resolve(__dirname, "../package.json"),
    path.join(outputFolder, "package.json")
  );
}

const entry = path.resolve(__dirname, "../css/uitk-ag-theme.scss");

function tryBuildStyles() {
  try {
    buildStyles(entry);
    console.log(`Done`);
  } catch (exc) {
    console.error(exc);
  }
}

console.log(`Building "${entry}"`);
tryBuildStyles();

let isWatch = false;
process.argv.forEach((p) => {
  if (p === "--watch") {
    isWatch = true;
  }
});

if (isWatch) {
  watch.createMonitor(path.resolve(__dirname, "../css/"), function (monitor) {
    monitor.on("changed", function (f, curr, prev) {
      console.log(`"${f}" changed. Rebuilding "${entry}"`);
      tryBuildStyles();
    });
  });
}