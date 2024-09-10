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

async function findUserByIds(idList, forceOrder = false) {
    const objectIds = idList.map(id => new ObjectId(id))

    if (!forceOrder)
        return await (await userCollection())
            .find({_id: {$in: objectIds}}).toArray()

    const users = await (await userCollection())
        .find({_id: {$in: objectIds}}).toArray();
    const usersById = new Map(users.map(user => [user._id.toString(), user]));
    return idList.map(id => usersById.get(id.toString()));
}

async function findUserByCredentials(login) {
    login.pwd = hashPwd(login)
    return await (await userCollection())
        .findOne({$and: [{email: login.email}, {pwd: login.pwd}]});
}

async function deleteUserById(id) {
    let res = await (await userCollection()).deleteOne({_id: new ObjectId(id)})
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
    findUserByIds: findUserByIds,
    findUserByCredentials: findUserByCredentials,
    updateUser: updateUser,
    updateUserById: updateUserById,
}