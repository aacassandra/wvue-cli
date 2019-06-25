import arg from "arg";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import execa from "execa";
import shell from "shelljs";
import pretty from "pretty";
import fs from "fs";
import pkg from "../package.json";
import isValidDomain from "is-valid-domain";
import {onCreateQuestions} from "../questions/onCreate";
import {onCreateProject} from "../arguments/onCreate";
import {onPlugin, onPlatform} from "../arguments/onCordova";
import {onRunQuestions} from "../questions/onRun";
import {onRunServe} from "../arguments/onRun";
import {readFile, createFile, xmlFileToJs, jsToXmlFile} from "../actions";
const CLI = require("clui");
const Spinner = CLI.Spinner;

let Danger = "#852222";
let Success = "#228564";
let Info = "#327a9e";
let opt = {};

function checkProjectDirectories(modeDefault = true) {
  return new Promise(async (resolve, reject) => {
    let contents = await readFile("tsconfig.json");
    if (!contents.finded) {
      contents = await readFile("jsconfig.json");
      if (!contents.finded) {
        console.log(chalk.hex(Danger)("Outside wvue project directory"));
        process.exit();
        resolve(false);
      }
    }

    if (modeDefault == true) {
      if (contents.finded) {
        let wvue = contents.value.search("wvue");
        let res = contents.value.substring(wvue, wvue + 4);
        if (res == "wvue") {
          console.log(chalk.hex(Success)("Inside wvue project directory"));
        } else {
          console.log(chalk.hex(Danger)("Outside wvue project directory"));
        }
        console.log("    ");
      } else {
        console.log(chalk.hex(Danger)("Outside wvue project directory"));
        console.log("    ");
      }
      resolve(true);
    } else {
      if (!contents.finded) {
        console.log(chalk.hex(Danger)("Outside wvue project directory"));
        resolve(false);
      } else {
        let wvue = contents.value.search("wvue");
        let res = contents.value.substring(wvue, wvue + 4);
        if (res == "wvue") {
          resolve(true);
        } else {
          console.log(chalk.hex(Danger)("Outside wvue project directory"));
          resolve(false);
        }
      }
    }
  });
}

function OnHelp() {
  console.log("opt");
  console.log(
    chalk.hex(Info)("  -v, --version"),
    "............................ Output the version number"
  );
  console.log(
    chalk.hex(Info)("  -h, --help"),
    "............................... Output usage information"
  );
  console.log("    ");
  console.log("Global Commands");
  console.log(
    chalk.hex(Info)("  create <app-name> <app-domain>"),
    "........... Create a new project with app-domain for optional"
  );
  console.log(
    chalk.hex(Info)("  run <mode>"),
    "............................... Run mode as (build, package, installer or launcher)"
  );
  console.log("    ");
  console.log("Examples");
  console.log(chalk.hex(Info)("  wvue create myApp org.apache.cordova.myApp"));
  console.log(chalk.hex(Info)("  wvue run build"));
  console.log(chalk.hex(Info)("  wvue run package"));
  console.log(chalk.hex(Info)("  wvue run installer"));
  console.log(chalk.hex(Info)("  wvue run launcher"));
  return;
}

async function arg00() {
  clear();
  console.log(
    chalk.hex(Info)(
      figlet.textSync("wvue", {
        horizontalLayout: "full"
      })
    )
  );
  console.log("Vue CLI for LG-WebOS Project");
  console.log("    ");
  await OnHelp();
  console.log("    ");
  await checkProjectDirectories();

  // await xmlFileToJs("config.xml", async function(err, obj) {
  //   if (err) throw err;
  //   // console.log(JSON.stringify(obj, null, 2));
  //   createFile("config.json", obj, true, true);
  // });
}

function arg01(arg1) {
  if (arg1 == "create") {
    console.log(
      chalk.hex(Danger)("wvue create <app-name> <app-domain:optional>")
    );
  } else if (arg1 == "platform") {
    console.log(
      chalk.hex(Danger)("wvue platform <action:add/rm> <os:android/ios>")
    );
  } else if (arg1 == "plugin") {
    console.log(
      chalk.hex(Danger)("wvue plugin <action:add/rm> <cordova-plugin-name>")
    );
  } else if (arg1 == "run") {
    console.log(chalk.hex(Danger)("wvue run <opt:android,ios,serve>"));
  } else if (arg1 == "build") {
    console.log(chalk.hex(Danger)("wvue build <os:android/ios>"));
  } else if (arg1 == "prepare") {
    console.log(chalk.hex(Danger)("wvue prepare <os:android/ios>"));
  } else if (arg1 == "--version" || arg1 == "-v") {
    console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
  } else if (arg1 == "--help" || arg1 == "-h") {
    OnHelp();
  } else {
    console.log(
      chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
    );
  }
}

async function arg02(arg1, arg2) {
  if (arg1 == "create") {
    if (arg2 != null || arg2 != undefined || arg2 != "") {
      opt = {
        ...opt,
        mode: arg1,
        name: arg2,
        targetRoot: process.cwd(),
        targetDirectory: process.cwd() + "/" + arg2
      };
      process.stdout.write("\x1Bc");
      console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
      let res = await onCreateQuestions(opt);
      // console.log(res);
      let res2 = await onCreateProject(res);
    }
  } else if (arg1 == "plugin") {
    if (arg2 == "add") {
      console.log(chalk.hex(Danger)("wvue plugin add <cordova-plugin-name>"));
    } else if (arg2 == "rm") {
      console.log(chalk.hex(Danger)("wvue plugin rm <cordova-plugin-name>"));
    } else {
      console.log(
        chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
      );
    }
  } else if (arg1 == "platform") {
    if (arg2 == "add") {
      console.log(
        chalk.hex(Danger)("wvue plugin add <os:android,ios,browser>")
      );
    } else if (arg2 == "rm") {
      console.log(chalk.hex(Danger)("wvue plugin rm <os:android,ios,browser>"));
    } else {
      console.log(
        chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
      );
    }
  } else if (arg1 == "run") {
    let check = await checkProjectDirectories(false);
    if (check != false) {
      if (arg2 == "build") {
        process.stdout.write("\x1Bc");
        console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
        //begin:: update version
        let pkgJson = await readFile("package.json");
        pkgJson = JSON.parse(pkgJson.value);

        let appInfo = await readFile("public/appinfo.json");
        appInfo = JSON.parse(appInfo.value);
        appInfo.version = pkgJson.version;
        createFile("public/appinfo.json", appInfo, true, true);
        //end:: update version

        await shell.exec("npm run build");
        let readHtml = await readFile("webos/index.html");
        readHtml = await pretty(readHtml.value);
        await createFile("webos/index.html", readHtml, false, false);
        console.log(chalk.hex(Success)("Build has successfully"));
      } else if (arg2 == "package") {
        process.stdout.write("\x1Bc");
        let json = await readFile("webos/appinfo.json");
        if (json.finded) {
          console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
          const status = new Spinner("Creating package, please wait...");
          status.start();
          const result = await execa("ares-package", ["webos"], {
            cwd: process.cwd()
          });
          if (result.failed) {
            console.log(
              chalk.hex(Danger)("Failed to create package of webos project")
            );
            status.stop();
            process.exit();
          } else {
            json = JSON.parse(json.value);
            let appDomain = json.id;
            let appVersion = json.version;
            status.stop();
            console.log(chalk.hex(Success)("Package has successfully created"));
            console.log(
              chalk.yellow(appDomain + "_" + appVersion + "_all.ipk")
            );
          }
        } else {
          console.log(
            chalk.hex(Danger)(
              "webos directory not found, please run the command bellow"
            )
          );
          console.log(chalk.yellow("wvue run build"));
        }
      } else if (arg2 == "installer") {
        // process.stdout.write("\x1Bc");
        let json = await readFile("webos/appinfo.json");
        if (json.finded) {
          console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
          json = JSON.parse(json.value);
          let appDomain = json.id;
          let appVersion = json.version;
          let fileName = appDomain + "_" + appVersion + "_all.ipk";
          let checkFile = await readFile(fileName);
          if (!checkFile.finded) {
            console.log(
              chalk.hex(Danger)(
                "WebOS project package not found, please run the command bellow"
              )
            );
            console.log(chalk.yellow("wvue run package"));
            process.exit();
            return;
          }
          const status = new Spinner("Installing package, please wait...");
          status.start();

          let err;
          try {
            await execa.shell("ares-install " + fileName);
          } catch (error) {
            err = error;
          }

          if (err) {
            status.stop();
            console.log(
              chalk.hex(Danger)(
                err.stderr + "And make sure your emulator is opened."
              )
            );
          } else {
            status.stop();
            console.log(
              chalk.hex(Success)("Package has successfully installed")
            );
          }
          process.exit();
        } else {
          console.log(
            chalk.hex(Danger)(
              "webos directory not found, please run the command bellow"
            )
          );
          console.log(chalk.yellow("wvue run build"));
        }
      } else if (arg2 == "launcher") {
        // process.stdout.write("\x1Bc");
        let json = await readFile("webos/appinfo.json");
        if (json.finded) {
          console.log(chalk.hex(Info)("wvue CLI v" + pkg.version));
          json = JSON.parse(json.value);
          let appDomain = json.id;
          const status = new Spinner("Installing package, please wait...");
          status.start();

          let err;
          try {
            await execa.shell("ares-launch " + appDomain);
          } catch (error) {
            err = error;
          }

          if (err) {
            status.stop();
            console.log(
              chalk.hex(Danger)(
                err.stderr + "And make sure your package has installed."
              )
            );
          } else {
            status.stop();
            console.log(
              chalk.hex(Success)("Package has successfully launched")
            );
          }
          process.exit();
        } else {
          console.log(
            chalk.hex(Danger)(
              "webos directory not found, please run the command bellow"
            )
          );
          console.log(chalk.yellow("wvue run build"));
        }
      } else {
        console.log(
          chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
        );
      }
    }
  } else if (arg1 == "build") {
    if (arg2 == "android") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "ios") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "browser") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "serve") {
      console.log("wvue " + arg1 + " " + arg2);
    } else {
      console.log(
        chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
      );
    }
  } else if (arg1 == "prepare") {
    if (arg2 == "android") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "ios") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "browser") {
      console.log("wvue " + arg1 + " " + arg2);
    } else if (arg2 == "serve") {
      console.log("wvue " + arg1 + " " + arg2);
    } else {
      console.log(
        chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
      );
    }
  } else if (arg1 == "cordova") {
    if (arg2 == "resources") {
      let check = await checkProjectDirectories(false);
      if (check != false) {
        try {
          await execa.shell("ionic cordova resources");
        } catch (err) {
          if (
            err.stderr ==
            "[ERROR] No platforms detected. Please run: ionic cordova platform add\n"
          ) {
            console.log(
              chalk.hex(Danger)(
                "No platforms detected. Please run: wvue platform add'"
              )
            );
          }
        }
      }
      // console.log(check2);
    }
  } else {
    console.log(
      chalk.hex(Danger)("wvue command not found, please read 'wvue --help'")
    );
  }
}

async function arg03(arg1, arg2, arg3) {
  if (arg1 == "create") {
    if (arg2 != null || arg2 != undefined || arg2 != "") {
      if (arg3 != null || arg3 != undefined || arg3 != "") {
        let appDomainChecking = isValidDomain(arg3);
        if (appDomainChecking == true) {
          console.log("wvue " + arg1 + " " + arg2 + " " + arg3);
        } else {
          console.log(chalk.hex(Danger)("wvue <app-domain> is invalid"));
        }
      }
    }
  } else if (arg1 == "plugin") {
    if (arg2 == "add") {
      await onPlugin(arg2, arg3);
    } else if (arg2 == "rm") {
      await onPlugin(arg2, arg3);
    }
  } else if (arg1 == "platform") {
    if (arg2 == "add") {
      if (arg3 == "android") {
        await onPlatform(arg2, arg3);
      } else if (arg3 == "ios") {
        await onPlatform(arg2, arg3);
      } else if (arg3 == "browser") {
        await onPlatform(arg2, arg3);
      }
    } else if (arg2 == "rm") {
      if (arg3 == "android") {
        await onPlatform(arg2, arg3);
      } else if (arg3 == "ios") {
        await onPlatform(arg2, arg3);
      } else if (arg3 == "browser") {
        await onPlatform(arg2, arg3);
      }
    }
  } else {
    console.log(
      chalk.hex(Danger)("wvue commands is invalid, please read 'wvue --help'")
    );
  }
}

function arg04(arg1, arg2, arg3, arg4) {
  if (arg1 == "create") {
    console.log(
      chalk.hex(Danger)(
        "wvue create argument is invalid, please read 'wvue --help'"
      )
    );
  } else if (arg1 == "plugin") {
    console.log(
      chalk.hex(Danger)(
        "wvue plugin argument is invalid, please read 'wvue --help'"
      )
    );
  } else if (arg1 == "platform") {
    console.log(
      chalk.hex(Danger)(
        "wvue platform argument is invalid, please read 'wvue --help'"
      )
    );
  } else {
    console.log(
      chalk.hex(Danger)("wvue commands is invalid, please read 'wvue --help'")
    );
  }
}

function argumentsController(rawArgs) {
  let args = rawArgs.slice(2);
  let length = args.length;
  if (length == 0) {
    arg00();
  } else if (length == 1) {
    arg01(args[0]);
  } else if (length == 2) {
    arg02(args[0], args[1]);
  } else if (length == 3) {
    arg03(args[0], args[1], args[2]);
  } else if (length == 4) {
    arg04(args[0], args[1], args[2], args[3]);
  }
}

export function cli(args) {
  argumentsController(args);
}
