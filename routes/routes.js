const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const fs = require('fs');




//image upload
var  storage = multer.diskStorage({
    destination: function(req, res, cb){ 
    cb(null, './uploads');
},
filename: function(req, file, cb ){
    cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname )
},
})

var upload = multer({
    storage: storage,

}).single("image");

// Insert a user into database route
router.post('/add', upload, async (req, res) => {
    try {
        // Create a new user object
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        // Save the user to the database
        await user.save()

        // Set a success message in the session
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };

        // Redirect to the home page
        res.redirect('/');
     
    } catch (err) {
        // Handle errors
        req.session.message = {
            type: 'danger',
            message: err.message,
        };

        // Redirect back to the form or send a JSON error response
        res.redirect('/add');
    }
});

// Get all users 

router.get('/', async(req, res)=>{
    try {
        const users = await User.find();
        const message = req.session.message;
         res.render.message = null // Clear the message
        res.render('index', {
            title: 'Home Page',
            users: users,
            message: message,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
})

router.get('/add' ,(req, res)=>{
    res.render('add_users', {title: "Add Users"})
})


// Edit a user route
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'User not found!',
            };
            return res.redirect('/');
        }
        res.render('edit_users', {
            title: 'Edit User',
            user,
            message: req.session.message, // Optional if you want messages here too
        });
    } catch (err) {
        console.error('Error fetching user:', err.message);
        req.session.message = {
            type: 'danger',
            message: 'An error occurred while fetching the user.',
        };
        res.redirect('/');
    }
});

// Update a user route

router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = req.file ? req.file.filename : req.body.old_image;

        // Delete old image if a new one is uploaded
        if (req.file) {
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.error('Error deleting old image:', err.message);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: new_image,
            },
            { new: true }
        );

        if (!updatedUser) {
            req.session.message = {
                type: 'danger',
                message: 'User not found!',
            };
            return res.redirect('/');
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/')
    } catch (err) {
        console.error('Error updating user:', err.message);
        req.session.message = {
            type: 'danger',
            message: 'An error occurred while updating the user.',
        };
        res.redirect('/');
    }
});

    // Delete user route
   
   

    router.get('/delete/:id', async (req, res) => {
        try {
            const id = req.params.id;
    
            // Find and delete the user
            const user = await User.findByIdAndDelete(id);
    
            if (!user) {
                req.session.message = {
                    type: 'danger',
                    message: 'User not found!',
                };
                return res.redirect('/');
            }
    
            // If the user has an image, delete it
            if (user.image) {
                try {
                    fs.unlinkSync('./uploads/' + user.image);
                } catch (err) {
                    console.error('Error deleting image file:', err.message);
                }
            }
    
            // Set success message and redirect
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully!',
            };
            res.redirect('/');
        } catch (err) {
            console.error('Error deleting user:', err.message);
            req.session.message = {
                type: 'danger',
                message: 'An error occurred while deleting the user.',
            };
            res.redirect('/');
        }
    });
    

   
    

     




        
       






module.exports = router;