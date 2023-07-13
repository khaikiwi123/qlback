const service = require ('../services/cruds.js')

module.exports = {
  functions: async (event, context, callback) =>{
    switch (event.httpMethod) {
      case 'GET':
        return await get()
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




const get = async () => {
  return await service.getKhach()
}
const create = async (event) => {
  return await service.createKhach(event)
}
const update = async (event) =>{
  return await service.updateKhach(event)
}
const remove = async (event) => {
  return await service.deleteKhach(event)
}