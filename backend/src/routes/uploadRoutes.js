const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadAvatar, uploadDoc } = require('../middleware/upload');
const { uploadAvatar: uploadAvatarCtrl, uploadDocument, deleteAsset } = require('../controllers/uploadController');

const router = express.Router();

router.use(protect);

router.post('/avatar', uploadAvatar.single('file'), uploadAvatarCtrl);
router.post('/document', uploadDoc.single('file'), uploadDocument);
router.delete('/:publicId', deleteAsset);
router.delete('/', deleteAsset); // To support DELETE /api/v1/uploads?publicId=xxx

module.exports = router;
