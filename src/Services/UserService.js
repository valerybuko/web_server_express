import PasswordHelperService from "./PasswordHelperService";
import Users from "../DAL/Sequelize/UsersModel";
import UserRoles from "../DAL/Sequelize/UserRolesModel";
import UsersSessions from "../DAL/Sequelize/UsersSessionsModel";

export default class UserService {
    constructor() {
    }

    addNewUser = (user) => {
        const passwordHelper = new PasswordHelperService();
        const salt = passwordHelper.generateSalt();
        const password = passwordHelper.generateHash(user.password, salt)
        const {username, email, city, birthdate} = user;
        return Users.create({ username, email, password, salt, city, birthdate })
    }

    createUserRole = async (userrole, id) => {
        return UserRoles.create({role: userrole, userId: id});
    }

    changedUserRole = async (userrole, id) => {
        return UserRoles.update({ role: userrole }, {
            where: {
                userId: id
            }
        });
    }

    getAllUsers = () => {
        return Users.findAll({raw:true})
    }

    getUserWithID = (id) => {
        return Users.findByPk(id)
    }

    getRoleWithID = (id) => {
        return UserRoles.findByPk(id)
    }

    confirmUser = (id) => {
        return Users.update({ isConfirm: true }, {
            where: {
                id
            }
        })
    }

    updateUser = (id, user, salt, password) => {
        const { username, email, role, isConfirm, city, birthdate } = user;
        return Users.update({ username, email, password, salt, role, isConfirm, city, birthdate }, {
            where: {
                id
            }
        })
    }

    updateUserPassword = (id, password, salt) => {
        return Users.update({ password, salt }, {
            where: {
                id
            }
        })
    };

    deleteUser = (id) => {
        return Users.destroy({
            where: {
                id
            }
        })
    }

    deleteUserSession = (id) => {
        return UsersSessions.destroy({
            where: {
                userId: id
            }
        })
    }

    getUserByEmail = (email) => {
        return Users.findOne({
            where: {
                email
            }
        });
    }

    getUserRoleByUserId = (id) => {
        return UserRoles.findOne({
            where: {
                userId: id
            }
        });
    }

    checkAdminUserRole = async (id) => {
        const userRolesObject = await this.getUserRoleByUserId(id);
        const userRole = userRolesObject.dataValues.role;
        return userRole;
    }
}

/*export const addNewUser = (user) => {
    const passwordHelper = new PasswordHelperService();
    const salt = passwordHelper.generateSalt();
    const password = passwordHelper.generateHash(user.password, salt)
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

export const getRoleWithID = (id) => {
    return UserRoles.findByPk(id)
}

export const confirmUser = (id) => {
    return Users.update({ isConfirm: true }, {
        where: {
            id
        }
    })
}

export const updateUser = (id, user) => {
    const salt = generateSalt();
    const password = generateHash(user.password, salt);
    const { username, email, role, isConfirm, city, birthdate } = user;
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

export const deleteUserSession = (id) => {
    return UsersSessions.destroy({
        where: {
            userId: id
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

export const getUserRoleByUserId = (id) => {
    return UserRoles.findOne({
        where: {
            userId: id
        }
    });
}

export const checkAdminUserRole = async (id) => {
    const userRolesObject = await getUserRoleByUserId(id);
    const userRole = userRolesObject.dataValues.role;
    return userRole;
}*/
