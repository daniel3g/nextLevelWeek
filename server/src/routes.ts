import express from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router(); 
const upLoad = multer(multerConfig);

const pointsControlle = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);

routes.post('/points', upLoad.single('image'), pointsControlle.create);
routes.get('/points', pointsControlle.index);
routes.get('/points/:id', pointsControlle.show);

export default routes;