import path from "path";
import fs from "fs";
import chalk from "chalk";
import { ProjectConfig, ProgramEntry } from "../../shared/types";
import { checkbox } from "@inquirer/prompts";
import { IDL_DIR, DEPLOY_DIR } from "../../shared/constants";

export const findAnchorProject = async (
  cwd: string
): Promise<ProjectConfig> => {
  const anchorToml = path.join(cwd, "Anchor.toml");
  if (!fs.existsSync(anchorToml)) {
    throw new Error(
      "No Anchor project found. Please run from Anchor project directory."
    );
  }

  const idlDirPath = path.join(cwd, IDL_DIR);
  if (!fs.existsSync(idlDirPath)) {
    throw new Error(
      "No IDL directory found. \n\n" + chalk.yellow("Please run: anchor build")
    );
  }

  const idlFiles = fs
    .readdirSync(idlDirPath)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (idlFiles.length === 0) {
    throw new Error(
      "No IDL files found.\n\n" + chalk.yellow("Please run: anchor build")
    );
  }

  let selectedFiles = idlFiles;

  if (idlFiles.length > 1) {
    selectedFiles = await checkbox({
      message: "Found multiple programs. Select which to load:",
      choices: idlFiles.map((file) => ({
        name: file.replace(".json", ""),
        value: file,
        checked: true,
      })),
    });

    if (selectedFiles.length === 0) {
      throw new Error("No programs selected.");
    }
  }

  const programs: ProgramEntry[] = selectedFiles.map((file) => {
    const name = file.replace(".json", "");
    const idlPath = path.join(cwd, IDL_DIR, file);
    const soPath = path.join(cwd, DEPLOY_DIR, name + ".so");

    return {
      name,
      idlPath,
      deployPath: fs.existsSync(soPath) ? soPath : undefined,
      source: "anchor" as const,
    };
  });

  return {
    rootPath: cwd,
    programs,
  };
};
