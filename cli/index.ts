#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json";
import { DEFAULT_SERVER_PORT } from "../shared/constants";
import { StartCommandOptions } from "./types";
import { handleStartCommand } from "./commands/start";
import chalk from "chalk";

const program = new Command();

program
  .name("testship")
  .description("Test solana programs without writing tests")
  .version(packageJson.version);

program
  .command("start")
  .description("Start the testship server")
  .option(
    "-p, --port <port>",
    "Port to run the server on",
    String(DEFAULT_SERVER_PORT)
  )
  .option(
    "-i, --idl <idl>",
    "Path to the specific IDL file (bypasses auto-detection for Anchor)"
  )
  .action((options: StartCommandOptions) => handleStartCommand(options));

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red("Unexpected error: "));
  console.error(chalk.red(err.stack || err.message));
  process.exit(1);
});
