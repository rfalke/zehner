"use strict";
var assert = require("assert");
var os = require("os");
var fs = require("fs");
var file_support = require("../file_support");

function rm_r(dir) {
    fs.readdirSync(dir).forEach(function (name) {
        name = dir + "/" + name;
        if (fs.statSync(name).isDirectory()) {
            rm_r(name);
        } else {
            fs.unlinkSync(name);
        }
    });
    fs.rmdirSync(dir);
}

describe('file support', function () {
    var tmpDir;

    beforeEach(function () {
        tmpDir = os.tmpdir() + "/testing_" + os.uptime();
        fs.mkdirSync(tmpDir);
    });
    afterEach(function () {
        rm_r(tmpDir);
    });
    it("simple write test", function () {
        file_support.write_response_to_file(tmpDir, "foobar", "http://www.example.com/abc/def.html?foo=bar");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/def.html?foo=bar").toString(), "foobar");
    });
    it("write test with port", function () {
        file_support.write_response_to_file(tmpDir, "foobar", "https://www.example.com:80/abc/def.html");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/def.html").toString(), "foobar");
    });
    it("write test without index.html", function () {
        file_support.write_response_to_file(tmpDir, "content1", "https://www.example.com:80/abc");
        file_support.write_response_to_file(tmpDir, "content2", "https://www.example.com:80/abc/def.html");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/index.html").toString(), "content1");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/def.html").toString(), "content2");
    });
    it("write test without index.html (reversed)", function () {
        file_support.write_response_to_file(tmpDir, "content1", "https://www.example.com:80/abc/def.html");
        file_support.write_response_to_file(tmpDir, "content2", "https://www.example.com:80/abc");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/def.html").toString(), "content1");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/index.html").toString(), "content2");
    });
    it("write test with alternative", function () {
        file_support.write_response_to_file(tmpDir, "content1", "https://www.example.com:80/abc/index.html/foo");
        file_support.write_response_to_file(tmpDir, "content2", "https://www.example.com:80/abc/");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/index.html/foo").toString(), "content1");
        assert.equal(fs.readFileSync(tmpDir + "/www.example.com/abc/index.html.alternative").toString(), "content2");
    });
});
