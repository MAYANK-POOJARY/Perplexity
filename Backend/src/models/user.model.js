import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    verified: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

// before saving the user data it checks if the password is hashed or not
userSchema.pre("save", async function (){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})

// creating a method for comparing the password
userSchema.methods.comparePassword = function (candidatePassword){
    return bcrypt.compare( candidatePassword, this.password)
} 

const userModel = mongoose.model("user", userSchema);

export default userModel;