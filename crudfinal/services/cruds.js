const Khach = require("../models/Khach");

module.exports = {
  getKhach: async () => {
    try {
      return await Khach.find();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createKhach: async (event) => {
    const { name, phone, address, status } = JSON.parse(event.body);

    if (!name.trim() || !phone.trim() || !address.trim()) {
      throw new Error("Please fill out all the forms");
    }

    try {
      const newCustomer = new Khach({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status,
      });
      await newCustomer.save();

      return "Customer created";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateKhach: async (event) => {
    const id = event.pathParameters.id;
    const { name, phone, address, status } = JSON.parse(event.body);
    let update = {};

    if (name && name.trim()) update.name = name.trim();
    if (phone && phone.trim()) update.phone = phone.trim();
    if (address && address.trim()) update.address = address.trim();
    if (status !== undefined) update.status = status;

    try {
      await Khach.findByIdAndUpdate(id, update, { new: true });
      return "Customer updated";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteKhach: async (event) => {
    const id = event.pathParameters.id;

    try {
      await Khach.findByIdAndDelete(id);
      return "Customer deleted";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
