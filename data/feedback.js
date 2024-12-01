import { feedback, feedback } from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import checkString from "helpers.js"
import getUserById from "user.js"

const createFeedback = async (feedbackInput, userId) => {
    checkedFeedback = checkString(feedbackInput, 'Feedback');
    checkedUserId = checkString(userId, 'userId');

    const user = await getUserById(checkedUserId);

    if(!user) throw "No user found with the given ID";

    const feedbackObj = {
        _id: new ObjectId(),
        user: checkedUserId,
        feedback: checkedFeedback
    };

    const feedbackCollection = await feedback();
    const insertInfo = await feedbackCollection.insertOne(feedbackObj);
    if (!insertInfo.acknowledged || !insertInfo.insertId) throw "Could not complete feedback submittal";

};

const getAllFeedback = async () => {
    const feedbackCollection = await feedback();
    const feedbackList = await feedbackCollection
        .find()
        .project({_id: 1, user: 1, feedback: 1})
        .toArray();
    if (!feedbackList) throw "Could not get all feedback";
    return feedbackList;
};

export {
    createFeedback,
    getAllFeedback
};