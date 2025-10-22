import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { AnchorProject } from "../shared/types";
import chalk from "chalk";
import path from "path";
import open from "open";
import { DEFAULT_HOST, DEFAULT_PORT } from "../shared/constant";

export const startDevServer = async (project: AnchorProject, port?: number) => {
  try {
    console.log("Starting dev server...");

    const app = express();

    app.use(cors());
    app.use(express.json());

    const uiPath = path.join(__dirname, "../ui");

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

    app.use(express.static(uiPath));

    app.use((req, res) => {
      res.sendFile(path.join(uiPath, "index.html"));
    });

    app.listen(port || DEFAULT_PORT, async () => {
      // TODO: implement automatic increment of port if current one is already in use

      setTimeout(async () => {
        await open(`http://${DEFAULT_HOST}:${port || DEFAULT_PORT.toString()}`);
      }, 1000);
    });
  } catch (error) {
    console.error(chalk.red(`Error starting dev server: `), error);
  }
};
