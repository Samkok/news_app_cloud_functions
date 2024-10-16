// src/config.ts
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();
const env: string = process.env.NODE_ENV || "uat";
let serviceAccount: admin.ServiceAccount;
let storageBucket;

switch (env) {
case "uat":
  serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS_UAT as string));
  storageBucket = process.env.STORAGE_BUCKET_UAT;
  break;
case "pro":
  serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS_PRO as string));
  storageBucket = process.env.STORAGE_BUCKET_PRO;
  break;
default:
  throw new Error("Unknown environment");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket,
  });
}

// Export Firebase services that you want to use across your project
const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

export {db, bucket, admin, functions, auth};
