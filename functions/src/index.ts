/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {getAllArticles, createArticle, updateArticle, deleteArticle, getArticle} from "./article";
import {signUpUser} from "./auth";
import {createCategory, deleteCategory, getAllCategories} from "./category";
// import { functions } from "./config";
// import { getArticleController } from "./controllers/articlesController";
import {followOrUnfollowUserOrChannel, getIfUserFollowChannel, onfollow, onUnfollow} from "./follow";
import {getBookMarksOfUser, getUserInfo, markOrUnmarkArticle, updateUser} from "./user";
// import * as express from "express";

// const app = express();

// app.use(express.json());

// // Define a route with a parameter for articleId
// app.get('/getArticle/?articleId={articleId}', getArticleController);

// // Export the function wrapped in an Express app
// export const api = functions.https.onRequest(app);

export {
  // Auth / User
  signUpUser,
  updateUser,
  markOrUnmarkArticle,
  getBookMarksOfUser,
  getUserInfo,
  // Follows
  followOrUnfollowUserOrChannel,
  onfollow,
  onUnfollow,
  getIfUserFollowChannel,
  // Articles
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  // Category
  createCategory,
  getAllCategories,
  deleteCategory,
};
