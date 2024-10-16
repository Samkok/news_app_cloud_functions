import {db} from "../config";
import {Collection} from "../const/collection";
import {BaseResponseModel} from "../models/base_response_model";
import {Request, Response} from "express";
import {FollowModel} from "../models/follow/follow_model";
import {Timestamp} from "firebase-admin/firestore";
import {SuccessResponseModel} from "../models/success_response_model";
import {checkAuth} from "../services/authService";


export const followOrUnfollowUserOrChannelController = async (request: Request, response: Response) => {
  try {
    const {followedId} = request.body;

    const userRecord = await checkAuth(request);

    if (userRecord.uid == followedId) {
      throw Error("You can't follow yourself");
    }

    const userRef = db.collection(Collection.users).doc(followedId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: String("User or channel not exist"),
      });
      response.send(errRes);
      return;
    }

    const followRef = db.collection(Collection.follows);

    const followDocs = await followRef.get();
    const exists = followDocs.docs.find((doc) => {
      const followData = doc.data();
      return followData.follower == userRecord.uid && followData.followed == followedId;
    });

    if (exists) {
      followRef.doc(exists.id).delete().then(() => {
        const success: BaseResponseModel = {
          statusCode: 200,
          message: "Unfollow successful",
        };
        response.send(success);
        return;
      }).catch((err) => {
        throw Error(err);
      });
      return;
    }

    const followModel : FollowModel = {
      follower: userRecord.uid,
      followed: followedId,
      followDate: Timestamp.now(),
    };
    followRef.add(followModel).then(() => {
      const success: BaseResponseModel = {
        statusCode: 200,
        message: "Follow successful",
      };
      response.send(success);
      return;
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

export const getIfUserFollowChannelController = async (request: Request, response: Response) => {
  try {
    const {followedId} = request.body;
    if (!followedId) {
      throw Error("Missing required field: followedId");
    }

    const userRecord = await checkAuth(request);

    const userRef = db.collection(Collection.users).doc(followedId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: String("User or channel not exist"),
      });
      response.send(errRes);
      return;
    }

    const followRef = db.collection(Collection.userFollowersMap).doc(followedId);
    const followDoc = await followRef.get();
    if (!followDoc.exists) {
      const errRes: BaseResponseModel = ({
        statusCode: 404,
        message: String("Follow not exist"),
      });
      response.send(errRes);
      return;
    }

    const followData = followDoc.data();
    if (!followData) {
      throw Error("Follow data not found");
    }

    const followerRef = db.collection(Collection.userFollowersMap).doc(followedId).collection(Collection.followers);
    const followersDoc = await followerRef.get();
    const found = followersDoc.docs.find((doc) => {
      const data = doc.data();
      if (data.followerId == userRecord.uid) return true;
      return false;
    });

    if (!found) {
      throw Error("Error getting followers");
    }

    const success : SuccessResponseModel = {
      statusCode: 200,
      message: "Success",
      data: found,
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
