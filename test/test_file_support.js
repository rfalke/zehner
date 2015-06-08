'use strict';

var assert = require('assert');
var os = require('os');
var fs = require('fs');
var filesupport = require('../lib/file_support');

function recursiveRm(dir) {
    fs.readdirSync(dir).forEach(function (name) {
        name = dir + '/' + name;
        if (fs.statSync(name).isDirectory()) {
            recursiveRm(name);
        } else {
            fs.unlinkSync(name);
        }
    });
    fs.rmdirSync(dir);
}

describe('file support', function () {
    var tmpDir;

    beforeEach(function () {
        tmpDir = os.tmpdir() + '/testing_' + os.uptime();
        fs.mkdirSync(tmpDir);
    });
    afterEach(function () {
        recursiveRm(tmpDir);
    });
    it('simple write test', function () {
        filesupport.writeResponseToFile(tmpDir, 'foobar', 'http://www.example.com/abc/def.html?foo=bar');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/def.html?foo=bar').toString(), 'foobar');
    });
    it('write test with port', function () {
        filesupport.writeResponseToFile(tmpDir, 'foobar', 'https://www.example.com:80/abc/def.html');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/def.html').toString(), 'foobar');
    });
    it('write test without index.html', function () {
        filesupport.writeResponseToFile(tmpDir, 'content1', 'https://www.example.com:80/abc');
        filesupport.writeResponseToFile(tmpDir, 'content2', 'https://www.example.com:80/abc/def.html');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/index.html').toString(), 'content1');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/def.html').toString(), 'content2');
    });
    it('write test without index.html (reversed)', function () {
        filesupport.writeResponseToFile(tmpDir, 'content1', 'https://www.example.com:80/abc/def.html');
        filesupport.writeResponseToFile(tmpDir, 'content2', 'https://www.example.com:80/abc');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/def.html').toString(), 'content1');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/index.html').toString(), 'content2');
    });
    it('write test with alternative', function () {
        filesupport.writeResponseToFile(tmpDir, 'content1', 'https://www.example.com:80/abc/index.html/foo');
        filesupport.writeResponseToFile(tmpDir, 'content2', 'https://www.example.com:80/abc/');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/index.html/foo').toString(), 'content1');
        assert.equal(fs.readFileSync(tmpDir + '/www.example.com/abc/index.html.alternative').toString(), 'content2');
    });
});
