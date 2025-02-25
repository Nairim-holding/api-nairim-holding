import express, { Express } from "express";
import user from './user';

const routes = (app: Express) => {
  app.use(express.json(), user);
};

export default routes;