const {ObjectId} = require("mongodb");

class Figurine {
    constructor(id, name) {
        this.figurineId = id;
        this.name = name;
    }
}

module.exports = Figurine;