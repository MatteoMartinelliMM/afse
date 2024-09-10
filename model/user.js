class User {
    constructor({name, surname, username, email, pwd, isHero, favouriteHero, profilePicture}) {
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.pwd = pwd;
        this.isHero = isHero || true;
        this.favouriteHero = favouriteHero;
        this.profilePicture = profilePicture;
        this.coinAmount = 0;
        this.figurine = []
        this.exchangeable = []
        this.inTrade = []
    }

    isValidUser() {
        return this.name && this.surname && this.email && this.pwd && this.favouriteHero && this.username;
    }
}

module.exports = {User};