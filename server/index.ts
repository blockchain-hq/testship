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
    const watcher = watch(projectConfig.idlPath, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("change", () => eventBus.emit(EVENT_IDL_CHANGED));

    app.use("/*", cors());

    app.get("/api/idl", (c) => {
      const idl = fs.readFileSync(projectConfig.idlPath, "utf8");
      return c.json({
        success: true,
        data: JSON.parse(idl),
        error: null,
        message: "IDL fetched successfully",
      });
    });

    app.get("/api/events", (c) => {
      return streamSSE(c, async (stream) => {
        const listener = () =>
          stream.writeSSE({ data: "idl-updated", event: EVENT_IDL_CHANGED });
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
