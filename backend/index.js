const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const cors = require('cors');
const app = express();
const PORT = 5000;

// json web token
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'jkblhvjkgchfx4356789hjvkgchjfxgd@#$%^'

app.use(cors());
app.use(express.json());

const MONGO_URL = "mongodb://localhost:27017/faculty-feedback"

mongoose.connect(MONGO_URL).then(() => {
    console.log("MongoDb connection Est.");

}).catch(() => {
    console.log("Failed to Connect");

})


// faculty schema
const facultySchema = new mongoose.Schema({
    name: String,
    subject: String,
    experience: String,
    qualification: String,
    image: String,
});

const FacultyModel = mongoose.model('facultys', facultySchema);


// user login and register schema
const userSchema = new mongoose.Schema({
    enrol: Number,
    firstName: String,
    lastName: String,
    email: String,
    password: String
});
const userModel = new mongoose.model('users', userSchema);


// feedback store in database model
const feedbackSchema = new mongoose.Schema(
    {
        facultyID: Number,
        facultyName: String,
        FeedBackEnrol: Number,
        feedback: String,
    })
const feedbackModel = new mongoose.model('feedbacks', feedbackSchema);





app.get('/api/faculty', async (req, res) => {
    try {
        const faculties = await FacultyModel.find();
        res.json(faculties);
    } catch (err) {
        res.status(500).send('Error fetching data');
    }
});


// handle register request
app.post("/user/register", async (req, res) => {
    try {
        // get the data from the request
        const { firstName, lastName, enrol, email, password } = req.body;
        console.log(firstName, lastName, enrol, email, password);

        //bcrypt the password 
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        console.log("hash Password: ", hashPassword);

        // store the data in database
        const newUser = await new userModel({ firstName, lastName, enrol, email, password: hashPassword })
        await newUser.save();
        res.status(201).json({ message: "Successfully Reg" })
    } catch {
        res.status(500).json({ message: "Error Encoded" })
    }
})


// handle login request
app.post("/user/login", async (req, res) => {
    const { enrollment, password } = req.body;
    const data = await userModel.findOne({ $or: [{ email: enrollment }, { enrol: enrollment }] })
    if (data) {
        const isMatch = await bcrypt.compare(password, data.password);
        if (isMatch) {
            // generate the token
            const token = jwt.sign(
                { id: data._id, enrol: data.enrol },
                JWT_SECRET,
                { expiresIn: '1h' }
            )
            res.status(201).json({ message: 'Login SuccessFully', token })
        }
        else {
            res.status(500).json({ message: 'Incorrect Password' })
        }
    }
    else {
        res.status(500).json({ message: 'User Not Found' })
    }

})



// handle feedback
app.post('/user/feedback', async (req, res) => {
    try {
        const { facultyId, facultyName, feedbackText, enrollment } = req.body
        const newfeedback = await new feedbackModel({ facultyId, facultyName, FeedBackEnrol: enrollment, feedback: feedbackText })
        await newfeedback.save();
        res.status(201).json({ message: "FeedBack Submitted SuccessFully" })
    } catch {
        res.status(500).json({ message: "Error to Submit FeedBack" })
    }
})



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});










// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// mongoose.connect('mongodb://localhost:27017/faculty-feedback', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.log('MongoDB connection error:', err));

// const facultySchema = new mongoose.Schema({
//     name: String,
//     subject: String,
//     experience: String,
//     qualification: String,
//     image: String,
// });

// const Faculty = mongoose.model('Faculty', facultySchema);

// app.get('/api/faculty', async (req, res) => {
//     try {
//         const faculties = await Faculty.find();
//         res.json(faculties);
//     } catch (err) {
//         res.status(500).send('Error fetching data');
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
