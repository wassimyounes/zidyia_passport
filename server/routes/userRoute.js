import express from 'express';
import { createuser, getusers, getuser, deleteuser } from '../controllers/usercontroller.js';


const router = express.Router();

router.post('/user', createuser)
router.get('/user/:id', getuser)
router.get('/user', getusers)
// router.get('/user/:id', updateuser)
router.delete('/user/:id', deleteuser)


export default router;