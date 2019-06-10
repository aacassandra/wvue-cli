import inquirer from "inquirer";
import chalk from "chalk";
import clear from "clear";
import isValidDomain from "is-valid-domain";

let Danger = "#852222";
let Success = "#228564";
let cy = chalk.yellow;
let danger = chalk.hex(Danger);
let success = chalk.hex(Success);
let asd = "(" + cy("babel") + "," + cy("eslint") + ")";
export async function selectPresets(opt) {
  const questions = [];
  questions.push({
    type: "list",
    name: "preset",
    message: "Please pick a preset: (Use arrow keys)",
    choices: ["default " + asd, "Manually select features"]
  });

  const answers = await inquirer.prompt(questions);
  return answers.preset.substring(0, 7);
}

export async function selectFeatures(opt) {
  const questions = [];
  questions.push(
    {
      type: "confirm",
      name: "git",
      message: "Initialize a git repository?",
      default: true
    },
    {
      name: "domain",
      type: "input",
      message: "Enter your app domain:",
      default: "com.domain.app",
      validate: function(value) {
        value = isValidDomain(value);
        if (value == true) {
          return true;
        } else {
          return danger("Please input valid app domain (com.domain.example)");
        }
      }
    },
    {
      name: "version",
      type: "input",
      message: "Enter your app version:",
      default: "1.0.0",
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return danger("Enter your app version (example: 1.0.0). ");
        }
      }
    },
    {
      name: "description",
      type: "input",
      message: "Enter your app description:",
      default: "This is my awesome Vue apps base on LG WebOS",
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return danger("Enter your app description.");
        }
      }
    },
    {
      type: "checkbox",
      name: "features",
      message: "Check the features needed for your project:",
      choices: [
        "Babel",
        "TypeScript",
        "Vuex",
        "CSS Pre-processors",
        "Linter / Formatter"
      ],
      default: ["Babel", "TypeScript", "Vuex"]
    }
  );

  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function selectStyler(opt) {
  const questions = [];
  questions.push({
    type: "list",
    name: "style",
    message: "Pick a CSS pre-processor",
    choices: [
      "Sass/SCSS (with dart-sass)",
      "Sass/SCSS (with node-sass)",
      "Less",
      "Stylus"
    ]
  });
  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function selectLinter(opt) {
  const questions = [];
  if (opt.typescript == true) {
    questions.push({
      type: "list",
      name: "lint",
      message: "Pick a formatter",
      choices: [
        "TSLint",
        "ESLint with error prevention only",
        "ESLint + Airbnb config",
        "ESLint + Standard config",
        "ESLint + Prettier"
      ]
    });
  } else {
    questions.push({
      type: "list",
      name: "lint",
      message: "Pick a formatter",
      choices: [
        "ESLint with error prevention only",
        "ESLint + Airbnb config",
        "ESLint + Standard config",
        "ESLint + Prettier"
      ]
    });
  }

  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function savePresets(opt) {
  const questions = [];
  questions.push({
    type: "confirm",
    name: "saved",
    message: "Save this as a preset for future projects?",
    default: false
  });
  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function selectTsConfig(opt) {
  const questions = [];
  questions.push(
    {
      type: "confirm",
      name: "tsDecorator",
      message: "Use class-style component syntax?",
      default: false
    },
    {
      type: "confirm",
      name: "tsBabel",
      message: "Use Babel alongside TypeScript for auto-detected polyfills?",
      default: false
    }
  );

  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function onCreateQuestions(opt) {
  if (opt.mode == "create") {
    let first = await selectPresets(opt);
    if (first == "default") {
      return {
        ...opt,
        preset: "default",
        description: "This is an LG WebOS Apps using Vue",
        git: true
      };
    } else {
      let second = await selectFeatures(opt);
      opt = {
        ...opt,
        preset: "manual",
        git: second.git,
        domain: second.domain,
        version: second.version,
        description: second.description,
        saved: false
      };
      second = second.features;

      let Looping = async () => {
        return new Promise(async (resolve, reject) => {
          for (let i = 0; i < second.length; i++) {
            if (second[i] == "Babel") {
              opt = {
                ...opt,
                babel: true
              };
            } else if (second[i] == "TypeScript") {
              let res = await selectTsConfig(opt);
              opt = {
                ...opt,
                typescript: true,
                tsBabel: res.tsBabel,
                tsDecorator: res.tsDecorator
              };
            } else if (second[i] == "Vuex") {
              opt = {
                ...opt,
                vuex: true
              };
            } else if (second[i] == "CSS Pre-processors") {
              let res = await selectStyler(opt);
              if (res.style == "Sass/SCSS (with dart-sass)") {
                res.style = "dart-sass";
              } else if (res.style == "Sass/SCSS (with node-sass)") {
                res.style = "node-sass";
              }
              opt = {
                ...opt,
                style: res.style.toLowerCase()
              };
            } else if (second[i] == "Linter / Formatter") {
              let res = await selectLinter(opt);
              if (res.lint == "ESLint with error prevention only") {
                res.lint = "recommended";
              } else if (res.lint == "ESLint + Airbnb config") {
                res.lint = "airbnb";
              } else if (res.lint == "ESLint + Standard config") {
                res.lint = "standard";
              } else if (res.lint == "ESLint + Prettier") {
                res.lint = "prettier";
              } else if (res.lint == "TSLint") {
                res.lint = "tslint";
              }
              opt = {
                ...opt,
                linter: res.lint
              };
            }
          }
          resolve(true);
        });
      };

      await Looping();
      let res = await savePresets(opt);
      opt = {
        ...opt,
        saved: res.saved
      };
      return opt;
    }
  }
}
