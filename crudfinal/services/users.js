const User = require ('../models/User')
const {hashPassword} = require ('../Utils/auth')
const validator = require ('validator')

module.exports = {
  getUser: async () => {
    return await User.find().select('-_id -token');
  },
  getOne: async(event) => {
    const id = event.pathParameters.id;
    const user = await User.findById(id).select('-_id -token');
    return user;
  },
  createUser:  async (event) => {
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
  updateUser:  async (event) => {
    const id = event.pathParameters.id
    const {email, password} = JSON.parse(event.body);
    await User.findByIdAndUpdate(id, {email: email, password: password}, {new: true});
    return ("User updated")
  },
  deleteUser:  async (event) => {
    const id = event.pathParameters.id
    await User.findByIdAndDelete(id);
    return {
      statusCode: 200,
      body: "User da xoa hoac khong co trong he thong"
    }
  }
}