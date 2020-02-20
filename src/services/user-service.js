import { generateHash, generateSalt } from "../passwordHelper";
import Users from "../sequelize/UsersModel";
import UserRoles from "../sequelize/UserRolesModel";

export const addNewUser = (user) => {
    const salt = generateSalt();
    const password = generateHash(user.password, salt);
    const {username, email, city, birthdate} = user;
    return Users.create({ username, email, password, salt, city, birthdate })
}

export const createUserRole = async (userrole, id) => {
    return UserRoles.create({role: userrole, userId: id});
}

export const changedUserRole = async (userrole, id) => {
    return UserRoles.update({ role: userrole }, {
        where: {
            userId: id
        }
    });
}

export const getAllUsers = () => {
    return Users.findAll({raw:true})
}

export const getUserWithID = (id) => {
    return Users.findByPk(id)
}

export const confirmUser = (id) => {
    return Users.update({ isConfirm: true }, {
        where: {
            id
        }
    })
}

export const updateUser = (user) => {
    const salt = generateSalt();
    const password = generateHash(user.password, salt);
    const { id, username, email, role, isConfirm, city, birthdate } = user;
    return Users.update({ username, email, password, salt, role, isConfirm, city, birthdate }, {
        where: {
            id
        }
    })
}

export const updateUserPassword = (id, newPassword) => {
    const salt = generateSalt();
    const password = generateHash(newPassword, salt);

    return Users.update({ password, salt }, {
        where: {
            id
        }
    })
};

export const deleteUser = (id) => {
    return Users.destroy({
        where: {
            id
        }
    })
}

export const getUserByEmail = (email) => {
    return Users.findOne({
        where: {
            email
        }
    });
}
