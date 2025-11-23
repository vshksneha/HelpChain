
const cloudinary = require('cloudinary').v2;
const fs = require('fs'); // Node.js built-in file system module

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file (image/proof document) to Cloudinary.
 * @param {string} filePath Local path of the file (provided by multer).
 * @param {string} folder Destination folder (e.g., 'campaigns' or 'proofs').
 * @returns {string} The public URL of the uploaded file.
 */
const uploadFile = async (filePath, folder) => {
    try {
        if (!filePath) {
            throw new Error("File path is missing for upload.");
        }
        
        // Upload the file to the specified folder
        const result = await cloudinary.uploader.upload(filePath, { 
            folder: `helpchain/${folder}`,
            resource_type: "auto" // Auto-detects image/raw file
        });
        
        // Clean up the temporary file created by multer
        fs.unlinkSync(filePath); 

        return result.secure_url; 
        
    } catch (error) {
        // Ensure the local file is deleted even if Cloudinary upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Cloudinary upload failed:', error);
        throw new Error('Could not upload file to cloud storage.');
    }
};

module.exports = { uploadFile };
