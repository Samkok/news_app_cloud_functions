import {functions} from "./config";
import {createBookMarkController, getBookMarksOfUserController, unmarkArticleController, updateUserController} from "./controllers/userController";

export const updateUser = functions.https.onRequest(updateUserController);

export const createBookMark = functions.https.onRequest(createBookMarkController);

export const unmarkArticle = functions.https.onRequest(unmarkArticleController);

export const getBookMarksOfUser = functions.https.onRequest(getBookMarksOfUserController);
