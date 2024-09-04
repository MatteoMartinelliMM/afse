const {ObjectId} = require("mongodb");

class Figurine {
    constructor(id, name) {
        this.figurineId = id;
        this.name = name;
        this.quantity = 1;
        this.level = 1
    }
}

module.exports = Figurine;