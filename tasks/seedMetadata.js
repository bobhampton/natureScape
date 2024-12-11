import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import distExiftool from 'dist-exiftool';
import exiftool from 'node-exiftool';
import exifReader from 'exif-reader';
import { convert } from 'geo-coordinates-parser'
import sharp from 'sharp'


export const updateAndReadMetadata = async (imagePath, metadata) => {

    const ep = new exiftool.ExiftoolProcess(distExiftool);
    let returnObj = {
        area: '',
        gpsPosition: '',
        date_time_taken: '',
    }

    try {

        await ep.open();

        // Write metadata
        const writeResult = await ep.writeMetadata(imagePath, metadata, ['overwrite_original']);

        // Read metadata
        const rs = fs.createReadStream(imagePath);
        const readResult = await ep.readMetadata(rs, ['-File:all']);

        // Set returnObj w/ metadata
        returnObj.area = readResult.data[0].ImageDescription;
        returnObj.gpsPosition = readResult.data[0].GPSPosition;
        returnObj.date_time_taken = readResult.data[0].CreateDate;

    } catch (error) {
        console.error(error);
    } finally {
        await ep.close();
    }
    return returnObj
};

// Function to add metadata to an image
/* 
    args from 'seedImages.js'

    metaSeedIN = {
        imagePath: filePath, 
        area: manualLatLon[fileName].area, 
        latitude: manualLatLon[fileName].latitude, 
        longitude: manualLatLon[fileName].longitude, 
        createDate: `${takenYear}:${takenMonth}:${takenDay} 00:00:00`
    }

*/
export const addMetadata = async (imagePath, area, latitude, longitude, createDate) => {

// Get the directory name
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Define the path to the image
//const imagePath = path.join(__dirname, 'images', 'image.jpg');

// const ep = new exiftool.ExiftoolProcess(distExiftool)
// let latitude = 53.255201
// let longitude = -2.74744
// let createDate = '2021:07:01 00:00:00' //(use YYYY:mm:dd HH:MM:SS[.ss][+/-HH:MM|Z])

const metadata = {
    all: '', // remove all metadata at first
    GPSLatitude: latitude,
    GPSLatitudeRef: latitude,
    GPSLongitude: longitude,
    GPSLongitudeRef: longitude,
    CreateDate: createDate,
    ImageDescription: area
    //DocumentName
}

let returnMetaWrite = await updateAndReadMetadata(imagePath, metadata)
//console.log('returnObj', returnObj)

let converted

try {
    converted = convert(returnMetaWrite.gpsPosition)
    //console.log('converted', converted);
} catch (error) {
    console.error(error);
}

// Extract metadata from the image using sharp
const imageMeta = sharp(imagePath).withMetadata().toFormat('jpeg')
let sharpMetadata = await imageMeta.metadata()

//console.log('\nSHARPmetadata', sharpMetadata);  

sharpMetadata.exif = exifReader(sharpMetadata.exif)

console.log('\nsharpMetadata.exif', sharpMetadata.exif)
    
    return returnMetaWrite
}

