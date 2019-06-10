import fs from "fs";
import ncp from "ncp";
import {promisify} from "util";
const copy = promisify(ncp);
import execa from "execa";
import replace from "replace";
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;

export async function textStringify(json, beautify = false) {
  let res;
  return new Promise((resolve, reject) => {
    if (beautify == true) {
      res = JSON.stringify(json, null, 2);
      resolve(res);
    } else {
      res = JSON.stringify(json);
      resolve(res);
    }
  });
}

export async function createFile(
  fileName,
  fileValue,
  stringify = false,
  beautify = false
) {
  return new Promise(async (resolve, reject) => {
    if (beautify == false) {
      fs.writeFile(
        fileName,
        stringify == false ? fileValue : await textStringify(fileValue, false),
        function(err) {
          if (err) {
            console.log(err);
            reject(true);
          } else {
            resolve(true);
          }
        }
      );
    } else {
      fs.writeFile(
        fileName,
        stringify == false ? fileValue : await textStringify(fileValue, true),
        function(err) {
          if (err) {
            console.log(err);
            reject(true);
          } else {
            resolve(true);
          }
        }
      );
    }
  });
}

export async function copyDirectories(templateDirectory, targetDirectory) {
  return copy(templateDirectory, targetDirectory, {
    clobber: false
  });
}

export function copyFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.copyFile(source, destination, err => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

export function Waiter(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve(true);
    }, ms);
  });
}

export function renameFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.rename(source, destination, err => {
      if (err) {
        throw console.log(err);
        reject(true);
      } else {
        resolve(true);
      }
    });
  });
}

export async function removeFile(source) {
  return new Promise((resolve, reject) => {
    fs.unlink(source, err => {
      if (err) {
        console.error(err);
        reject(true);
      } else {
        resolve(true);
      }
    });
  });
}

export async function contentReplace(someFile, targetContent, replacement) {
  replace({
    regex: targetContent,
    replacement: replacement,
    paths: [someFile],
    recursive: true,
    silent: true
  });
}

export async function readFile(source, mode = "utf8") {
  return new Promise((resolve, reject) => {
    let sts = {};
    fs.readFile(source, mode, function(err, contents) {
      if (err) {
        sts = {
          finded: false,
          value: err
        };
        resolve(sts);
      } else {
        sts = {
          finded: true,
          value: contents
        };
        resolve(sts);
      }
    });
  });
}

export async function xmlFileToJs(filename, cb) {
  let xmlStr = await readFile(filename);
  xml2js.parseString(xmlStr.value, {}, cb);
}

export async function jsToXmlFile(filename, obj) {
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(obj);
  createFile(filename, xml, false, false);
}

export async function jsFileToHtml(json) {
  return json2html(json);
}

export async function htmlFileToJs(fileJs) {
  let htmlStr;
  htmlStr = html2json(fileJs);
  return htmlStr;
}
