/**
 * 📚 LEARNING EXERCISE 1.3: File Upload Middleware
 * 
 * OBJECTIVE: Learn file handling, security, and storage management
 * TIME: 2-3 hours
 * 
 * WHAT YOU'LL LEARN:
 * - Multer for file uploads
 * - File validation and security
 * - Image processing with Sharp
 * - Cloud storage integration basics
 * - Error handling for uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * 🎯 TASK 1: Create upload directory if it doesn't exist
 */
const createUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../uploads/products');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('📁 Created upload directory:', uploadDir);
  }
};

// Initialize upload directory
createUploadDir();

/**
 * 🎯 TASK 2: Configure multer storage
 * LEARN: File naming strategies and organization
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
      .substring(0, 20); // Limit length
    
    const filename = `${timestamp}-${random}-${basename}${extension}`;
    cb(null, filename);
  }
});

/**
 * 🎯 TASK 3: File validation
 * LEARN: Security considerations for file uploads
 */
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Check file extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedMimes.includes(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
  }
};

/**
 * 🎯 TASK 4: Configure multer with limits
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file upload
  }
});

/**
 * 🎯 TASK 5: Enhanced upload middleware with processing
 */
const uploadProductImage = (req, res, next) => {
  const singleUpload = upload.single('image'); // 'image' is the field name
  
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
          code: 'FILE_TOO_LARGE'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Only one file allowed.',
          code: 'TOO_MANY_FILES'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        code: 'UPLOAD_ERROR'
      });
    } else if (err) {
      // Other errors (like file type validation)
      return res.status(400).json({
        success: false,
        message: err.message,
        code: 'INVALID_FILE_TYPE'
      });
    }
    
    // File uploaded successfully or no file provided
    if (req.file) {
      console.log(`📸 Image uploaded: ${req.file.filename} (${req.file.size} bytes)`);
      
      // Add file metadata to request
      req.fileMetadata = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: `/uploads/products/${req.file.filename}`
      };
    }
    
    next();
  });
};

/**
 * 🎯 TASK 6: Image optimization middleware (optional)
 * Requires: npm install sharp
 */
const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file to optimize
  }

  try {
    const sharp = require('sharp');
    const inputPath = req.file.path;
    const outputPath = inputPath.replace(/\.[^.]+$/, '_optimized.webp');
    
    // Create optimized version
    await sharp(inputPath)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    // Update file metadata
    const stats = await fs.stat(outputPath);
    req.fileMetadata.optimizedPath = outputPath;
    req.fileMetadata.optimizedUrl = `/uploads/products/${path.basename(outputPath)}`;
    req.fileMetadata.optimizedSize = stats.size;
    
    console.log(`🎨 Image optimized: ${req.file.size} bytes → ${stats.size} bytes`);
    
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Continue without optimization
  }
  
  next();
};

/**
 * 🎯 TASK 7: File cleanup utility
 */
const deleteFile = async (filename) => {
  try {
    const filePath = path.join(__dirname, '../uploads/products', filename);
    await fs.unlink(filePath);
    console.log(`🗑️ Deleted file: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${filename}:`, error);
    return false;
  }
};

/**
 * 🎯 TASK 8: Bulk file cleanup
 */
const cleanupFiles = async (filenames) => {
  const results = await Promise.allSettled(
    filenames.map(filename => deleteFile(filename))
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.length - successful;
  
  return { successful, failed, total: results.length };
};

/**
 * 🎯 TASK 9: File size validation middleware
 */
const validateFileSize = (maxSizeInMB) => {
  return (req, res, next) => {
    if (req.file && req.file.size > maxSizeInMB * 1024 * 1024) {
      // Remove the uploaded file
      deleteFile(req.file.filename);
      
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${maxSizeInMB}MB limit`,
        code: 'FILE_SIZE_EXCEEDED',
        maxSize: `${maxSizeInMB}MB`,
        actualSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
      });
    }
    next();
  };
};

/**
 * 🎯 TASK 10: Generate file metadata for database
 */
const generateFileMetadata = (req, res, next) => {
  if (req.file) {
    req.body.image = {
      url: req.fileMetadata.url,
      filename: req.fileMetadata.filename,
      originalName: req.fileMetadata.originalName,
      size: req.fileMetadata.size,
      mimetype: req.fileMetadata.mimetype,
      uploadDate: new Date(),
      optimized: !!req.fileMetadata.optimizedUrl,
      ...(req.fileMetadata.optimizedUrl && {
        optimizedUrl: req.fileMetadata.optimizedUrl,
        optimizedSize: req.fileMetadata.optimizedSize
      })
    };
  }
  next();
};

/**
 * 📝 LEARNING CHECKPOINT:
 * 
 * To use this middleware:
 * 1. Install dependencies: npm install multer sharp
 * 2. In your routes: router.post('/', uploadProductImage, generateFileMetadata, createProduct)
 * 3. Test with form-data: curl -F "image=@photo.jpg" -F "name=Test Product" http://localhost:5000/api/products
 * 
 * 💡 ADVANCED FEATURES TO ADD:
 * 1. Cloud storage (AWS S3, Cloudinary)
 * 2. Image resizing to multiple sizes
 * 3. Virus scanning for uploaded files
 * 4. Automatic backup of uploaded files
 */

module.exports = {
  uploadProductImage,
  optimizeImage,
  generateFileMetadata,
  validateFileSize,
  deleteFile,
  cleanupFiles,
  
  // Direct multer instance for custom usage
  upload
};
