// Amazon s3 bucket config file
const S3 = require('aws-sdk/clients/s3');

require('dotenv').config();
// Get auth credentials
const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_KEY_ID;

const s3 = new S3({
  bucketRegion,
  accessKey,
  secretKey,
});

export function uploadFileToS3(file) {
  const uploadParams = {
    Bucket: bucketName,
    Key: file.formattedName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(uploadParams).promise();
}

export function deleteFileFromS3(fileUrl) {
  // Get the file key from fileUrl
  const keyPattern = fileUrl.split('/');
  const key = keyPattern[keyPattern.length - 1];

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  return s3.deleteObject(deleteParams).promise();
}
