import {Request} from "express";
import {auth} from "../config";
import { UserRecord } from "firebase-admin/auth";

export const checkAuth = async (request: Request) : Promise<UserRecord> => {
  const userRecord = await getUserFromToken(request);
  if (!(userRecord instanceof UserRecord) || userRecord == null) {
    throw Error("Invalid token");
  }
  return userRecord;
};

export const getUserFromToken = async (request: Request) => {
  const idToken = request.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    throw Error("Unauthorized");
  }

  const decodedToken = await auth.verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const userRecord = await auth.getUser(uid);

  return userRecord;
};
