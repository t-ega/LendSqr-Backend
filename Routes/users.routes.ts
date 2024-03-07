import express from 'express';

import UserController  from '../controllers/users.controller';
import IsAuthenticated from '../middlewares/auth.middleware';

const Router = express.Router();


Router.get("/me", IsAuthenticated, UserController.getUser);
Router.post("/", UserController.create);

export default Router;