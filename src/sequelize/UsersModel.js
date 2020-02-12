import Sequelize from "sequelize";
import sequelize from "../dal";

const UsersModel = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    salt: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    isConfirm: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default UsersModel;
