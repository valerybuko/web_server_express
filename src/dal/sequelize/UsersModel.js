import Sequelize from "sequelize";
import sequelize from "../index";
import UserRoles from "./UserRolesModel";
import UsersSessions from "./UsersSessionsModel";
import ConfirmationTokens from "./ConfirmationTokensModel";
import ChangePasswordTokens from "./ChangePasswordTokensModel";

const Users = sequelize.define('users', {
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

Users.hasMany(UsersSessions, { onDelete: "cascade" } );
Users.hasOne(ConfirmationTokens, { onDelete: "cascade" });
Users.hasOne(ChangePasswordTokens, { onDelete: "cascade" });
Users.hasOne(UserRoles, { onDelete: "cascade" });

export default Users;
