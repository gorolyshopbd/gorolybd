import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Images only! (jpg, jpeg, png, webp, gif, svg)'));
};

const checkPdfType = (file, cb) => {
  const extname = /pdf/.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /pdf/.test(file.mimetype);
  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('PDF files only!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const uploadPdfMiddleware = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkPdfType(file, cb);
  },
});

export default upload;
export { uploadPdfMiddleware };
