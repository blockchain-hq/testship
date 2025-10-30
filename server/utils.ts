import { createServer } from "http";

const findAvailablePort = async (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};
