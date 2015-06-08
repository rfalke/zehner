'use strict';

var urls = require('url');
var fs = require('fs');
var paths = require('path');
var endsWith = require('./utils').endsWith;

function isDir(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}
function isFile(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

function adjustFileName(fname) {
    if (endsWith(fname, '/')) {
        fname = fname + 'index.html';
        if (isDir(fname)) {
            fname += '.alternative';
        }
    } else {
        if (isDir(fname)) {
            fname += '/index.html';
        }
    }
    return fname;
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        ensureDir(paths.dirname(dir));
        fs.mkdirSync(dir);
    } else if (isDir(dir)) {
        // Nothing
    } else if (isFile(dir)) {
        fs.renameSync(dir, dir + '.tmp');
        fs.mkdirSync(dir);
        fs.renameSync(dir + '.tmp', dir + '/index.html');
    } else {
        throw new Error('Unexepected case for ' + dir);
    }
}

function ensureParentDirExists(fname) {
    ensureDir(paths.dirname(fname));
}

function writeFile(fname, content) {
    fs.writeFileSync(fname, content);
}

function writeResponseToFile(basePath, content, url) {
    var decomposed = urls.parse(url);
    var fname = basePath + '/' + decomposed.hostname + decomposed.path;
    var fname2 = adjustFileName(fname);
    ensureParentDirExists(fname2);
    var dir = paths.dirname(fname2);
    var name = paths.basename(fname2);
    var name2 = name.slice(0, 100);
    var fname3 = dir + '/' + name2;
    writeFile(fname3, content);
    return fname3;
}

module.exports = {
    writeResponseToFile: writeResponseToFile
};
