const express = require('express');
const router = express.Router();
const Item = require('./models/items');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.use(express.urlencoded({ extended: true }));

// Route to handle item creation
router.post('/createItem', upload.array('images', 3), async (req, res) => {
    const { name, description } = req.body;
    const images = req.files.map(file => file.filename);

    try {
        const newItem = new Item({
            name: name,
            description: description,
            images: images
        });

        await newItem.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).send('Error creating item');
    }
});

// Route to handle item deletion
router.post('/deleteItem/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        await Item.findByIdAndDelete(itemId);

        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item');
    }
});

module.exports = router;


module.exports = router

// Route to handle item editing
router.get('/editItem/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).send('Item not found');
        }

        res.render('editItem', { item });
    } catch (error) {
        console.error('Error fetching item for editing:', error);
        res.status(500).send('Error fetching item for editing');
    }
});

// Route to handle item update
router.post('/editItem/:id', async (req, res) => {
    const itemId = req.params.id;
    const { name, description } = req.body;

    try {
        await Item.findByIdAndUpdate(itemId, { name, description });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Error updating item');
    }
});


module.exports = router;
