import { Sequelize, Model, DataTypes } from 'sequelize';

export var sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database/centre_tremplin.sqlite",
    logging: false
});

export class User extends Model { }
export class Role extends Model { }
export class Therapist extends Model { }
export class Appointment extends Model { }

export class Room extends Model { }
export class RoomReservations extends Model { }
export class RoomPrice extends Model { }

// TODO (pas sûr)
export class TherapyArea extends Model { }
export class TherapistArea extends Model { }
// END TODO

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: DataTypes.STRING,
    mobilephone: DataTypes.STRING,
    address: DataTypes.STRING,
    url_pp: DataTypes.STRING,
    biography: DataTypes.STRING,
    confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    token_confirmation: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { sequelize });

Role.init({
    roleName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    }
}, { sequelize });

Therapist.init({
    approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, { sequelize });

Appointment.init({
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: DataTypes.FLOAT
}, { sequelize });

Room.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
}, { sequelize });

RoomReservations.init({
    start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfterStart(date) {
                if (this.start > date) throw new Error("Start cannot be after end...");
            }
        }
    }
}, { sequelize });

RoomPrice.init({
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, { sequelize });

User.hasMany(Role);
User.hasOne(Therapist);

User.hasMany(Appointment);
RoomReservations.hasMany(Appointment);
RoomReservations.belongsTo(Therapist);
RoomReservations.belongsTo(Room);
RoomPrice.belongsTo(Room);

sequelize.sync();