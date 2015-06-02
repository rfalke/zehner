"use strict";

var urls = require("url");
var fs = require("fs");
var paths = require("path");

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function isDir(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}
function isFile(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

function adjust_file_name(fname) {
    if (endsWith(fname, "/")) {
        fname = fname + "index.html";
        if (isDir(fname)) {
            fname += ".alternative";
        }
    } else {
        if (isDir(fname)) {
            fname += "/index.html";
        }
    }
    return fname;
}

function ensure_dir(dir) {
    if (!fs.existsSync(dir)) {
        ensure_dir(paths.dirname(dir));
        fs.mkdirSync(dir);
    } else if (isDir(dir)) {
        // nothing
    } else if (isFile(dir)) {
        fs.renameSync(dir, dir + ".tmp");
        fs.mkdirSync(dir);
        fs.renameSync(dir + ".tmp", dir + "/index.html");
    } else {
        throw new Error("Unexepected case for " + dir);
    }
}

function ensure_parent_dir_exists(fname) {
    ensure_dir(paths.dirname(fname));
}

function write_file(fname, content) {
    fs.writeFileSync(fname, content);
}

function write_response_to_file(basePath, content, url) {
    var decomposed = urls.parse(url, true);
    var fname = basePath + "/" + decomposed.hostname + decomposed.path;
    var fname2 = adjust_file_name(fname);
    ensure_parent_dir_exists(fname2);
    var dir = paths.dirname(fname2);
    var name = paths.basename(fname2);
    var name2 = name.slice(0, 100);
    var fname3 = dir + "/" + name2;
    write_file(fname3, content);
    return fname3;
}

module.exports = {
    write_response_to_file: write_response_to_file
};
