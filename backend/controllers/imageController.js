import prisma from "../config/prisma.js";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all images with pagination and filtering
 */
export const getAllImages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "desc",
      sortBy = "createdAt",
      tags,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (tags) {
      where.tags = { hasSome: tags.split(",") };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = { [sortBy]: sort };

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.image.count({ where }),
    ]);

    res.json({
      success: true,
      data: images,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / take),
        limit: take,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get image by ID
 */
export const getImageById = async (req, res, next) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    await prisma.image.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: { ...image, views: image.views + 1 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload image
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { title, description, tags, position3D } = req.body;

    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    const ext = path.parse(req.file.originalname).ext;

    const fullFilename = `full-${timestamp}-${originalName}${ext}`;
    const thumbFilename = `thumb-${timestamp}-${originalName}.jpg`;

    const uploadDir = path.join(__dirname, "../uploads");

    const fullPath = path.join(uploadDir, fullFilename);
    const thumbPath = path.join(uploadDir, thumbFilename);

    await fs.mkdir(uploadDir, { recursive: true });

    await sharp(req.file.buffer)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(fullPath);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "cover", position: "center" })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    const metadata = await sharp(req.file.buffer).metadata();

    let parsedPosition = { x: 0, y: 0, z: 0 };
    if (position3D) {
      try {
        parsedPosition = JSON.parse(position3D);
      } catch {
        console.warn("Invalid position3D format");
      }
    }

    const image = await prisma.image.create({
      data: {
        title,
        description,
        imageUrl: `/uploads/${fullFilename}`,
        thumbnailUrl: `/uploads/${thumbFilename}`,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: req.file.size,
          uploadedBy: req.body.uploadedBy || "Anonymous",
        },
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        position3D: parsedPosition,
      },
    });

    res.status(201).json({
      success: true,
      data: image,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update image
 */
export const updateImage = async (req, res, next) => {
  try {
    const { title, description, tags, position3D } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined)
      updateData.tags = tags.split(",").map(t => t.trim());
    if (position3D !== undefined) updateData.position3D = position3D;

    const image = await prisma.image.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      success: true,
      data: image,
      message: "Image updated successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    next(error);
  }
};

/**
 * Delete image
 */
export const deleteImage = async (req, res, next) => {
  try {
    const image = await prisma.image.findUnique({
      where: { id: req.params.id },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const fullPath = path.join(__dirname, "..", image.imageUrl);
    const thumbPath = path.join(__dirname, "..", image.thumbnailUrl);

    try {
      await fs.unlink(fullPath);
      await fs.unlink(thumbPath);
    } catch (err) {
      console.warn("File deletion warning:", err.message);
    }

    await prisma.image.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Like / Unlike
 */
export const toggleLike = async (req, res, next) => {
  try {
    const { increment = true } = req.body;

    const image = await prisma.image.update({
      where: { id: req.params.id },
      data: {
        likes: {
          [increment ? "increment" : "decrement"]: 1,
        },
      },
    });

    res.json({
      success: true,
      data: { likes: image.likes },
      message: increment ? "Image liked" : "Like removed",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    next(error);
  }
};

/**
 * Trending images
 */
export const getTrending = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const images = await prisma.image.findMany({
      orderBy: [{ views: "desc" }, { likes: "desc" }],
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update positions
 */
export const bulkUpdatePositions = async (req, res, next) => {
  try {
    const { positions } = req.body;

    if (!Array.isArray(positions)) {
      return res.status(400).json({
        success: false,
        message: "Positions must be an array",
      });
    }

    const updates = positions.map(({ id, position3D }) =>
      prisma.image.update({
        where: { id },
        data: { position3D },
      })
    );

    await prisma.$transaction(updates);

    res.json({
      success: true,
      data: { modified: positions.length },
      message: "Positions updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
