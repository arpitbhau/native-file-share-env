// Jai Shree Ram

const express = require('express');
const app = express();
const port = 3000;
const ip = '0.0.0.0';
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');


// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
app.post('/upload', upload.array('file', 10), (req, res) => {
    try {
        // Handle text input
        const text = req.body.text || '';
        
        // Save text to file if provided
        if (text) {
            // Generate filename from first 11 chars or full text if shorter
            const filename = text.length <= 11 ? text : text.substring(0, 11);
            // Clean filename to be safe for filesystem
            const safeFilename = filename.replace(/[^a-z0-9]/gi, '_');
            const textPath = path.join(uploadDir, `${safeFilename}.txt`);
            
            // Write text to file
            fs.writeFileSync(textPath, text);
        }

        // Check for files
        if (!req.files || req.files.length === 0) {
            // If there's text but no files, still process the text
            if (!text) {
                return res.status(400).json({
                    error: 'No files or text uploaded.'
                });
            }
        }

        // If we reach here, either files were uploaded or text was saved successfully
        res.redirect('/');

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'An error occurred during file upload',
            details: error.message
        });
    }
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

app.listen(port, ip, () => {
    console.log(`Server is running on http://${ip}:${port}`);
});