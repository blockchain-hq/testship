#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { findAnchorProject } from "./project-finder";
import { startDevServer } from "../server";
import { getMessageFromError } from "./parse-error";
import { StartOptions } from "./types";
import { DEFAULT_PORT } from "../shared/constant";
import ora from "ora";

const program = new Command();

program
  .name("testship")
  .description("Interactive testing for Anchor Programs")
  .version("0.1.0");

program
  .command("start")
  .description("Start Testship development server")
  .option("-p, --port <port>", "Port to run on", DEFAULT_PORT.toString())
  .action((options: StartOptions) => handleStartCommand(options));

const handleStartCommand = async (options: StartOptions) => {
  const spinner = ora("Scanning for Anchor project...");

  try {
    const port = parseInt(options.port || DEFAULT_PORT.toString(), 10);
    if (isNaN(port) || port < 0 || port > 65535) {
      console.error(chalk.red("Invalid port number"));
      process.exit(1);
    }

    console.log(chalk.blue("Scanning for Anchor project..."));
    const anchorProject = await findAnchorProject(process.cwd());
    spinner.succeed("Found Anchor project");

    console.log(chalk.gray(`  Program: ${anchorProject.programName}`));
    console.log(chalk.gray(`  IDL: ${anchorProject.idlPath}`));
    console.log();

    await startDevServer(anchorProject, port);
    spinner.succeed(`Server running at http://localhost:${port}`);
  } catch (error) {
    spinner.fail("Error starting dev server");
    console.error(chalk.red(`Error: `), getMessageFromError(error));
    process.exit(1);
  }
};

program.parseAsync(process.argv).catch((error) => {
  console.error(chalk.red("Unexpected error: "), getMessageFromError(error));
  process.exit(1);
});
