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
    const idlPath = path.resolve(options.idl);
    const name = path.basename(idlPath, ".json");

    projectConfig = {
      rootPath: process.cwd(),
      programs: [{ name, idlPath, source: "anchor" }],
    };

    spinner.succeed(`Loaded IDL from ${idlPath}`);
  } else {
    console.log(chalk.blue("\nScanning for programs..."));
    projectConfig = await findAnchorProject(process.cwd());

    const names = projectConfig.programs.map((p) => p.name).join(", ");
    spinner.succeed(`Found programs: ${chalk.green(names)}`);
  }

  await startServer(projectConfig, options.port);
};
