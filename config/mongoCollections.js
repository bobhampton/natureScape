import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// List collections here:
export const photos = getCollectionFn('photos');
export const users = getCollectionFn('users');
export const comments = getCollectionFn('comments');
export const locations = getCollectionFn('locations');