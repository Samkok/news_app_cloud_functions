import {functions} from "./config";
import {markOrUnmarkArticleController, getBookMarksOfUserController, updateUserController} from "./controllers/userController";

export const updateUser = functions.https.onRequest(updateUserController);

export const markOrUnmarkArticle = functions.https.onRequest(markOrUnmarkArticleController);

export const getBookMarksOfUser = functions.https.onRequest(getBookMarksOfUserController);
