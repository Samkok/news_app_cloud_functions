import {Timestamp} from "firebase-admin/firestore";

export interface FollowModel {
    follower: string;
    followed: string;
    followDate: Timestamp;
}
