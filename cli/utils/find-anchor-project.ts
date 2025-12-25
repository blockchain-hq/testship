import path from "path";
import fs from "fs";
import chalk from "chalk";
import { ProjectConfig } from "../../shared/types";
import { select } from "@inquirer/prompts";
import { IDL_DIR } from "../../shared/constants";

export const findAnchorProject = async (
  cwd: string
): Promise<ProjectConfig> => {
  // check if Anchor.toml exists
  const anchorToml = path.join(cwd, "Anchor.toml");
  if (!fs.existsSync(anchorToml)) {
    throw new Error(
      "No Anchor project found. Please run from Anchor project directory."
    );
  }

  // check idl file for program name
  const idlDirPath = path.join(cwd, IDL_DIR);
  if (!fs.existsSync(idlDirPath)) {
    throw new Error(
      "No IDL directory found. \n\n" + chalk.yellow("Please run: anchor build")
    );
  }

  // find all idl files
  const idlFiles = fs
    .readdirSync(idlDirPath)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (idlFiles.length === 0) {
    throw new Error(
      "No IDL files found.\n\n" + chalk.yellow("Please run: anchor build")
    );
  }

  let programIndex = 0;
  if (idlFiles.length > 1) {
    programIndex = await select({
      message: "Found multiple Anchor programs. Select one:",
      choices: idlFiles.map((file, i) => ({
        name: file.replace(".json", ""),
        value: i,
      })),
    });
  }

  const programName = idlFiles[programIndex].replace(".json", "");
  const idlPath = path.join(cwd, IDL_DIR, programName + ".json");

  if (!fs.existsSync(idlPath)) {
    throw new Error(
      "Selected program IDL not found. \n\n" +
        chalk.yellow("Please run: anchor build")
    );
  }

  return {
    rootPath: cwd,
    programName,
    idlPath,
  };
};
