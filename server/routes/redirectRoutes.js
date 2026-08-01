import express from "express";
import  {redirectToReferral} from "../controllers/redirectController.js";

const redirectRouter = express.Router();

redirectRouter.get("/:itemId", redirectToReferral);

export default redirectRouter;