import express, { request, response } from 'express';
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/itemsController';

const routes = express.Router(); 
const pointsControlle = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);

routes.post('/points', pointsControlle.create);
routes.get('/points', pointsControlle.index);
routes.get('/points/:id', pointsControlle.show);

export default routes;