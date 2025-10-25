import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import { AnchorProject } from "../shared/types";
import chalk from "chalk";
import path from "path";
import open from "open";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";
import { createServer } from "http";

export const startDevServer = async (project: AnchorProject, port?: number) => {
  try {
    console.log("Starting dev server...");

    const app = express();
    const server = createServer(app);
    const wss = new WebSocketServer({ server });

    app.use(cors());
    app.use(express.json());

    const uiPath = path.join(__dirname, "../ui");

    // WebSocket clients storage
    const clients = new Set<any>();

    // WebSocket connection handling
    wss.on('connection', (ws) => {
      console.log(chalk.blue('Client connected to WebSocket'));
      clients.add(ws);

      ws.on('close', () => {
        console.log(chalk.yellow('Client disconnected from WebSocket'));
        clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error(chalk.red('WebSocket error:'), error);
        clients.delete(ws);
      });
    });

    // Function to notify all clients about IDL changes
    const notifyClients = (message: string) => {
      console.log(chalk.cyan(`Sending "${message}" to ${clients.size} clients`));
      let sentCount = 0;
      clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(message);
          sentCount++;
        }
      });
      console.log(chalk.cyan(`Message sent to ${sentCount} clients`));
    };

    // Watch for IDL file changes
    console.log(chalk.blue(`Watching IDL file: ${project.idlPath}`));
    const watcher = chokidar.watch(project.idlPath, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', (filePath) => {
      console.log(chalk.green(`IDL file changed: ${filePath}`));
      console.log(chalk.blue('Notifying clients to refresh IDL...'));
      console.log(chalk.yellow(`Active clients: ${clients.size}`));
      notifyClients('IDL_UPDATED');
    });

    watcher.on('error', (error) => {
      console.error(chalk.red('File watcher error:'), error);
    });

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

    server.listen(port || 3000, async () => {
      console.log(chalk.green(`Dev server listening on port ${port || 3000}`));
      console.log(chalk.green(`Dev server live at: http://localhost:${port || 3000}`));
      console.log(chalk.blue(`WebSocket server running on ws://localhost:${port || 3000}`));
      console.log(chalk.blue(`Watching for IDL changes: ${project.idlPath}`));

      console.log(chalk.green("Production Mode"));

      setTimeout(async () => {
        await open(`http://localhost:${port || 3000}`);
      }, 1000);
    });

    // Cleanup function
    const cleanup = () => {
      console.log(chalk.yellow('Shutting down file watcher...'));
      watcher.close();
      wss.close();
    };

    // Handle process termination
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error(chalk.red(`Error starting dev server: `), error);
  }
};
