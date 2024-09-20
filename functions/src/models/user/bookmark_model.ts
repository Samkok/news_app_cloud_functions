import {Timestamp} from "firebase-admin/firestore";

export interface BookmarkModel {
    articleId: string;
    markedDate: Timestamp;
}
