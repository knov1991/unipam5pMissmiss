const mongoose = require("../database/index");

const EnterpriseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cnpj: {
      type: String,
      required: true,
      unique: true
    },
  }, 
  {
  versionKey: false
});

const Enterprise = mongoose.model('Enterprise', EnterpriseSchema);

module.exports = Enterprise;