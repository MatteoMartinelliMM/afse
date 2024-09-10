class User {
    constructor(name, surname,username, email, pwd, isHero, profilePicture, favouriteHero) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.username = username;
        this.pwd = pwd;
        this.isHero = isHero;
        this.favouriteHero = favouriteHero;
        this.profilePicture = profilePicture;
        this.coinAmount = 0;
    }

    isValidUser() {
        return this.name && this.surname && this.email && this.pwd && this.favouriteHero;
    }
}

export default User