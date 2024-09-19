import {Timestamp} from "firebase-admin/firestore";

export interface UserModel {
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    profileImage: string;
    coverImage: string;
    createdAt: Timestamp;
}
