import ora from "ora";
import path from "path";
import chalk from "chalk";
import { StartCommandOptions } from "../types";
import { ProjectConfig } from "../../shared/types";
import { findAnchorProject } from "../utils/find-anchor-project";
import { startServer } from "../../server";

export const handleStartCommand = async (options: StartCommandOptions) => {
  const spinner = ora("Starting testship server").start();

  let projectConfig: ProjectConfig;

  if (options.idl) {
    console.log(chalk.blue("\nUsing provided IDL file"));
    projectConfig = {
      rootPath: process.cwd(),
      programName: "program",
      idlPath: path.resolve(options.idl),
    };

    spinner.succeed(`Loaded IDL from ${projectConfig.idlPath}`);
  } else {
    console.log(chalk.blue("\nScanning for Anchor program..."));
    projectConfig = await findAnchorProject(process.cwd());

    spinner.succeed(`Found Anchor project: `);
    console.log(chalk.green(projectConfig.programName));
  }

  await startServer(projectConfig, options.port);
};
