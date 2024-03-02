import express from 'express';
import { registeruser, registerverification } from '../controllers/register.js';
import { loginuser } from '../controllers/login.js';
import { validateToken } from '../Middleware/validateTokenHandler.js';
import { requestPasswordReset, resetPassword } from '../controllers/forgetpass.js';

const router = express.Router();


//router.use(validateToken); we can use this to apply the validatetoken on all routes, 
//but here we don;t want to apply this validation on the registration
router.post('/register', registeruser)
router.get('/registerverify', registerverification)
router.post('/login', loginuser)
// router.get('/current', validateToken, currentuser)
router.post('/resetpassverify',requestPasswordReset)
router.post('/resetpass',resetPassword)


export default router;