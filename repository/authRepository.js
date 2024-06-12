const db = require('../utils/mongodb');

async function userCollection() {
    return (await db.getDbInstance()).collection('users');
}

async function insertUser(user) {
    let res = await (await userCollection()).insertOne(user);
    return res.acknowledged;
}

async function findAllUsers() {
    return await (await userCollection()).find()
}

async function findUserById(id) {
    return await (await userCollection())
        .findOne({$eq: [{_id: id}]});
}

async function findUserByCredentials(login) {
    return await (await userCollection())
        .findOne({$and: [{email: login.email}, {pwd: login.pwd}]});
}

async function deleteUserById(id) {
    let res = await (await userCollection()).delete({$eq: {_id: id}})
    return res.deletedCount > 0;
}

module.exports = {
    insertUser: insertUser,
    deleteUserById: deleteUserById,
    findAllUsers: findAllUsers,
    findUserById: findUserById,
    findUserByCredentials: findUserByCredentials,
}