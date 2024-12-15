import fs from 'fs';
import distExiftool from 'dist-exiftool';
import exiftool from 'node-exiftool';
import { convert } from 'geo-coordinates-parser'
import sharp from 'sharp'
import exifReader from 'exif-reader'

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

const metadata = {
    all: '', // remove all metadata at first
    GPSLatitude: latitude,
    GPSLatitudeRef: latitude,
    GPSLongitude: longitude,
    GPSLongitudeRef: longitude,
    CreateDate: createDate,
    ImageDescription: area
}

let returnMetaWrite = await updateAndReadMetadata(imagePath, metadata)
let converted

try {
    converted = convert(returnMetaWrite.gpsPosition)
} catch (error) {
    console.error(error);
}

// Extract metadata from the image using sharp
const imageMeta = sharp(imagePath).withMetadata().toFormat('jpeg')
let sharpMetadata = await imageMeta.metadata() 

sharpMetadata.exif = exifReader(sharpMetadata.exif)
    
    return returnMetaWrite
}

