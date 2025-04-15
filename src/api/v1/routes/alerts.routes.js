import express from 'express';
import * as alertController from '../controllers/alert.controller.js';

const router = express.Router();

router.post('/post', alertController.createAlert);
router.get('/get', alertController.getAllAlerts);
router.get('/get/id', alertController.getAlertById);
router.put('/put/id', alertController.updateAlert);
router.delete('/delete/id', alertController.deleteAlert);

export default router;
