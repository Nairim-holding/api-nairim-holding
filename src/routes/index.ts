import express, { Express } from "express";
import user from './user';
import authenticate from './authenticate';
import agency from './agency';
import property from './property';
import tenant from './tenant';
import owner from './owner';
import lease from './lease';
import favorite from './favorite';
import propertyType from './propertyType'
import propertyValues from './propertyValues'

const routes = (app: Express) => {
  app.use(express.json(), user, authenticate, agency, property, tenant, owner, lease, favorite, propertyType, propertyValues);
};

export default routes;