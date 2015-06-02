"use strict";

var requests = require('request');
var file_support = require("./file_support");
var extraction = require("./extraction");
var outputDir = process.argv[2];
var startUrl = process.argv[3];

console.log(process.argv);

function startsWith(str, suffix) {
    return str.indexOf(suffix) === 0;
}

function downloadOneUrl(outputDir, url) {
    function reportError(error) {
        console.log("Got an error while downloading " + url + ": " + error);
    }

    function reportBadStatus(statusCode) {
        console.log("Got the status code " + statusCode + " instead of the expected 200 while downloading " + url);
    }

    function reportBadDns() {
        console.log("Failed to download " + url + " because the host name is unknown.");
    }

    requests(url, function (error, response, body) {
        if (error) {
            reportError(error);
        } else if (response.statusCode !== 200) {
            reportBadStatus(response.statusCode);
        } else if (startsWith(response.request.href, "http://navigationshilfe1.t-online.de/dnserror?")) {
            reportBadDns();
        } else {
            var fname = file_support.write_response_to_file(outputDir, body, url);
            console.log("Wrote " + fname);
            var links = extraction.extract_links(url, body);
            console.log("Got the following links:");
            console.log(links);
        }
    });
}
downloadOneUrl(outputDir, startUrl);
