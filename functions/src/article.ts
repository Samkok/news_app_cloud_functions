import {functions} from "./config";
import {createArticleController, deleteArticleController, getAllArticlesController, getArticleController, updateArticleController} from "./controllers/articlesController";

export const getAllArticles = functions.https.onRequest(getAllArticlesController);

export const getArticle = functions.https.onRequest(getArticleController);

export const createArticle = functions.https.onRequest(createArticleController);

export const updateArticle = functions.https.onRequest(updateArticleController);

export const deleteArticle = functions.https.onRequest(deleteArticleController);
