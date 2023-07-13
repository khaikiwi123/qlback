const User = require ('../models/User')
const {hashPassword, comparePassword, verifyRefresh} = require ('../Utils/auth')
const validator = require ('validator')
const jwt = require('jsonwebtoken')

module.exports = {
    register: async(event) =>{
        const {name, email, password, role, phone} = JSON.parse(event.body)
        const n = name.trim()
        const e = email.trim().toLowerCase()
        const p = password.trim()
        const findOneEmail = await User.findOne({email: e})
        if (e == "" || p == ""|| n == ""|| phone == ""){
            return ("Please fill out all the form")
        }
        if (findOneEmail) {
            return ("User already existed, please login.")
        }
        if(!validator.isEmail(e)){
            return ("Email isn't valid")
        }
        if(!validator.isStrongPassword(p)){
            return ("Password isn't strong enough")
        }
        if(role !== 'user' && role !== 'admin'){
            return ("Invalid role")
        }
        const hashedPassword = await hashPassword(p)
        const user = new User({name: n, email: e, password: hashedPassword, role, phone})
        await user.save()
        return ("User created")
},

    login: async (event) => {
        const {email, password } = JSON.parse(event.body)
        const lowName = email.trim().toLowerCase()
        const pw = password.trim()
        const user = await User.findOne({email: lowName})
        if (!user){
            return ("User's not found")
        }
        const isMatch = await comparePassword(pw, user.password);
        if (!isMatch){
            return ("Invalid Password")
        }
        const aToken = jwt.sign({userId: user._id,role: user.role}, process.env.SECRET ,{expiresIn: '3m'})
        const rToken = jwt.sign({userId: user._id}, process.env.SECRET ,{expiresIn: '7d'})

        user.token = rToken
        await user.save()
        
        return {
            access: aToken,
            refresh: rToken
        }
    },
    logout: async(event) => {
        const header = event.headers.Authorization
        if (!header || header === "Bearer null"){
            return ("Not logged in")
        }
        const token = await header.replace(/^Bearer\s+/, "");
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await User.findOne({_id: decodedToken.userId})
        if (user.token === ""){
            return ("Already logged out")
        }
        if (token !== user.token){
            return("Token used or invalidated")
        }
        user.token = ""
        await user.save()
        return ("Logged out")    
    },
    refresh: async(event) => {
        const user = await verifyRefresh(event)
        if (user === 'Token used or invalidated' || user === 'Refresh token is not valid'){
            return (user ? 'Token used or invalidated':'Refresh token is not valid')
        }
        const aToken = jwt.sign({userId: user._id,role: user.role}, process.env.SECRET ,{expiresIn: '3m'})
        const rToken = jwt.sign({userId: user._id}, process.env.SECRET ,{expiresIn: '7d'})
        user.token = rToken
        await user.save()
        
        return {
            access: aToken,
            refresh: rToken
        }
    }
}
