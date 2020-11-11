//these are all the packages being used within the schema 
const mongoose = require('mongoose'),
  validator = require('validator'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken');

//create user schema 
const userSchema = new mongoose.Schema(
 {
     name: {
         type: String,
         required: true, 
         trim: true
     },
     email: {
         type: String, 
         unique: true, 
         required: true, 
         trim: true, 
         lowercase: true, 
         validate (value) {
             if(!validator.isEmail(value)){
                 throw new Error ('Email is invalid.');
             }
         }
     },
     password: {
         type: String, 
         required: true, 
         trim: true, 
         validate(value) {
             if (value.toLowerCase().includes('password')){
                 throw new Error ("Password can't be password.");
             }
             if (value.length <6){
                 throw new Error ('Password must be at least 6 characters long.')
             }
         }
     },
     admin:{
         type: Boolean, 
         required: true, 
         default: false,
     },
     tokens: [
         {
             token: {
                 type: String, 
                 required:true,
             }
         }
     ],
     avatar:{
         type: String
     }
 },
 {
     timestamps: true
 }   
);
//This will remove the tokens and password when the response is sent to the client.
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};
//This will generate a unique token for the user. It will take the payload, secret, and options
//It needs to convert them to tokens and string together the object which will be added to the user.
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
      { _id: user._id.toString(), name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  };
//Statics are used for targeting and searching. They will not actually make any changes. Here we are validating the the email and password exists
  userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Unable to log in.');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Unable to login.');
    return user;
  };

  //before we save we will encrypt the password
  userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))
      user.password = await bcrypt.hash(user.password, 8);
  
    next();
  });

  //here we have created the user model to export 
  const User = mongoose.model ('User', userSchema);

  module.exports = User;