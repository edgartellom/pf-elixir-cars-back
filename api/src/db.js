require("dotenv").config();
const { Sequelize } = require("sequelize");
const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const models = require("./models");

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/elixircars`,
  { logging: false, native: false }
);

// Iterar sobre los modelos y pasarles la instancia de Sequelize
Object.values(models).forEach((model) => {
  model(sequelize);
});

const { brand, carModel, cars } = sequelize.models;

carModel.hasMany(cars);
cars.belongsTo(carModel);

brand.hasMany(cars);
cars.belongsTo(brand);

// Definimos un gancho (hook) que se ejecutará antes de crear un nuevo registro
cars.beforeCreate(async (modelo) => {
  const maxId = await cars.max("id", { where: { estado: modelo.estado } });
  // Si el estado es "Nuevo" y no hay registros con estado "Nuevo", iniciamos en 1
  // Si el estado es "Usado" y no hay registros con estado "Usado", iniciamos en 1001
  if (
    (modelo.estado === "Nuevo" && !maxId) ||
    (modelo.estado === "Usado" && !maxId)
  ) {
    modelo.id = modelo.estado === "Nuevo" ? 1 : 1001;
  } else {
    // Si hay registros con el mismo estado, incrementamos el id en 1
    modelo.id = maxId + 1;
  }
});

module.exports = {
  carModel,
  cars,
  brand,
  conn: sequelize,
};
