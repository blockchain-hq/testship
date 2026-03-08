import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ProjectConfig } from "../shared/types";
import ora from "ora";
import fs from "fs";
import { DEFAULT_SERVER_PORT, EVENT_IDL_CHANGED } from "../shared/constants";
import EventEmitter from "events";
import { watch } from "chokidar";
import { streamSSE } from "hono/streaming";

export const startServer = async (
  projectConfig: ProjectConfig,
  port?: number
) => {
  const spinner = ora("Starting testship server").start();
  try {
    const app = new Hono();
    const eventBus = new EventEmitter();

    const idlPaths = projectConfig.programs.map((p) => p.idlPath);
    const watcher = watch(idlPaths, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", (changedPath) => {
      const program = projectConfig.programs.find(
        (p) => p.idlPath === changedPath
      );
      eventBus.emit(EVENT_IDL_CHANGED, program?.name ?? null);
    });

    app.use("/*", cors());

    app.get("/api/programs", (c) => {
      const programs = projectConfig.programs.map((p) => {
        const raw = fs.readFileSync(p.idlPath, "utf8");
        return {
          name: p.name,
          source: p.source,
          hasDeployArtifact: !!p.deployPath,
          idl: JSON.parse(raw),
        };
      });

      return c.json({ programs });
    });

    app.get("/api/programs/:name/idl", (c) => {
      const name = c.req.param("name");
      const program = projectConfig.programs.find((p) => p.name === name);

      if (!program) {
        return c.json({ error: `Program "${name}" not found` }, 404);
      }

      const raw = fs.readFileSync(program.idlPath, "utf8");
      return c.json({
        name: program.name,
        source: program.source,
        idl: JSON.parse(raw),
      });
    });

    app.get("/api/events", (c) => {
      return streamSSE(c, async (stream) => {
        const listener = (programName: string | null) =>
          stream.writeSSE({
            data: JSON.stringify({ program: programName }),
            event: EVENT_IDL_CHANGED,
          });
        eventBus.on(EVENT_IDL_CHANGED, listener);

        stream.onAbort(() => {
          eventBus.off(EVENT_IDL_CHANGED, listener);
        });

        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      });
    });

    serve(
      {
        fetch: app.fetch,
        port: port ?? DEFAULT_SERVER_PORT,
      },
      (info) => {
        spinner.succeed(`Server is running on http://localhost:${info.port}`);
      }
    );
  } catch (error) {
    spinner.fail("Failed to start server");
    spinner.info(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
