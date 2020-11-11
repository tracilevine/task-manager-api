const User = require("./db/models/user"),
  cloudinary = require("cloudinary").v2,
  jwt = require("jsonwebtoken");

// ***********************************************//
// Create a user
// ***********************************************//

exports.createUser = async (req, res) => {
  //create request body
  const { name, email, password } = req.body;

  //try catch will take req body and attach it user and add cookies and place into our database
  try {
    const user = new User({
      name,
      email,
      password,
    });
    //once user is created we will save the user in MongoDB
    await user.save();

    //now we will create the users token
    const token = await user.generateAuthToken();
    res.cookies("jwt", token, {
      httpOnly: true,
      sameSite: "Strict",
      //when you're in production your .env values must be secure
      //secure - Boolean: Marks the cookie to be used with HTTPS only.
      secure: process.env.NODE_ENV !== "production" ? false : true,
    });
    //sends back to the front-end
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: error.message });
  }
};


// ***********************************************//
// Login a user
// ***********************************************//

exports.loginUser = async (req,res)=>{
    //here we set the the email and password are required to login
    const {email, password} =req.body
    
    try{
        //here we are finiding the users by their input and creating the user
        const user = await User.findByCredentials(email,password);
        //now we are going to attach their cookie back to them 
        const token = await user.generateAuthToken();
        res.cookies("jwt", token, {
            httpOnly: true,
            sameSite: "Strict",
            //when you're in production your .env values must be secure
            //secure - Boolean: Marks the cookie to be used with HTTPS only.
            secure: process.env.NODE_ENV !== "production" ? false : true,
          });

    }catch(e){
        res.status(400).json({ error: error.message });
    }


}