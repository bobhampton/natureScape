import { users, photos, comments } from '../config/mongoCollections.js'

export const seedComments = async () => {
  console.log('Seeding comments...')

  let comment = {
    photo_Id: null,
    user_Id: null,
    comment_text: null,
    creation_time: null
  }

  let commentTextArr = [
    'This is a great photo!',
    'Amazing view!',
    'Stunning scenery!',
    'Beautiful landscape!',
    'Breathtaking shot!',
    'Love the colors in this photo!',
    'Such a peaceful place!',
    'Incredible capture!',
    'Nature at its best!',
    'This is so serene!',
    'Fantastic composition!',
    'The lighting is perfect!',
    'What a picturesque scene!',
    'This looks like a painting!',
    'So vibrant and alive!',
    'The details are amazing!',
    'This photo is so calming!',
    'I wish I was there!',
    'Such a majestic view!',
    'The perspective is great!',
    'This is pure beauty!',
    'The scenery is stunning!',
    'This photo is so refreshing!',
    'I love the depth in this shot!',
    'The colors are so vivid!',
    'This is a masterpiece!',
    'Such a tranquil scene!',
    'The landscape is breathtaking!',
    'This photo is so inspiring!',
    'The clarity is amazing!',
    'This is a perfect shot!',
    'The view is incredible!',
    'This photo is so soothing!',
    'The composition is excellent!',
    'This is a beautiful capture!',
    'The scenery is so peaceful!',
    'This photo is so vibrant!',
    'The details are stunning!',
    'This is a fantastic shot!',
    'The landscape is so serene!',
    'This photo is so picturesque!',
    'The colors are amazing!',
    'This is a breathtaking view!',
    'The lighting is perfect!',
    'This photo is so calming!',
    'The perspective is great!',
    'This is pure beauty!',
    'The scenery is stunning!',
    'This photo is so refreshing!',
    'The depth in this shot is amazing!',
    'The colors are so vivid!',
    'This is a masterpiece!',
    'Such a tranquil scene!',
    'The landscape is breathtaking!',
    'This photo is so inspiring!',
    'The clarity is amazing!',
    'This is a perfect shot!',
    'The view is incredible!',
    'This photo is so soothing!',
    'The composition is excellent!',
    'This is a beautiful capture!',
    'The scenery is so peaceful!',
    'This photo is so vibrant!',
    'The details are stunning!',
    'This is a fantastic shot!',
    'The landscape is so serene!',
    'This photo is so picturesque!',
    'The colors are amazing!',
    'This is a breathtaking view!',
    'The lighting is perfect!',
    'This photo is so calming!',
    'The perspective is great!',
    'This is pure beauty!'
  ]

  try {
    const userCollection = await users()
    const allUsers = await userCollection.find({}).toArray()
    const photoCollection = await photos()
    const allPhotos = await photoCollection.find({}).toArray()
    const commentCollection = await comments()

    let userNum = 0
    let maxUsers = allUsers.length
    let maxPhotos = allPhotos.length

    for (let i = 0; i < maxPhotos; i++) {
      if (userNum > maxUsers) {
        userNum = 0
      }

      

      // Randomly select between 0-5 comments to add to the photo
      const randomNumComments = Math.floor(Math.random() * 5)

      for (let j = 0; j < randomNumComments; j++) {
        if (userNum >= maxUsers) {
          userNum = 0
        }

        // Randomly select 1 of 72 comments
      const randomComment = Math.floor(Math.random() * 73)

        // Get the current time in UTC
        const temp = Date.now()
        const uploadTimeStampUTC = new Date(temp)

        let photo_Id = allPhotos[i]._id
        let user_Id = allUsers[userNum]._id
        let comment_text = commentTextArr[randomComment]
        let creation_time = uploadTimeStampUTC

        comment = {
          photo_Id,
          user_Id,
          comment_text,
          creation_time
        }

        const insertInfo = await commentCollection.insertOne(comment)
        if (!insertInfo.acknowledged || !insertInfo.insertedId)
          throw `Could not add comment for: ${comment.photo_Id}`

        userNum++
      }
    }
  } catch (e) {
    console.error('Error seeding comments:', e)
  }
}
