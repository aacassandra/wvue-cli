import inquirer from "inquirer";
import chalk from "chalk";
import clear from "clear";
import {onRunProject} from "../arguments/onRun";

let Danger = "#852222";
let Success = "#228564";
let cy = chalk.yellow;
let danger = chalk.hex(Danger);
let success = chalk.hex(Success);

export async function selectDevices() {
  const questions = [];
  questions.push({
    type: "list",
    name: "device",
    message: "Please select a devices: (Use arrow keys)",
    choices: ["android", "ios", "browser"]
  });

  const answers = await inquirer.prompt(questions);
  return answers;
}

export async function onRunQuestions() {
  let opt = await selectDevices();
  onRunProject(opt);
}
