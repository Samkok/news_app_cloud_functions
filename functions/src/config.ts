// src/config.ts
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firebase services that you want to use across your project
const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

export {db, bucket, admin, functions, auth};
