// src/config.ts
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();
const env: string = process.env.NODE_ENV || "uat";
let serviceAccount: admin.ServiceAccount;
let storageBucket;

console.log("NODE_ENV:", env);
console.log("ALL ENV:", process.env);
console.log("GOOGLE_APPLICATION_CREDENTIALS_UAT:", process.env.GOOGLE_APPLICATION_CREDENTIALS_UAT);
console.log("GOOGLE_APPLICATION_CREDENTIALS_PRO:", process.env.GOOGLE_APPLICATION_CREDENTIALS_PRO);
console.log("STORAGE_BUCKET_UAT:", process.env.STORAGE_BUCKET_UAT);
console.log("STORAGE_BUCKET_PRO:", process.env.STORAGE_BUCKET_PRO);

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
