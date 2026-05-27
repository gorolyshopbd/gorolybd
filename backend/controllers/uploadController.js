// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Image uploaded successfully',
    image: imageUrl,
    filename: req.file.filename,
  });
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadMultipleImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const images = req.files.map((file) => ({
    image: `/uploads/${file.filename}`,
    filename: file.filename,
  }));
  res.json({
    message: `${images.length} image(s) uploaded successfully`,
    images,
  });
};

export { uploadImage, uploadMultipleImages };
