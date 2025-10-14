#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { findAnchorProject } from "./project-finder";
import { startDevServer } from "../server";
import { getMessageFromError } from "./parse-error";

const program = new Command();

program
  .name("pulse")
  .description("Interactive testing for Anchor Programs")
  .version("0.1.0");

program
  .command("start")
  .description("Start PULSE development server")
  .option("-p, --port <port>", "Port to run on", "3000")
  .action((options) => handleStartCommand(options));

const handleStartCommand = async (options: any) => {
  try {
    console.log(chalk.blue("Scanning for Anchor project..."));
    const anchorProject = await findAnchorProject(process.cwd());

    console.log(chalk.green("Found Anchor project"));
    console.log(chalk.gray(`Program: ${anchorProject.programName}`));
    console.log(chalk.gray(`IDL: ${anchorProject.idlPath}`));

    await startDevServer(anchorProject, options.port);
  } catch (error) {
    console.error(chalk.red(`Error: `), getMessageFromError(error));
    process.exit(1);
  }
};

program.parse();
