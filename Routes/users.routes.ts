import express from 'express';

import UserController  from '../controllers/users.controller';

const Router = express.Router();


Router.get("/", UserController.getUsers);
Router.post("/", UserController.create);

export default Router;