import { dbConnection, closeConnection } from '../config/mongoConnection.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { photos } from '../config/mongoCollections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection()
  await db.dropDatabase()

const seedImages = async () => {
    const imageFolder = path.join(__dirname, '../seed_images'); // Adjust the path as necessary
    const imageFiles = fs.readdirSync(imageFolder);

    for (const file of imageFiles) {
        const filePath = path.join(imageFolder, file);
        const fileExtension = path.extname(file).toLowerCase();

        // Filter out non-image files like .DS_Store >_<
        if (!['.jpg', '.jpeg', '.png', '.heic'].includes(fileExtension)) {
            console.log(`Non-image file ${file} found, skipping...`);
            continue;
        }

        const fileData = fs.readFileSync(filePath);
        const contentType = 'image/' + fileExtension.slice(1);

        const newImage = {
            name: path.basename(file, fileExtension),
            desc: 'Seed image',
            img: {
                data: Buffer.from(fileData),
                contentType: contentType,
            },
        };

        try {
            await db.collection('photos').insertOne(newImage);
            console.log(`Image ${file} saved to database`);
        } catch (err) {
            console.error(`Error saving image ${file}:`, err);
        }
    }
};

const runSeed = async () => {
    await seedImages();
    await closeConnection()
    console.log('Done!')
};

runSeed();