const firebaseStorage = require('../connections/firebase_admin').storage;
require('dotenv').config();

const bucket = firebaseStorage.bucket(process.env.BUCKET_URL);

// 取得檔案列表
const getFileList = () => {
  const promise = new Promise((resolve, reject) => {
    const fileList = [];
    bucket.getFiles().then((data) => {
      data[0].forEach((item) => {
        fileList.push(item.name);
      });
      resolve(fileList);
    }).catch((error) => {
      reject(new Error('取得表單列表失敗', error));
    });
  });
  return promise;
};

// 刪除已上傳的檔案
const delFile = (delfileName) => {
  if (!delfileName) { return; }
  bucket.file(delfileName).delete();
};

// 上傳檔案
const uploadFile = (file, originalFileName) => {
  const promise = new Promise((resolve, reject) => {
    // 如果有原資料則刪除
    if (originalFileName) {
      delFile(originalFileName);
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const fileName = `${timestamp}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream();

    blobStream.on('error', (err) => {
      reject(new Error('上傳檔案失敗', err));
    });

    blobStream.on('finish', () => {
      const options = {
        action: 'read',
        expires: '01-01-2025',
      };
      fileUpload.getSignedUrl(options).then((results) => {
        resolve({
          fileName,
          fileUrl: results[0],
        });
      }).catch((err) => {
        reject(new Error('取得上傳檔案 url 失敗', err));
      });
    });
    blobStream.end(file.buffer);
  });
  return promise;
};

module.exports = { uploadFile, getFileList, delFile };
