import {DocumentReference, Timestamp} from "firebase-admin/firestore";

export interface ArticleModel {
    title: string;
    content: string;
    category?: DocumentReference;
    channel: DocumentReference;
    cover: string;
    publishedDate: Timestamp;
    updatedDate: Timestamp;
}
