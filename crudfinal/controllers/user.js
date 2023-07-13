const service = require ('../services/users')

module.exports = {
  functions: async (event, context, callback) =>{
    switch (event.httpMethod) {
      case 'GET':
        if(event.resource === '/users/{id}'){
          return await getOne(event)
        }
        else{
          return await get()
        }
      case 'POST':
        return await create(event)
      case 'PUT':
        return await update(event)
      case 'DELETE':
        return await remove(event)
      default: 
        return {
          statusCode: 500,
          body: ("wrong method")
        }
    }
  }
}



const getOne = async(event) => {
  return await service.getOne(event)
}
const get = async () => {
  return await service.getUser()
}
const create = async (event) => {
  return await service.createUser(event)
}
const update = async (event) =>{
  return await service.updateUser(event)
}
const remove = async (event) => {
  return await service.deleteUser(event)
}