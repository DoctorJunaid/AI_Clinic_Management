const cloudinary = require('../config/cloudinary');

// Utility function to delete an asset from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res;
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error.message);
  }
};

// @desc    Upload avatar picture
// @route   POST /api/v1/uploads/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload medical document / scan / PDF
// @route   POST /api/v1/uploads/document
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        name: req.file.originalname,
        url: req.file.path,
        publicId: req.file.filename,
        fileType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete asset from Cloudinary
// @route   DELETE /api/v1/uploads/:publicId
// @access  Private
const deleteAsset = async (req, res) => {
  try {
    // Cloudinary filenames/publicIds can contain slashes (e.g. medflow_avatars/xxx).
    // Let's decode or grab the full parameter path just in case, or express handles it.
    // In express, req.params.publicId might be truncated if there is a slash,
    // so we can support receiving it as a query parameter or path.
    const publicId = req.params.publicId || req.query.publicId;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Please provide publicId' });
    }

    await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully from Cloudinary'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadAvatar,
  uploadDocument,
  deleteAsset,
  deleteFromCloudinary
};
