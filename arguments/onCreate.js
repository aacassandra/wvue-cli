import chalk from "chalk";
import fs from "fs";
import xml2js from "xml2js";
import ncp from "ncp";
import path from "path";
import {promisify} from "util";
import execa from "execa";
import shell from "shelljs";
import pkg from "../json/package.json";
import Listr from "listr";
import pretty from "pretty";
import {projectInstall} from "pkg-install";
const access = promisify(fs.access);
const copy = promisify(ncp);

import {
  readFile,
  createFile,
  copyDirectories,
  Waiter,
  copyFile,
  removeFile,
  renameFile,
  contentReplace,
  xmlFileToJs,
  jsToXmlFile,
  htmlFileToJs,
  jsFileToHtml
} from "../actions";

let VirtualConfig = [];

async function initGit(opt) {
  // await Waiter(1000);
  await copyFile(
    opt.templateDirectory + "/.gitignore",
    opt.targetDirectory + "/.gitignore"
  );
  const result = await execa("git", ["init"], {
    cwd: opt.targetDirectory
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  return;
}

export async function initWebOS(opt) {
  // await Waiter(3000);ares-generate -t basic first-app
  // let id = opt
  let cmd =
    "{'id':'" +
    opt.domain +
    "', 'version':'" +
    opt.version +
    "', 'title':'" +
    opt.name +
    "'}";
  shell.exec("mkdir " + opt.name);
  const result = await execa(
    "ares-generate",
    ["-t", "basic", "-p", cmd, "webos"],
    {
      cwd: opt.targetDirectory
    }
  );
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize cordova project"));
  }

  let readHtml = await readFile(opt.targetDirectory + "/webos/index.html");
  let htmlStr2 = readHtml;
  let res = await htmlFileToJs(readHtml.value);
  let htmlStr = res;

  let htmlStrsArr = [];
  for (let i = 0; i < htmlStr.child[0].child.length; i++) {
    if (htmlStr.child[0].child[i].tag) {
      if (htmlStr.child[0].child[i].tag == "head") {
        htmlStr.child[0].child[i].child.forEach((item, index) => {
          if (item.tag) {
            if (item.tag == "style") {
              htmlStr.child[0].child[i].child.splice(index, 2);
            }
          }
        });

        let uSplice = false;
        for (let u = 0; u < htmlStr.child[0].child[i].child.length; u++) {
          if (u == 0) {
            if (htmlStr.child[0].child[i].child[u].node == "text") {
              uSplice = true;
            }
          } else {
            if (uSplice == true) {
              if (htmlStr.child[0].child[i].child[u].node != "text") {
                VirtualConfig.push({node: "text", text: "\t"});
                VirtualConfig.push(htmlStr.child[0].child[i].child[u]);
                uSplice = false;
              }
            } else {
              VirtualConfig.push(htmlStr.child[0].child[i].child[u]);
            }
          }
        }
      }
    }
  }

  await execa("rm", ["webos/index.html"], {
    cwd: opt.targetDirectory
  });

  await execa("cp", ["-R", "webos/.", "public/"], {
    cwd: opt.targetDirectory
  });

  await execa("rm", ["-rf", "webos"], {
    cwd: opt.targetDirectory
  });
  // htmlStr2 = htmlStr2.value.replace(
  //   /<head>(.|\n)*?<\/head>/,
  //   "<head>\r\n</head>"
  // );
  // htmlStr2 = await htmlFileToJs(htmlStr2);
  // for (let i = 0; i < htmlStr2.child[0].child.length; i++) {
  //   if (htmlStr2.child[0].child[i].tag) {
  //     if (htmlStr2.child[0].child[i].tag == "head") {
  //       for (let u = 0; u < VirtualConfig.length; u++) {
  //         htmlStr2.child[0].child[i].child.push(VirtualConfig[u]);
  //       }
  //     }
  //   }
  // }

  // let html = await jsFileToHtml(htmlStr2);
  // createFile(
  //   opt.targetDirectory + "/webos/index.html",
  //   "<!DOCTYPE html>\r\n" + html,
  //   false,
  //   false
  // );

  return;
}

async function createIndexHTML(opt) {
  let html =
    "<!DOCTYPE html>\r\n" +
    '<html lang="en">\r\n' +
    "<head>\r\n" +
    '  <meta http-equiv="X-UA-Compatible" content="IE=edge">\r\n' +
    '  <meta name="format-detection" content="telephone=no">\r\n' +
    '  <meta name="msapplication-tap-highlight" content="no">\r\n' +
    '  <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />\r\n' +
    '  <link rel="icon" href="<%= BASE_URL %>favicon.ico">\r\n' +
    "  <title>" +
    opt.name +
    "</title>\r\n" +
    "</head>\r\n" +
    "<body>\r\n" +
    "  <noscript>\r\n" +
    '    <strong>We"re sorry but wvue doesn"t work properly without JavaScript enabled. Please enable it to continue.</strong>\r\n' +
    "  </noscript>\r\n" +
    '  <div id="app"></div>\r\n' +
    "  <!-- built files will be auto injected -->\r\n" +
    '  <script type="text/javascript" src="cordova.js"></script>\r\n' +
    "</body>\r\n" +
    "</html>\r\n";

  await createFile(opt.name + "/public/index.html", html, false, false);
  return;
}

export async function createMain(opt) {
  let main;
  if (opt.typescript) {
    if (opt.vuex) {
      main =
        'import Vue from "vue";\r\n' +
        'import App from "./App.vue";\r\n' +
        'import router from "./router";\r\n' +
        'import store from "./store";\r\n' +
        "\r\n" +
        "Vue.config.productionTip = false;\r\n" +
        "\r\n" +
        "new Vue({\r\n" +
        "  router,\r\n" +
        "  store,\r\n" +
        "  render: h => h(App)\r\n" +
        '}).$mount("#app");\r\n';
    } else {
      main =
        'import Vue from "vue";\r\n' +
        'import App from "./App.vue";\r\n' +
        'import router from "./router";\r\n' +
        "\r\n" +
        "Vue.config.productionTip = false;\r\n" +
        "\r\n" +
        "new Vue({\r\n" +
        "  router,\r\n" +
        "  render: h => h(App)\r\n" +
        '}).$mount("#app");\r\n';
    }
  } else {
    if (opt.vuex) {
      main =
        'import Vue from "vue";\r\n' +
        'import App from "./App.vue";\r\n' +
        'import router from "./router";\r\n' +
        'import store from "./store";\r\n' +
        "\r\n" +
        "Vue.config.productionTip = false;\r\n" +
        "\r\n" +
        "new Vue({\r\n" +
        "  router,\r\n" +
        "  store,\r\n" +
        "render: function(h) {\r\n" +
        "  return h(App);\r\n" +
        "}\r\n" +
        '}).$mount("#app");\r\n';
    } else {
      main =
        'import Vue from "vue";\r\n' +
        'import App from "./App.vue";\r\n' +
        'import router from "./router";\r\n' +
        "\r\n" +
        "Vue.config.productionTip = false;\r\n" +
        "\r\n" +
        "new Vue({\r\n" +
        "  router,\r\n" +
        "render: function(h) {\r\n" +
        "  return h(App);\r\n" +
        "}\r\n" +
        '}).$mount("#app");\r\n';
    }
  }

  await createFile(
    opt.typescript ? opt.name + "/main.ts" : opt.name + "/main.js",
    main,
    false,
    false
  );
  return;
}

export async function createStore(opt) {
  let store;
  if (opt.vuex) {
    store =
      "import Vue from 'vue'\r\n" +
      "import Vuex from 'vuex'\r\n" +
      "\r\n" +
      "Vue.use(Vuex)\r\n" +
      "\r\n" +
      "export default new Vuex.Store({\r\n" +
      "  state: {\r\n" +
      "\r\n" +
      "  },\r\n" +
      "  mutations: {\r\n" +
      "\r\n" +
      "  },\r\n" +
      "  actions: {\r\n" +
      "\r\n" +
      "  }\r\n" +
      "})\r\n";
  }

  await createFile(
    opt.typescript ? opt.name + "/store.ts" : opt.name + "/store.js",
    store,
    false,
    false
  );
  return;
}

export async function createBabelConfJS(npm, opt) {
  let babelConfJs =
    "module.exports = {\r\n" +
    "   presets: [\r\n" +
    "    '@vue/app'\r\n" +
    "  ]\r\n" +
    "}\r\n";

  npm.devDependencies = {
    ...npm.devDependencies,
    ...pkg.babel
  };

  await createFile(opt.name + "/babel.config.js", babelConfJs, false, false);
  return;
}

export async function fillPackages(npm, opt) {
  npm.name = opt.name;
  npm.displayName = opt.name;
  npm.version = opt.version;
  npm.description = opt.description;

  if (opt.vuex) {
    npm.dependencies = {
      ...npm.dependencies,
      ...pkg.vuex
    };
  }

  if (opt.style) {
    if (opt.style == "dart-sass") {
      npm.devDependencies = {
        ...npm.devDependencies,
        ...pkg.styler.pkg.sassDart
      };
    } else if (opt.style == "node-sass") {
      npm.devDependencies = {
        ...npm.devDependencies,
        ...pkg.styler.pkg.sassNode
      };
    } else if (opt.style == "less") {
      npm.devDependencies = {
        ...npm.devDependencies,
        ...pkg.styler.pkg.less
      };
    } else if (opt.style == "stylus") {
      npm.devDependencies = {
        ...npm.devDependencies,
        ...pkg.styler.pkg.stylus
      };
    }
  }

  //TypeScript
  if (opt.typescript) {
    if (opt.style) {
      if (opt.tsDecorator) {
        npm.dependencies = {
          ...npm.dependencies,
          ...pkg.decor
        };
        if (opt.style == "dart-sass") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.decor.sassDart,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "node-sass") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.decor.sassNode,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "less") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.decor.less,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "stylus") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.decor.stylus,
            opt.targetDirectory + "/src"
          );
        }
      } else {
        if (opt.style == "dart-sass") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.undecor.sassDart,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "node-sass") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.undecor.sassNode,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "less") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.undecor.less,
            opt.targetDirectory + "/src"
          );
        } else if (opt.style == "stylus") {
          await copyDirectories(
            opt.templateDirectory + pkg.styler.url.ts.undecor.stylus,
            opt.targetDirectory + "/src"
          );
        }
      }
    } else {
      if (opt.tsDecorator) {
        npm.dependencies = {
          ...npm.dependencies,
          ...pkg.decor
        };
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.ts.decor.css,
          opt.targetDirectory + "/src"
        );
      } else {
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.ts.undecor.css,
          opt.targetDirectory + "/src"
        );
      }
    }

    if (opt.babel) {
      if (opt.tsBabel) {
        await createBabelConfJS(npm, opt);
        await createFile(
          opt.name + "/tsconfig.json",
          pkg.tsconfig.babel,
          true,
          true
        );
      } else {
        await createFile(
          opt.name + "/tsconfig.json",
          pkg.tsconfig.unbabel,
          true,
          true
        );
      }
    }

    if (opt.linter) {
      if (opt.linter == "airbnb") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.ts.pkg.airbnb
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.ts.url.airbnb,
          opt.targetDirectory
        );
      } else if (opt.linter == "prettier") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.ts.pkg.prettier
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.ts.url.prettier,
          opt.targetDirectory
        );
      } else if (opt.linter == "recommended") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.ts.pkg.recommended
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.ts.url.recommended,
          opt.targetDirectory
        );
      } else if (opt.linter == "standard") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.ts.pkg.standard
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.ts.url.standard,
          opt.targetDirectory
        );
      } else if (opt.linter == "tslint") {
        copyDirectories(
          opt.templateDirectory + pkg.linter.ts.url.tslint,
          opt.targetDirectory
        );
      }
    }
    //JavaScript
  } else {
    if (opt.style) {
      if (opt.style == "dart-sass") {
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.js.sassDart,
          opt.targetDirectory + "/src"
        );
      } else if (opt.style == "node-sass") {
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.js.sassNode,
          opt.targetDirectory + "/src"
        );
      } else if (opt.style == "less") {
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.js.less,
          opt.targetDirectory + "/src"
        );
      } else if (opt.style == "stylus") {
        await copyDirectories(
          opt.templateDirectory + pkg.styler.url.js.stylus,
          opt.targetDirectory + "/src"
        );
      }
    } else {
      await copyDirectories(
        opt.templateDirectory + pkg.styler.url.js.css,
        opt.targetDirectory + "/src"
      );
    }

    if (opt.babel) {
      await createBabelConfJS(npm, opt);
    }

    if (opt.linter) {
      if (opt.linter == "airbnb") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.js.pkg.airbnb
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.js.url.airbnb,
          opt.targetDirectory
        );
      } else if (opt.linter == "prettier") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.js.pkg.prettier
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.js.url.prettier,
          opt.targetDirectory
        );
      } else if (opt.linter == "recommended") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.js.pkg.recommended
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.js.url.recommended,
          opt.targetDirectory
        );
      } else if (opt.linter == "standard") {
        npm.devDependencies = {
          ...npm.devDependencies,
          ...pkg.linter.js.pkg.standard
        };
        copyDirectories(
          opt.templateDirectory + pkg.linter.js.url.standard,
          opt.targetDirectory
        );
      }
    }
  }

  let readHtml = await readFile(opt.targetDirectory + "/public/index.html");
  let res = await htmlFileToJs(readHtml.value);
  let htmlStr = res;

  VirtualConfig.forEach((value, row) => {
    if (value.node == "text") {
      value.text = "\n    ";
    }
  });

  let checking = false;
  for (let i = 0; i < htmlStr.child[0].child.length; i++) {
    if (htmlStr.child[0].child[i].tag) {
      if (htmlStr.child[0].child[i].tag == "head") {
        for (let u = 0; u < htmlStr.child[0].child[i].child.length; u++) {
          if (checking == false) {
            if (htmlStr.child[0].child[i].child[u].tag) {
              if (htmlStr.child[0].child[i].child[u].tag == "title") {
                htmlStr.child[0].child[i].child.splice(u + 1, 1);

                VirtualConfig.forEach((value, index) => {
                  htmlStr.child[0].child[i].child.push(value);
                });
                checking = true;
              }
            }
          }
        }
      }
    }
  }

  htmlStr = await jsFileToHtml(htmlStr);
  htmlStr = pretty(htmlStr);
  await createFile(
    opt.targetDirectory + "/public/index.html",
    htmlStr,
    false,
    false
  );

  await createMain(opt);
  await createStore(opt);
  await renameFile(
    opt.typescript ? opt.name + "/main.ts" : opt.name + "/main.js",
    opt.typescript ? opt.name + "/src/main.ts" : opt.name + "/src/main.js"
  );
  await renameFile(
    opt.typescript ? opt.name + "/store.ts" : opt.name + "/store.js",
    opt.typescript ? opt.name + "/src/store.ts" : opt.name + "/src/store.js"
  );
  return npm;
}

export async function projectPrepairing(opt) {
  let npm;
  if (opt.typescript != undefined) {
    npm = pkg.ts;
    let action = await fillPackages(npm, opt);
    npm = action;
  } else {
    npm = pkg.js;
    let action = await fillPackages(npm, opt);
    npm = action;
  }

  await createFile(opt.name + "/package.json", npm, true, true);
  return;
}

export async function copyProjectFiles(opt) {
  let templateMode;
  if (opt.typescript != undefined) {
    templateMode = "vue-ts-router";
  } else {
    templateMode = "vue-js-router";
  }

  copyDirectories(
    opt.templateDirectory + "/" + templateMode,
    opt.targetDirectory
  );
  return;
}

export async function onCreateProject(opt) {
  const currentFileUrl = import.meta.url;
  const templateDir = path.resolve(
    new URL(currentFileUrl).pathname,
    "../../templates"
  );
  opt = {
    ...opt,
    templateDirectory: templateDir
  };
  //
  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: "Creating LG WebOS project",
      task: () => initWebOS(opt)
    },
    {
      title: "Creating Vue project files",
      task: () => copyProjectFiles(opt)
    },
    {
      title: "Setup project files",
      task: () => projectPrepairing(opt)
    },
    {
      title: "Initialize git",
      task: () => initGit(opt)
    },
    {
      title: "Install dependencies",
      task: () =>
        projectInstall({
          cwd: opt.targetDirectory
        })
    }
  ]);

  await tasks.run();
  console.log("%s Project ready", chalk.green.bold("DONE"));
  return true;
}
