import {db} from "../config";
import {Request, Response} from "express";
import {Timestamp} from "firebase-admin/firestore";
import {ArticleModel} from "../models/article/article_model";
import {uploadImageService} from "../services/imageService";
import {BaseResponseModel} from "../models/base_response_model";
import {ArticleRequestModel} from "../models/article/article_request_model";
import {Collection} from "../const/collection";
import {SuccessResponseModel} from "../models/success_response_model";
import {checkAuth} from "../services/authService";

export const getAllArticlesController = async (request: Request, response: Response) => {
  try {
    const snapshot = await db.collection(Collection.articles).get();
    if (snapshot.empty) {
      response.send("No articles");
      return;
    }

    const articles = [];

    for (const doc of snapshot.docs) {
      const artData = doc.data();
      const channelId = artData.channel;
      let channelData = null;
      if (channelId) {
        const channelDoc = await db.collection(Collection.users).doc(channelId).get();
        const id = channelDoc.id;
        channelData = channelDoc.exists ? {id: id, ...channelDoc.data()} : null;
      }

      const categoryId = artData.category;
      let categoryData = null;
      if (categoryId) {
        const categoryDoc = await db.collection(Collection.categories).doc(categoryId).get();
        const id = categoryDoc.id;
        categoryData = categoryDoc.exists ? {id: id, ...categoryDoc.data()} : null;
      }

      const publishedDate = artData.publishedDate;
      let publishedDateFormated = null;
      if (publishedDate) {
        publishedDateFormated = publishedDate.toDate().toLocaleString();
      }

      const updatedDate = artData.updatedDate;
      let updatedDateFormated = null;
      if (updatedDate) {
        updatedDateFormated = updatedDate.toDate().toLocaleString();
      }

      articles.push({
        id: doc.id,
        ...artData,
        channel: channelData,
        category: categoryData,
        publishedDate: publishedDateFormated,
        updatedDate: updatedDateFormated,
      });
    }

    response.status(200).json(articles);
  } catch (err) {
    response.status(500).send(err);
  }
};

export const getArticleController = async (request: Request, response: Response) => {
  try {
    const {articleId} = request.body;
    if (!articleId) {
      throw Error("Missing required field: articleId");
    }
    const articleRef = db.collection(Collection.articles).doc(articleId);
    const articleDoc = await articleRef.get();
    if (!articleDoc.exists) {
      const errorMsg: BaseResponseModel = {
        statusCode: 404,
        message: "Article not found",
      };
      response.status(404).send(errorMsg);
      return;
    }

    const artData = articleDoc.data()!;
    const channelId = artData.channel;
    let channelData = null;
    if (channelId) {
      const channelDoc = await db.collection(Collection.users).doc(channelId).get();
      const id = channelDoc.id;
      channelData = channelDoc.exists ? {id: id, ...channelDoc.data()} : null;
    }

    const categoryId = artData.category;
    let categoryData = null;
    if (categoryId) {
      const categoryDoc = await db.collection(Collection.categories).doc(categoryId).get();
      const id = categoryDoc.id;
      categoryData = categoryDoc.exists ? {id: id, ...categoryDoc.data()} : null;
    }

    const publishedDate = artData.publishedDate;
    let publishedDateFormated = null;
    if (publishedDate) {
      publishedDateFormated = publishedDate.toDate().toLocaleString();
    }

    const updatedDate = artData.updatedDate;
    let updatedDateFormated = null;
    if (updatedDate) {
      updatedDateFormated = updatedDate.toDate().toLocaleString();
    }

    const articleData = {
      id: articleDoc.id,
      ...artData,
      channel: channelData,
      category: categoryData,
      publishedDate: publishedDateFormated,
      updatedDate: updatedDateFormated,
    };

    const success : SuccessResponseModel = {
      statusCode: 200,
      message: "success",
      data: articleData,
    };
    response.send(success);
  } catch (err) {
    const errorMsg: BaseResponseModel = {
      statusCode: 500,
      message: String(err),
    };
    response.status(500).send(errorMsg);
  }
};

export const createArticleController = async (request: Request, response: Response) => {
  try {
    const {title, content, category, cover} : ArticleRequestModel = request.body;
    if (!title || !content || !category || !cover) {
      const errorMsg: BaseResponseModel = {
        statusCode: 400,
        message: "Missing required fields: title, content, category or cover Image",
      };
      response.status(400).send(errorMsg);
      return;
    }

    const userRecord = await checkAuth(request);

    const channelRef = db.doc(`${Collection.users}/${userRecord.uid}`);
    const channelDoc = await channelRef.get();
    if (!channelDoc.exists) {
      const errorMsg: BaseResponseModel = {
        statusCode: 400,
        message: "You refer to channel that doesn't exist",
      };
      response.status(400).send(errorMsg);
      return;
    }

    const categoryRef = db.doc(`${Collection.categories}/${category}`);
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      const errorMsg: BaseResponseModel = {
        statusCode: 400,
        message: "You refer to category that doesn't exist",
      };
      response.status(400).send(errorMsg);
      return;
    }

    const coverUrl = await uploadImageService({
      filePath: cover,
      collection: Collection.articles,
      id: userRecord.uid,
    });

    const publishedDate = Timestamp.now();
    const updatedDate = Timestamp.now();

    const articleRef = db.collection(Collection.articles);
    const articleData: ArticleModel = {
      title: title,
      content: content,
      channel: userRecord.uid,
      category: category,
      cover: coverUrl,
      publishedDate: publishedDate,
      updatedDate: updatedDate,
    };
    articleRef.add(articleData)
      .then((doc) => {
        const successModel: SuccessResponseModel = {
          statusCode: 200,
          message: "Article successfully created",
          data: {id: doc.id},
        };
        response.send(successModel);
      })
      .catch((err) => {
        response.status(500).send(err);
      });
  } catch (err) {
    const errorMsg: BaseResponseModel = {
      statusCode: 500,
      message: String(err),
    };
    response.status(500).send(errorMsg);
  }
};

export const updateArticleController = async (request: Request, response: Response) => {
  try {
    const {id, title, content, category} = request.body;
    if (!id) {
      const errorMsg: BaseResponseModel = {
        statusCode: 400,
        message: "Missing required fields: ID",
      };
      response.status(400).send(errorMsg);
      return;
    }

    const articleRef = db.collection(Collection.articles).doc(id);
    const articleDoc = await articleRef.get();
    if (!articleDoc.exists) {
      const errorMsg: BaseResponseModel = {
        statusCode: 404,
        message: "Article not found",
      };
      response.status(404).send(errorMsg);
      return;
    }

    // Authentication and Authorization
    const userRecord = await checkAuth(request);
    const articleData = articleDoc.data()!;
    if (articleData.channel != userRecord.uid) {
      const errorMsg: BaseResponseModel = {
        statusCode: 401,
        message: "Unauthorized",
      };
      response.status(404).send(errorMsg);
      return;
    }

    const updateData : any = {};
    if (title) updateData.title = title;
    if (content) updateData.title = content;
    if (category) {
      const categoryRef = db.doc(`${Collection.categories}/${category}`);
      const categoryDoc = await categoryRef.get();
      if (!categoryDoc.exists) {
        const errorMsg: BaseResponseModel = {
          statusCode: 400,
          message: "You refer to category that doesn't exist",
        };
        response.status(400).send(errorMsg);
        return;
      }
      updateData.catorory = category;
    }

    const updatedDate = Timestamp.now();
    updateData.updatedDate = updatedDate;

    articleRef.update(updateData)
      .then(() => {
        const successModel: BaseResponseModel = {
          statusCode: 200,
          message: "Article successfully updated",
        };
        response.send(successModel);
      })
      .catch((err) => {
        response.status(500).send(err);
      });
  } catch (err) {
    const errorMsg: BaseResponseModel = {
      statusCode: 404,
      message: String(err),
    };
    response.status(500).send(errorMsg);
  }
};

export const deleteArticleController = async (request: Request, response: Response) => {
  try {
    const {id} = request.body;
    if (!id) {
      const errorMsg: BaseResponseModel = {
        statusCode: 400,
        message: "Missing required fields: ID",
      };
      response.status(400).send(errorMsg);
      return;
    }

    const articleRef = db.collection(Collection.articles).doc(id);
    const articleDoc = await articleRef.get();
    if (!articleDoc.exists) {
      const errorMsg: BaseResponseModel = {
        statusCode: 404,
        message: "Article not found",
      };
      response.status(404).send(errorMsg);
      return;
    }

    // Authentication and Authorization
    const userRecord = await checkAuth(request);
    const articleData = articleDoc.data()!;
    if (articleData.channel != userRecord.uid) {
      const errorMsg: BaseResponseModel = {
        statusCode: 401,
        message: "Unauthorized",
      };
      response.status(404).send(errorMsg);
      return;
    }

    articleRef.delete()
      .then(() => {
        const successModel: BaseResponseModel = {
          statusCode: 200,
          message: "Article successfully deleted",
        };
        response.send(successModel);
      })
      .catch((err) => {
        response.status(500).send(err);
      });
  } catch (err) {
    const errorMsg: BaseResponseModel = {
      statusCode: 404,
      message: String(err),
    };
    response.status(500).send(errorMsg);
  }
};
