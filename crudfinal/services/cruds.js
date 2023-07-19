const Khach = require("../models/Khach");

module.exports = {
  getKhach: async () => {
    return await Khach.find();
  },

  createKhach: async (event) => {
    const { name, phone, address, status } = JSON.parse(event.body);

    if (!name.trim() || !phone.trim() || !address.trim()) {
      return "Please fill out all the forms";
    }

    const newCustomer = new Khach({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      status,
    });
    await newCustomer.save();

    return "Customer created";
  },

  updateKhach: async (event) => {
    const id = event.pathParameters.id;
    const { name, phone, address, status } = JSON.parse(event.body);
    let update = {};

    if (name && name.trim()) update.name = name.trim();
    if (phone && phone.trim()) update.phone = phone.trim();
    if (address && address.trim()) update.address = address.trim();
    if (status !== undefined) update.status = status;

    await Khach.findByIdAndUpdate(id, update, { new: true });

    return "Customer updated";
  },

  deleteKhach: async (event) => {
    const id = event.pathParameters.id;

    await Khach.findByIdAndDelete(id);

    return "Customer deleted";
  },
};
