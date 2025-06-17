import express from "express";

const userRoute = express.Router();

import UserAuthController from "../controller/user.controller";

userRoute.post("/register", UserAuthController.register);
userRoute.post("/login", UserAuthController.login);

export default userRoute;
