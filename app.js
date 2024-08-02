const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

//set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'public/images'); //directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });



// Create MySQL connection
const connection = mysql.createConnection({
host: 'mysql-fangrong.alwaysdata.net',
user: 'fangrong',
password: 'vA9RpUPMdrJmLZR',
database: 'fangrong_project'
});
connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({
    extended:false 
}));

// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
// Define routes
// Example:

// app.get('/', (req, res) => {
// connection.query('SELECT * FROM TABLE', (error, results) => {
// if (error) throw error;
// res.render('index', { results }); // Render HTML page with data
// });
// });


// Main Home Page

app.get('/featured', (req, res) => {
    const sql = "SELECT * FROM products WHERE category = 'featured'";
    connection.query(sql,(error,results)=>{
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products');
        }
        res.render('featured', {products:results});
    });
});


app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products';
    //fetch data from MySQL
    connection.query(sql,(error,results)=>{
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products');
        }
        res.render('index', {products:results});
    });
});


app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    connection.query(sql,[productId], (error,results)=>{
        if (error) {
        console.error('Database query error:', error.message);
        return res.status(500).send('Error Retrieving products by ID');
        }
        if (results.length > 0) {
            res.render('product', {product: results[0]});
        } else {
        res.status(404).send('Product not found');
    }
    });
});


// edit product

app.get('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    connection.query(sql,[productId], (error,results)=>{
        if (error) {
        console.error('Database query error:', error.message);
        return res.status(500).send('Error Retrieving products by ID');
        }
        if (results.length > 0) {
            res.render('editProduct', {product: results[0]});
        } else {
        res.status(404).send('Product not found');
    }
    });
});

app.get('/product', (req,res) => {
    res.render('addProduct');
});

app.post('/addProduct', upload.single('image'), (req,res) => {
    //extract product data from the request body
    const { name, description, price, stock, category } = req.body;
    let image;
    if (req.file) {
        image = req.file.filename; //save only the filename
    } else {
        image = null;
    }

    const sql = 'INSERT INTO products (name, description, price, stock, category, image) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql,[name, description, price, stock, category, image,],(error,results)=>{
        if (error) {
            console.error('Error adding product:', error);
            res.status(500).send('Error adding products');
        } else {
            res.redirect('/');
        }
    })
}); 

app.post('/editProduct/:id', upload.single('image'), (req,res) => {
    const productId = req.params.id;
    //extract product data from the request body
    const{ name, description, price, stock, category } = req.body;
    let image = req.body.currentImage;
    if (req.file) { //if new image is uploaded
        image = req.file.filename; // set image to be new image filename
    }

    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image = ? WHERE productId = ?';
    
    connection.query(sql,[name, description, price, stock, category, image,  productId], (error, results)=>{
        if (error) {
            console.error('Error updating product:', error);
            res.status(500).send('Error updating products');
        } else {
            // send a success response
            res.redirect('/');
        }
    });
}); 


app.get('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query(sql , [productId], (error, results)=>{
        if (error) {
            //handles any error that occurs during the database operation
            console.error('Error deleting product:', error);
            res.status(500).send('Error deleting product');
        } else {
        res.redirect('/');
    }
    });
});






//customers

//log in

app.get('/login', (req, res) => {
    const sql = 'SELECT * FROM customer';
    //fetch data from MySQL
    connection.query(sql,(error,results)=>{
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving products');
        }
        res.render('login', {customer:results});
    });
});


app.post('/login',(req,res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM customer WHERE email = ? AND password = ?';
    connection.query(sql,[ email, password],(error,results)=>{
        if (error) {
            console.error('Error getting customer:', error);
            res.status(500).send('Error getting customer');
        } 
        
        if (results.length > 0) {
            res.redirect('/');
        }
        else {
            red.send('<script>alert("Login unsuccessful. Please try again."); href = "/login";</script>')
        }
    })
}); 


app.get('/register', (req,res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { name, email, gameId, password } = req.body;
    console.log(req.body); // Log the received form data
    const sql = 'INSERT INTO customer (name, email, gameId, password) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, email, gameId, password], (error, results) => {
        if (error) {
            console.error('Error adding customer:', error);
            res.status(500).send('Error adding customer');
        } else {
            res.redirect('/');
        }
    });
});



//Define a route to handle submission
app.post('/submit', (req, res) => {
    const{ name, email} = req.body
    res.render('submitted' , {name, email});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
