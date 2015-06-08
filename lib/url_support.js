'use strict';

var urls = require('url');
var paths = require('path');
var startsWith = require('./utils').startsWith;
var endsWith = require('./utils').endsWith;

function makeLinkAbsolute(baseUrl, url) {
    var result = urls.resolve(baseUrl, url);
    var parsed = urls.parse(result);
    parsed.hash = '';
    if (parsed.pathname === null) {
        // Will be sorted out later
        parsed.protocol = 'BAD';
    } else if (parsed.pathname !== '/' && endsWith(parsed.pathname, '/')) {
        parsed.pathname += 'DOT';
    }
    return urls.format(parsed);
}

function isSupportedUrl(url) {
    var javascriptScheme;
    // jscs:disable
    /* jshint ignore:start */
    javascriptScheme = 'javascript:';
    /* jshint ignore:end */
    // jscs:enable
    var isBadUrl = startsWith(url, 'mailto:') ||
        startsWith(url, javascriptScheme) ||
        startsWith(url, 'ftp:') ||
        startsWith(url, 'whatsapp:') ||
        startsWith(url, 'http:///') || url === '#';
    return !isBadUrl;
}

function isValidUrl(url) {
    return new RegExp('^(https?://)([a-zA-Z0-9-.]+)(:[0-9]+)?([^?]*)(.*)$', 'i').test(url);
}

function isInSubdir(startUrl, urlToTest) {
    var parsed1 = urls.parse(startUrl);
    var parsed2 = urls.parse(urlToTest);
    var key1 = parsed1.protocol + parsed1.host + paths.dirname(parsed1.pathname);
    var key2 = parsed2.protocol + parsed2.host + paths.dirname(parsed2.pathname);
    return key2.indexOf(key1) === 0;
}

function isSameHost(startUrl, urlToTest) {
    var parsed1 = urls.parse(startUrl);
    var parsed2 = urls.parse(urlToTest);
    var key1 = parsed1.protocol + parsed1.host;
    var key2 = parsed2.protocol + parsed2.host;
    return key1 === key2;
}

module.exports = {
    makeLinkAbsolute: makeLinkAbsolute,
    isSupportedUrl: isSupportedUrl,
    isValidUrl: isValidUrl,
    isInSubdir: isInSubdir,
    isSameHost: isSameHost
};
