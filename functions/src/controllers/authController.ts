import {Request, Response} from "express";
import {auth, db} from "../config";
import {UserCreatedResponseModel} from "../models/user/user_created_response_model";
import {BaseResponseModel} from "../models/base_response_model";
import {SignUpRequestModel} from "../models/user/sign_up_request_model";
import {uploadImageService} from "../services/imageService";
import {UserModel} from "../models/user/user_model";
import {Timestamp} from "firebase-admin/firestore";
import {Collection} from "../const/collection";

export const signUpUserController = async (request: Request, response: Response) => {
  try {
    const {firstName, lastName, email, password, bio, profileImage, coverImage}: SignUpRequestModel = request.body;
    if (!firstName || !lastName || !email || !password ) {
      throw Error("Missing required fields: firstName, lastName, email, password, bio");
    }

    let userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const profileImg = profileImage ? await uploadImageService({
      filePath: profileImage,
      collection: Collection.users,
      id: userRecord.uid,
    }) : "";

    const coverImg = coverImage ? await uploadImageService({
      filePath: coverImage,
      collection: Collection.users,
      id: userRecord.uid,
    }) : "";

    userRecord = await auth.updateUser(userRecord.uid, {
      photoURL: profileImg,
    });

    // Create user in database
    const userRef = db.collection(Collection.users).doc(userRecord.uid);
    const user : UserModel = ({
      firstName,
      lastName,
      email,
      bio: bio ? bio : "",
      profileImage: profileImg,
      coverImage: coverImg,
      createdAt: Timestamp.now(),
    });
    userRef.set(user)
      .then(async () => {
        const userToken = await auth.createCustomToken(userRecord.uid);
        const res: UserCreatedResponseModel = ({
          statusCode: 200,
          message: "User successfully created",
          userToken: userToken,
        });
        response.send(res);
      }).catch((err) => {
        throw Error(String(err));
      });
  } catch (err) {
    const errRes: BaseResponseModel = ({
      statusCode: 500,
      message: String(err),
    });
    response.send(errRes);
  }
};

export const getUserFromToken = async (request: Request) => {
  try {
    const idToken = request.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return "Unauthorized";
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecode = await auth.getUser(uid);

    return userRecode;
  } catch (err) {
    return "Unauthorized";
  }
};
