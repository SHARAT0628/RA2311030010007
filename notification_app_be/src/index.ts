import express from "express";
import cors from "cors";
import notifRouter from "./route/notification.route";
import { Log } from "./middleware/logger";

const serverApp = express();
const serverPort = process.env.PORT || 5000;

serverApp.use(cors());
serverApp.use(express.json());

serverApp.use("/api/notifications", notifRouter);

serverApp.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

serverApp.listen(serverPort, async () => {
  await Log("backend", "info", "config", `Server started on port ${serverPort}`);
  console.log(`Server running at http://localhost:${serverPort}`);
});
