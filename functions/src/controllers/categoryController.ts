import {Request, Response} from "express";
import {BaseResponseModel} from "../models/base_response_model";
import {db} from "../config";
import {Collection} from "../const/collection";
import {SuccessResponseModel} from "../models/success_response_model";

export const createCategoryController = async (request: Request, response: Response) => {
  try {
    const {name} = request.body;
    if (!name) {
      throw Error("Missing required field: name");
    }
    const categoriesRef = db.collection(Collection.categories);
    const categoryDoc = await categoriesRef.get();
    categoryDoc.docs.find((doc) => {
      const catData = doc.data();
      if (catData.name.trim() === name.trim()) {
        throw Error("Category already exists");
      }
    });

    categoriesRef.add({
      name: name,
    }).then((doc) => {
      const success : SuccessResponseModel = {
        statusCode: 200,
        message: "Category is successfully created",
        data: {id: doc.id},
      };
      response.send(success);
    }).catch((err) => {
      throw Error(err);
    });
  } catch (err) {
    const errRes : BaseResponseModel = {
      statusCode: 500,
      message: String(err),
    };
    response.send(errRes);
  }
};

export const getAllCategoriesController = async (request: Request, response: Response) => {
  try {
    const catRef = db.collection(Collection.categories);
    const catDoc = await catRef.get();
    const categories = [];

    if (!catDoc.empty) {
      for (const doc of catDoc.docs) {
        const catData = doc.data();
        categories.push({
          id: doc.id,
          ...catData,
        });
      }
    }

    const success : SuccessResponseModel = {
      statusCode: 200,
      message: "Successfully fetched",
      data: categories,
    };
    response.send(success);
  } catch (err) {
    const errRes : BaseResponseModel = {
      statusCode: 500,
      message: err,
    };
    response.send(errRes);
  }
};

export const deleteCategoryController = async (request: Request, response: Response) => {
  try {
    const {id} = request.body;
    if (!id) {
      throw Error("Missing required field: id");
    }
    const catRef = db.collection(Collection.categories).doc(id);
    const catDoc = await catRef.get();
    if (!catDoc.exists) {
      const errRes : BaseResponseModel = {
        statusCode: 404,
        message: "Category not found",
      };
      response.send(errRes);
      return;
    }
    catRef.delete()
      .then(() => {
        const success : BaseResponseModel = {
          statusCode: 200,
          message: "Category deleted",
        };
        response.send(success);
      }).catch((err) => {
        throw Error(err);
      });
  } catch (err) {
    const errRes : BaseResponseModel = {
      statusCode: 500,
      message: err,
    };
    response.send(errRes);
  }
};
