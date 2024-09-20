import {Timestamp} from "firebase-admin/firestore";

export interface ArticleModel {
    title: string;
    content: string;
    category?: string;
    channel: string;
    cover: string;
    publishedDate: Timestamp;
    updatedDate: Timestamp;
}
