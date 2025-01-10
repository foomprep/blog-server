import express from 'express';
import mongoose from 'mongoose';
import { marked } from 'marked';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware to parse JSON bodies
app.use(express.json());

// Ping endpoint
app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// MongoDB connection to 'blog' database
mongoose.connect('mongodb://localhost:27017/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Simple Article Schema
const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Use the 'articles' collection
const Article = mongoose.model('Article', articleSchema, 'articles');

app.post('/articles', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const article = new Article({
            title,
            content
        });

        await article.save();
        res.status(201).json(article);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// Get all articles
app.get('/articles', async (req, res) => {
    try {
        const articles = await Article.find({}, 'title createdAt');
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get a specific article
app.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Convert markdown to HTML if requested
        if (req.query.format === 'html') {
            article.content = marked(article.content);
        }

        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
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

