import express from "express";
import multer from "multer";
import {
  getAllImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
  toggleLike,
  getTrending,
  bulkUpdatePositions,
} from "../controllers/imageController.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

/**
 * @route   GET /api/images
 * @desc    Get all images with pagination & filtering
 */
router.get("/", getAllImages);

/**
 * @route   GET /api/images/trending
 * @desc    Get trending images
 */
router.get("/trending", getTrending);

/**
 * @route   GET /api/images/:id
 * @desc    Get single image by ID
 */
router.get("/:id", getImageById);

/**
 * @route   POST /api/images
 * @desc    Upload new image
 */
router.post("/", upload.single("image"), uploadImage);

/**
 * @route   PUT /api/images/:id
 * @desc    Update image metadata
 */
router.put("/:id", updateImage);

/**
 * @route   DELETE /api/images/:id
 * @desc    Delete image
 */
router.delete("/:id", deleteImage);

/**
 * @route   POST /api/images/:id/like
 * @desc    Like / Unlike image
 */
router.post("/:id/like", toggleLike);

/**
 * @route   PUT /api/images/positions/bulk
 * @desc    Bulk update image positions
 */
router.put("/positions/bulk", bulkUpdatePositions);

export default router;
