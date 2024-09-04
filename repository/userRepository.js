const db = require('../utils/mongodb');
const crypto = require('crypto');
const {ObjectId} = require("mongodb");

async function userCollection() {
    return (await db.getDbInstance()).collection('users');
}

async function insertUser(user) {
    user.pwd = hashPwd(user)
    let res = await (await userCollection()).insertOne(user);
    return res.acknowledged;
}

async function findAllUsers() {
    return (await userCollection()).find();
}

async function findUserById(id) {
    console.log(`search for ${id}`)
    return await (await userCollection())
        .findOne({_id: new ObjectId(id)});
}

async function findUserByCredentials(login) {
    login.pwd = hashPwd(login)
    return await (await userCollection())
        .findOne({$and: [{email: login.email}, {pwd: login.pwd}]});
}

async function deleteUserById(id) {
    let res = await (await userCollection()).deleteOne({$eq: {_id: id}})
    return res.deletedCount > 0;
}

async function updateUser(user, fieldsToUpdate) {
    const res = await (await userCollection()).updateOne({_id: new ObjectId(user._id)}, {$set: fieldsToUpdate})
    return res.acknowledged
}
async function updateUserById(userId, fieldsToUpdate) {
    const res = await (await userCollection()).updateOne({_id: new ObjectId(userId)}, {fieldsToUpdate})
    return res.acknowledged
}

function hashPwd(user) {
    return crypto.createHash('sha256').update(user.pwd).digest('hex');
}

module.exports = {
    insertUser: insertUser,
    deleteUserById: deleteUserById,
    findAllUsers: findAllUsers,
    findUserById: findUserById,
    findUserByCredentials: findUserByCredentials,
    updateUser: updateUser,
    updateUserById: updateUserById,
}