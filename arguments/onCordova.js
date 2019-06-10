import shell from "shelljs";
export async function onPlugin(mode, pluginName) {
  let cmd = await shell.exec("cordova plugin " + mode + " " + pluginName);
  cmd.stderr ? console.log(cmd.stderr) : console.log(cmd.stdout);
  return;
}

export async function onPlatform(mode, dvc) {
  let cmd = await shell.exec("cordova platform " + mode + " " + dvc);
  cmd.stderr ? console.log(cmd.stderr) : console.log(cmd.stdout);
  return;
}
