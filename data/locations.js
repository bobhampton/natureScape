import { photos, locations } from '../config/mongoCollections.js';

export const getAllPhotos = async () => {
    const photoCollection = await photos();
    const locationCollection = await locations();

    const photoList = await photoCollection.aggregate([
        {
            $lookup: {
                from: 'locations',
                localField: 'location.location_id',
                foreignField: '_id',
                as: 'locationDetails'
            }
        },
        {
            $unwind: {
                path: '$locationDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                photo_name: 1,
                location: 1,
                img: 1,
                locationDetails: 1
            }
        }
    ]).toArray();

    const result = photoList.map(photo => ({
        id: photo._id.toString(),
        name: photo.photo_name,
        coordinates: [photo.location.longitude, photo.location.latitude],
        img: photo.img,
        location_id: photo.locationDetails?._id || null,
        state: photo.locationDetails?.state || null,
        city: photo.locationDetails?.city || null,
        area_name: photo.locationDetails?.area || null
    }));

    return result;
};