import path from "path";
import fs from "fs";
import chalk from "chalk";
import { AnchorProject } from "../shared/types";
import { select } from "@inquirer/prompts";
import { DEPLOY_DIR, IDL_DIR } from "../shared/constant";

export const findAnchorProject = async (
  cwd: string
): Promise<AnchorProject> => {
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
  const idlPath = path.join(idlDirPath, idlFiles[programIndex]);
  const programPath = path.join(cwd, `${DEPLOY_DIR}/${programName}.so`);

  return {
    root: cwd,
    programName,
    idlPath,
    programPath,
    anchorToml,
  };
};
