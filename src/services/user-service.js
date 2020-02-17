import { generateHash, generateSalt } from "../passwordHelper";
import Users from "../sequelize/UsersModel";
import ConfirmationTokens from "../sequelize/ConfirmationTokensModel";
import { generateConfirmationToken } from "./auth-service";

export const addNewUser = (user) => {
    const salt = generateSalt();
    const password = generateHash(user.password, salt);
    const {username, email, role, city, birthdate} = user;
    return Users.create({ username, email, password, salt, role, city, birthdate })
}

export const createConfirmationToken = async (user, tokentimelife) => {
    const token = await generateConfirmationToken(user, tokentimelife);
    return ConfirmationTokens.create({confirm_token: token, userId: user.id});
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
