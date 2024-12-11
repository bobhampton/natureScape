import { feedback } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "./helpers.js"
import userData from "./users.js"

const createFeedback = async (feedbackInput, userId) => {
    console.log("feedbackInput:", feedbackInput); // Log input
    const checkedFeedback = validation.checkString(feedbackInput, 'Feedback');
    const checkedUserId = validation.checkString(userId, 'userId');

    const user = await userData.getUserById(checkedUserId);
    if(!user) throw "No user found with the given ID";

    const feedbackCollection = await feedback();

    // Check the most recent feedback by the user
    const recentFeedback = await feedbackCollection.findOne(
        { user: checkedUserId },
        { sort: { _id: -1 } } // Sort by most recent
    );

    if (recentFeedback) {
        const feedbackTime = new Date(recentFeedback.timestamp);
        const currentTime = new Date();

        // Allow feedback only if more than 7 days have passed
        const timeDifference = (currentTime - feedbackTime) / (1000 * 60 * 60 * 24); // Time in days
        if (timeDifference < 7) {
            throw "You can only provide feedback once every 7 days.";
        }
    }


    //insert new feedback
    const feedbackObj = {
        _id: new ObjectId(),
        user: checkedUserId,
        feedback: checkedFeedback,
        timestamp: new Date() //Record current time
    };


    const insertInfo = await feedbackCollection.insertOne(feedbackObj);
    //Need to debug this!!!
    if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Could not complete feedback submittal";
    }
    
    return { insertedId: insertInfo.insertedId, message: "Feedback submitted successfully!" };

};

const getAllFeedback = async () => {
    const feedbackCollection = await feedback();
    const feedbackList = await feedbackCollection
        .find()
        .project({_id: 1, user: 1, feedback: 1, timestamp: 1})
        .toArray();
    if (!feedbackList) throw "Could not get all feedback";
    return feedbackList;
};

export {
    createFeedback,
    getAllFeedback
};