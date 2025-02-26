import express, { Express } from "express";
import user from './user';
import authenticate from './authenticate';

const routes = (app: Express) => {
  app.use(express.json(), user, authenticate);
};

export default routes;