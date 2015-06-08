"use strict";

var urls = require("url");
var paths = require("path");
var startsWith = require("./utils").startsWith;
var endsWith = require("./utils").endsWith;

function make_link_absolute(baseUrl, url) {
    var result = urls.resolve(baseUrl, url);
    var parsed = urls.parse(result);
    parsed.hash = "";
    if (parsed.pathname === null) {
        // will be sorted out later
        parsed.protocol = "BAD";
    } else if (parsed.pathname !== "/" && endsWith(parsed.pathname, "/")) {
        parsed.pathname += "DOT";
    }
    return urls.format(parsed);
}

function is_supported_url(url) {
    var javascriptScheme;
    /* jshint ignore:start */
    javascriptScheme = "javascript:";
    /* jshint ignore:end */
    var is_bad_url = startsWith(url, "mailto:") || startsWith(url, javascriptScheme) || startsWith(url, "ftp:") || startsWith(url, "whatsapp:") || startsWith(url, "http:///") || url === "#";
    return !is_bad_url;
}

function is_valid_url(url) {
    return new RegExp("^(https?://)([a-zA-Z0-9-.]+)(:[0-9]+)?([^?]*)(.*)$", "i").test(url);
}

function is_in_subdir(start_url, url_to_test) {
    var parsed1 = urls.parse(start_url);
    var parsed2 = urls.parse(url_to_test);
    var key1 = parsed1.protocol + parsed1.host + paths.dirname(parsed1.pathname);
    var key2 = parsed2.protocol + parsed2.host + paths.dirname(parsed2.pathname);
    return key2.indexOf(key1) === 0;
}

function is_same_host(start_url, url_to_test) {
    var parsed1 = urls.parse(start_url);
    var parsed2 = urls.parse(url_to_test);
    var key1 = parsed1.protocol + parsed1.host;
    var key2 = parsed2.protocol + parsed2.host;
    return key1 === key2;
}

module.exports = {
    make_link_absolute: make_link_absolute,
    is_supported_url: is_supported_url,
    is_valid_url: is_valid_url,
    is_in_subdir: is_in_subdir,
    is_same_host: is_same_host
};
