import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { AnchorProject } from "../shared/types";
import path from "path";
import open from "open";
import getPort from "get-port";
import { DEFAULT_HOST, DEFAULT_PORT } from "../shared/constant";
import { Ora } from "ora";
import { getMessageFromError } from "../cli/parse-error";

export const startDevServer = async (
  project: AnchorProject,
  ora: Ora,
  port?: number
) => {
  try {
    ora.start("Starting dev server...");

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

    const availablePort = await getPort({ port: port || DEFAULT_PORT });

    const server = app.listen(availablePort, async () => {
      const url = `http://${DEFAULT_HOST}:${availablePort}`;
      setTimeout(async () => {
        ora.start("Opening browser...");
        try {
          await open(url);
          ora.succeed(`Browser opened at ${url}`);
        } catch (error) {
          ora.fail("Could not open browser");
          ora.info(`Please visit ${url} manually`);
        }
      }, 1000);
    });

    const shutdown = () => {
      ora.start("Shutting down server...");
      server.close(() => {
        ora.succeed("Server closed");
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        ora.fail("Forcing shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    return server;
  } catch (error) {
    ora.fail("Error starting dev server");
    ora.info(getMessageFromError(error));
    process.exit(1);
    throw error;
  }
};
