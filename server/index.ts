import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { AnchorProject } from "../shared/types";
import chalk from "chalk";

export const startDevServer = async (project: AnchorProject, port?: number) => {
  console.log("Starting dev server...");

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/idl", (req: Request, res: Response) => {
    try {
      const idl = fs.readFileSync(project.idlPath, "utf8");
      res.json(JSON.parse(idl));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  });

  app.get("/api/project", (req, res) => {
    res.json({
      name: project.programName,
      root: project.root,
    });
  });

  app.listen(port || 3000, () => {
    // TODO: implement automatic increment of port if current one is already in use
    console.log(chalk.green(`Dev server listening on port ${port || 3000}`));
    console.log(
      chalk.green(`Dev server live at: http://localhost:${port || 3000}`)
    );
  });
};
