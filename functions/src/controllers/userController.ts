import {Request, Response} from "express";
import {BaseResponseModel} from "../models/base_response_model";
import {db} from "../config";
import {Collection} from "../const/collection";
import {Timestamp} from "firebase-admin/firestore";
import {SuccessResponseModel} from "../models/success_response_model";
import {getUserFromToken} from "./authController";
import {UserRecord} from "firebase-admin/auth";
import {BookmarkModel} from "../models/user/bookmark_model";

export const updateUserController = async (request : Request, response: Response) => {
  try {
    const {id, firstName, lastName, bio} = request.body;

    const userRef = db.collection(Collection.users).doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw Error("User doesn't exists");
    }

    const updateData : any = { };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;

    userRef.update(updateData)
      .then(() => {
        const res: BaseResponseModel = ({
          statusCode: 500,
          message: "User updated successfully",
        });
        response.send(res);
      });
  } catch (err) {
    const errRes: BaseResponseModel = ({
      statusCode: 500,
      message: String(err),
    });
    response.send(errRes);
  }
};

export const createBookMarkController = async (request: Request, response: Response) => {
  try {
    const {articleId} = request.body;
    if (!articleId) {
      throw Error("Missing required field: articleId, userId");
    }

    const userRecode = await getUserFromToken(request);

    if (!(userRecode instanceof UserRecord)) {
      throw Error(userRecode);
    }

    const artRef = db.collection(Collection.articles).doc(articleId);
    const artDoc = await artRef.get();
    if (!artDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: "Article not found",
      });
      response.send(errRes);
      return;
    }

    const userRef = db.collection(Collection.users).doc(userRecode.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: "User not found",
      });
      response.send(errRes);
      return;
    }

    const bookmarkRef = userRef.collection(Collection.bookmarks);
    const bookmarkDoc = await bookmarkRef.get();

    for (const doc of bookmarkDoc.docs) {
      const bookmarkData = doc.data();
      const bookmarkArticle = bookmarkData.article;
      if (bookmarkArticle === articleId) {
        const errRes: BaseResponseModel = ({
          statusCode: 405,
          message: "Already marked",
        });
        response.send(errRes);
        return;
      }
    }

    const bookmark : BookmarkModel = {
      articleId: articleId,
      markedDate: Timestamp.now(),
    };
    bookmarkRef.add(bookmark).then((doc) => {
      const success : SuccessResponseModel = {
        statusCode: 200,
        message: "Bookmarks added successfully",
        data: {id: doc.id},
      };
      response.send(success);
    }).catch((err) => {
      throw Error(err);
    });
  } catch (err) {
    const errRes: BaseResponseModel = ({
      statusCode: 500,
      message: String(err),
    });
    response.send(errRes);
  }
};

export const getBookMarksOfUserController = async (request: Request, response: Response) => {
  try {
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      response.send("Unauthorized");
      return;
    }

    const userRecode = await getUserFromToken(request);

    if (!(userRecode instanceof UserRecord)) {
      throw Error(userRecode);
    }
    const userRef = db.collection(Collection.users).doc(userRecode.uid);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: "User not found",
      });
      response.send(errRes);
      return;
    }

    const bookmarks = [];

    const bookmarksRef = userRef.collection(Collection.bookmarks);
    const bookmarksDoc = await bookmarksRef.get();

    for (const bookmarkDoc of bookmarksDoc.docs) {
      const bookmarkData = bookmarkDoc.data();
      const markedDate = bookmarkData.markedDate.toDate().toLocaleDateString();

      const articleBookmark = await getBookmarkArticle(bookmarkData.article);

      bookmarks.push({
        id: bookmarkDoc.id,
        markedDate: markedDate,
        article: articleBookmark,
      });
    }

    const success : SuccessResponseModel = {
      statusCode: 200,
      message: "Successfully fetched bookmarks",
      data: bookmarks,
    };
    response.send(success);
  } catch (err) {
    const errRes: BaseResponseModel = ({
      statusCode: 500,
      message: String(err),
    });
    response.send(errRes);
  }
};

export const unmarkArticleController = async (request: Request, response: Response) => {
  try {
    const {bookmarkId} = request.body;
    if (!bookmarkId) {
      throw Error("Missing required field: articleId");
    }

    const userRecord = await getUserFromToken(request);

    if (!(userRecord instanceof UserRecord)) {
      throw Error(userRecord);
    }

    const userRef = db.collection(Collection.users).doc(userRecord.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: String("User not exist"),
      });
      response.send(errRes);
    }

    const bookmarkRef = userRef.collection(Collection.bookmarks).doc(bookmarkId);
    const bookmarkDoc = await bookmarkRef.get();
    if (!bookmarkDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: String("Bookmark not exist"),
      });
      response.send(errRes);
    }
    bookmarkRef.delete()
      .then(() => {
        const success : BaseResponseModel = {
          statusCode: 200,
          message: "Bookmark is unmarked now",
        };
        response.send(success);
      }).catch((err) => {
        throw Error(err);
      });
  } catch (err) {
    const errRes: BaseResponseModel = ({
      statusCode: 500,
      message: String(err),
    });
    response.send(errRes);
  }
};


const getBookmarkArticle = async (articleId: string) => {
  try {
    const articleRef = db.collection(Collection.articles).doc(articleId);
    const articleDoc = await articleRef.get();
    if (!articleDoc.exists) {
      return null;
    }
    const articleData = articleDoc.data();
    const article = {
      category: articleData?.category.id,
      title: articleData?.title,
      coverImage: articleData?.cover,
      publishedDate: articleData?.publishedDate.toDate().toLocaleDateString(),
    };
    return article;
  } catch (err) {
    return null;
  }
};
