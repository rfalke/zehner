"use strict";

var urls = require("url");

function startsWith(str, suffix) {
    return str.indexOf(suffix) === 0;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function make_link_absolute(baseUrl, url) {
    var result = urls.resolve(baseUrl, url);
    var parsed = urls.parse(result, true);
    parsed.hash = "";
    if (parsed.pathname !== "/" && endsWith(parsed.pathname, "/")) {
        parsed.pathname += "DOT";
    }
    return urls.format(parsed);
}

function is_supported_url(url) {
    var javascriptScheme;
    /* jshint ignore:start */
    javascriptScheme = "javascript:";
    /* jshint ignore:end */
    var is_bad_url = startsWith(url, "mailto:") || startsWith(url, javascriptScheme) || startsWith(url, "ftp:") || startsWith(url, "http:///") || url === "#";
    return !is_bad_url;
}

function is_valid_url(url) {
    return new RegExp("^(https?://)([a-zA-Z0-9-.]+)(:[0-9]+)?([^?]*)(.*)$", "i").test(url);
}

module.exports = {
    make_link_absolute: make_link_absolute,
    is_supported_url: is_supported_url,
    is_valid_url: is_valid_url
};
