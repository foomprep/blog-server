const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from a 'public' directory
app.use(express.static('public'));

// GET endpoint to list all markdown files
app.get('/posts', async (req, res) => {
    try {
        const postsDirectory = path.join(__dirname, 'posts');
        const files = await fs.readdir(postsDirectory);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        res.json({
            posts: markdownFiles.map(filename => ({
                id: filename.replace('.md', ''),
                filename
            }))
        });
    } catch (error) {
        console.error('Error reading posts directory:', error);
        res.status(500).json({ error: 'Failed to read posts' });
    }
});

// GET endpoint to serve a specific markdown file
app.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const postsDirectory = path.join(__dirname, 'posts');
        const filePath = path.join(postsDirectory, `${id}.md`);
        
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const htmlContent = marked(fileContent);
        
        res.send(htmlContent);
    } catch (error) {
        console.error('Error reading markdown file:', error);
        res.status(404).json({ error: 'Post not found' });
    }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
