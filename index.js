"use strict";

var download = require("./download");

var outputDir = process.argv[2];
var startUrl = process.argv[3];

console.log(process.argv);

var promise = download.downloadOneUrlWithRetry(outputDir, startUrl, 3);
promise.then(function (urls) {
        console.log("got " + urls.length + " url(s).");
    },
    function () {
        console.log("");
    });
