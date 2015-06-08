'use strict';

var urlsupport = require('./url_support');
var sortAndUniq = require('./utils').sortAndUniq;
var verbose = false;

function extractLinks(baseUrl, content) {
    function inner(pattern) {
        var match;
        var matches = [];
        while ((match = pattern.exec(content)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }

    var rawList = inner(/(?:src)=\"([^\"]+)\"/gi).
        concat(inner(/(?:href)=\"([^\"]+)\"/gi)).
        concat(inner(/(?:background)=\"([^\"]+)\"/gi));
    var filtered = rawList.filter(function (url) {
        return urlsupport.isSupportedUrl(url);
    });
    var unsupported = rawList.filter(function (url) {
        return !urlsupport.isSupportedUrl(url);
    });
    var absolute = filtered.map(function (url) {
        return urlsupport.makeLinkAbsolute(baseUrl, url);
    });
    unsupported = unsupported.concat(absolute.filter(function (url) {
        return !urlsupport.isValidUrl(url);
    }));
    if (unsupported.length > 0 && verbose) {
        console.log('Ignore bad links: ', unsupported);
    }
    var filtered2 = absolute.filter(function (url) {
        return urlsupport.isValidUrl(url);
    });

    return sortAndUniq(filtered2);
}

module.exports = {
    extractLinks: extractLinks
};
