import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { AnchorProject } from "../shared/types";
import chalk from "chalk";
import path from "path";
import open from "open";

export const startDevServer = async (project: AnchorProject, port?: number) => {
  try {
    console.log("Starting dev server...");

    const app = express();

    app.use(cors());
    app.use(express.json());

    const uiPath = path.join(__dirname, "../ui/dist");
    console.log("Looking for UI at:", uiPath);
    app.use(express.static(uiPath));

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

    app.listen(port || 3000, async () => {
      // TODO: implement automatic increment of port if current one is already in use
      console.log(chalk.green(`Dev server listening on port ${port || 3000}`));
      console.log(
        chalk.green(`Dev server live at: http://localhost:${port || 3000}`)
      );

      const isProd = process.env.NODE_ENV === "production";
      if (!isProd) {
        console.log(chalk.yellow("Development Mode"));
        console.log(chalk.yellow("Run npm run ui:dev to launch UI"));
      } else {
        console.log(chalk.green("Production Mode"));

        setTimeout(async () => {
          await open(`http://localhost:${port || 3000}`);
        }, 1000);
      }
    });
  } catch (error) {
    console.error(chalk.red(`Error starting dev server: `), error);
  }
};
