"use strict";

var urls = require("url");
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

module.exports = {
    make_link_absolute: make_link_absolute,
    is_supported_url: is_supported_url,
    is_valid_url: is_valid_url
};
