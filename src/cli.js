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

let Danger = "#852222";
let Success = "#228564";
let opt = {};

function checkProjectDirectories(modeDefault = true) {
  return new Promise(async (resolve, reject) => {
    let contents = await readFile("tsconfig.json");
    if (!contents.finded) {
      contents = await readFile("jsconfig.json");
      if (!contents.finded) {
        console.log(chalk.hex(Danger)("Outside wvue project directory"));
        console.log("    ");
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
    chalk.hex(Success)("  -v, --version"),
    "............................ Output the version number"
  );
  console.log(
    chalk.hex(Success)("  -h, --help"),
    "............................... Output usage information"
  );
  console.log("    ");
  console.log("Global Commands");
  console.log(
    chalk.hex(Success)("  create <app-name> <app-domain>"),
    "........... Create a new project with app-domain for optional"
  );
  console.log(
    chalk.hex(Success)("  plugin <action> <plugin-name>"),
    "............ Manage project plugins"
  );
  console.log(
    chalk.hex(Success)("  platform <action> <os>"),
    "................... Manage project platform"
  );
  console.log(
    chalk.hex(Success)("  run <os>"),
    "................................. Run project (include prepaire & compile)"
  );
  console.log(
    chalk.hex(Success)("  build <os>"),
    "............................... Project prepare & compile"
  );
  console.log(
    chalk.hex(Success)("  prepare <os>"),
    "............................. Copy files into platform(s) for building"
  );
  console.log("    ");
  console.log("Examples");
  console.log(
    chalk.hex(Success)("  wvue create myApp org.apache.cordova.myApp")
  );
  console.log(chalk.hex(Success)("  wvue plugin add cordova-plugin-camera"));
  console.log(chalk.hex(Success)("  wvue plugin rm cordova-plugin-camera"));
  console.log(chalk.hex(Success)("  wvue platform add android"));
  console.log(chalk.hex(Success)("  wvue platform rm android"));
  console.log(chalk.hex(Success)("  wvue run android"));
  console.log(chalk.hex(Success)("  wvue run serve"));
  console.log(chalk.hex(Success)("  wvue build android"));
  return;
}

async function arg00() {
  clear();
  console.log(
    chalk.hex("#5BB984")(
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
    console.log(chalk.hex(Success)("wvue CLI v" + pkg.version));
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
      console.log(chalk.hex(Success)("wvue CLI v" + pkg.version));
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
        console.log(chalk.hex(Success)("wvue CLI v" + pkg.version));
        await shell.exec("npm run build");
        let readHtml = await readFile("webos/index.html");
        readHtml = await pretty(readHtml.value);
        await createFile("webos/index.html", readHtml, false, false);
        console.log(chalk.hex(Success)("Build has successfully"));
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
