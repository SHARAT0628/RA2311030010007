import { Router } from "express";
import { NotifController } from "../controller/notification.controller";

const notifRouter = Router();

notifRouter.post("/", NotifController.create);
notifRouter.get("/", NotifController.getAll);
notifRouter.get("/:notifId", NotifController.getOne);
notifRouter.patch("/:notifId", NotifController.markRead);
notifRouter.delete("/:notifId", NotifController.remove);

export default notifRouter;
