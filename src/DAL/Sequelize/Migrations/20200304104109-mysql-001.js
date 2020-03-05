module.exports = {
  up: (queryInterface, Sequelize) =>
      queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        salt: {
          type: Sequelize.STRING,
          allowNull: false
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false
        },
        birthdate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        isConfirm: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }),
  down: (queryInterface) => queryInterface.dropTable('users'),
}
