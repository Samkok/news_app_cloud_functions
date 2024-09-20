/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {getAllArticles, createArticle, updateArticle, deleteArticle} from "./article";
import {signUpUser} from "./auth";
import {createCategory, deleteCategory, getAllCategories} from "./category";
import {followOrUnfollowUserOrChannel, getIfUserFollowChannel, onfollow, onUnfollow} from "./follow";
import {createBookMark, getBookMarksOfUser, unmarkArticle, updateUser} from "./user";

export {
  // Auth / User
  signUpUser,
  updateUser,
  createBookMark,
  unmarkArticle,
  getBookMarksOfUser,
  // Follows
  followOrUnfollowUserOrChannel,
  onfollow,
  onUnfollow,
  getIfUserFollowChannel,
  // Articles
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  // Category
  createCategory,
  getAllCategories,
  deleteCategory,
};
