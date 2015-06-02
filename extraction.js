"use strict";

var url_support = require("./url_support");

function uniq(a) {
    return a.sort().filter(function (item, pos, ary) {
        return !pos || item !== ary[pos - 1];
    });
}

function extract_links(baseUrl, content) {
    function inner(pattern) {
        var match, matches = [];
        while ((match = pattern.exec(content)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }

    var raw_list = inner(/(?:src)=\"([^\"]+)\"/gi).concat(inner(/(?:href)=\"([^\"]+)\"/gi)).concat(inner(/(?:background)=\"([^\"]+)\"/gi));
    var filtered = raw_list.filter(function (url) {
        return url_support.is_supported_url(url);
    });
    var unsupported = raw_list.filter(function (url) {
        return !url_support.is_supported_url(url);
    });
    var absolute = filtered.map(function (url) {
        return url_support.make_link_absolute(baseUrl, url);
    });
    unsupported = unsupported.concat(absolute.filter(function (url) {
        return !url_support.is_valid_url(url);
    }));
    if (unsupported.length > 0) {
        console.log("Ignore bad links: ", unsupported);
    }
    var filtered2 = absolute.filter(function (url) {
        return url_support.is_valid_url(url);
    });

    //noinspection UnnecessaryLocalVariableJS
    var sorted_and_without_duplicates = uniq(filtered2);
    return sorted_and_without_duplicates;
}

module.exports = {
    extract_links: extract_links
};
