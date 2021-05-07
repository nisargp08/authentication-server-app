import multer from 'multer';

// Empty multer options as we don't need to store the image on server
// since we are using s3 to store the images
const upload = multer();

export default upload;
