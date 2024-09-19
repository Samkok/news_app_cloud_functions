import {functions} from "./config";
import {createCategoryController, deleteCategoryController, getAllCategoriesController} from "./controllers/categoryController";

export const createCategory = functions.https.onRequest(createCategoryController);

export const getAllCategories = functions.https.onRequest(getAllCategoriesController);

export const deleteCategory = functions.https.onRequest(deleteCategoryController);
