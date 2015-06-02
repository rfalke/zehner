"use strict";

var requests = require('request');
var file_support = require("./file_support");
var outputDir = process.argv[2];
var startUrl = process.argv[3];

console.log(process.argv);

function downloadOneUrl(outputDir, url) {
    requests(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            file_support.write_response_to_file(outputDir, body, url);
        }
    });
}
downloadOneUrl(outputDir, startUrl);
