"use strict";

var requests = require('request');
var file_support = require("./file_support");
var extraction = require("./extraction");
var outputDir = process.argv[2];
var startUrl = process.argv[3];

console.log(process.argv);

function downloadOneUrl(outputDir, url) {
    requests(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var fname = file_support.write_response_to_file(outputDir, body, url);
            console.log("Wrote " + fname);
            var links = extraction.extract_links(url, body);
            console.log("Got the following links:");
            console.log(links);
        }
    });
}
downloadOneUrl(outputDir, startUrl);
