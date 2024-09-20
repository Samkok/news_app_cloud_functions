import {db, functions} from "./config";
import {Collection} from "./const/collection";
import {followOrUnfollowUserOrChannelController, getIfUserFollowChannelController} from "./controllers/followController";

export const followOrUnfollowUserOrChannel = functions.https.onRequest(followOrUnfollowUserOrChannelController);

export const getIfUserFollowChannel = functions.https.onRequest(getIfUserFollowChannelController);

export const onfollow = functions.firestore
  .document(`${Collection.follows}/{followsId}`)
  .onCreate(async (snapshot, context) => {
    try {
      const followRef = db.collection(Collection.follows).doc(context.params.followsId);
      const followDoc = await followRef.get();
      const followData = followDoc.data();

      if (!followData) {
        throw Error("Can't get data from follows collection");
      }

      const userFollowerRef = db.collection(Collection.userFollowersMap).doc(followData.followed);
      const followersRef = userFollowerRef.collection(Collection.followers);
      await followersRef.add({
        followerId: followData.follower,
      });
    } catch (err) {
      console.log(err);
    }
  });

export const onUnfollow = functions.firestore
  .document(`${Collection.follows}/{followsId}`)
  .onDelete(async (snapshot, context) => {
    try {
      const data = snapshot.data();

      const userFollowerRef = db.collection(Collection.userFollowersMap).doc(data.followed);
      const followersRef = userFollowerRef.collection(Collection.followers);
      const followersDocs = await followersRef.get();
      const followerId = followersDocs.docs.find((doc) => {
        const followerData = doc.data();
        return followerData.followerId == data.follower;
      });
      if (!followerId) {
        throw Error("Follow Id not found");
      }
      await followersRef.doc(followerId.id).delete();
    } catch (err) {
      console.log(err);
    }
  });
