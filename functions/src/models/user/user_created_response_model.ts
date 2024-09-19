import {BaseResponseModel} from "../base_response_model";

export interface UserCreatedResponseModel extends BaseResponseModel {
    userToken : string;
}
