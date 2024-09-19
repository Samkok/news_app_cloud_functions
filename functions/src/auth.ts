import {functions} from "./config";
import {signUpUserController} from "./controllers/authController";

export const signUpUser = functions.https.onRequest(signUpUserController);
