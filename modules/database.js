import { Sequelize, Model, DataTypes } from 'sequelize';

export var sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database/centre_tremplin.sqlite",
    logging: false
});

export class User extends Model { }
export class Role extends Model { }
export class UserRoles extends Model { }
export class Therapist extends Model { }
export class SocialMediaLink extends Model { }
export class SocialMedia extends Model { }
export class Appointment extends Model { }
export class AppointmentDemand extends Model { }

export class Room extends Model { }
export class RoomPicture extends Model { }
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

UserRoles.init({}, { sequelize });

Therapist.init({
    approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
            isNotApproved() {
                if (this.rejected) throw new Error("User cannot be approved and rejected at the same time.");
            }
        }
    },
    rejected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
            isNotApproved() {
                if (this.approved) throw new Error("User cannot be approved and rejected at the same time.");
            }
        }
    },
    shown: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
    },
    job: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
    },
    whoami: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
    },
    whatido: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
    },
    infos: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false
    }
}, { sequelize });

SocialMedia.init({
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    color: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    svgPath: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, { sequelize });

SocialMediaLink.init({
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    url: {
        type: DataTypes.TEXT,
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

AppointmentDemand.init({
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reccurence: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reccurenceEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isThereReccurence(recEnd) {
                return this.reccurence !== null;
            }
        }
    },
    duration: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    refused: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { sequelize });

Room.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { sequelize });

RoomPicture.init({
    path: {
        type: DataTypes.STRING,
        allowNull: false
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
                if (this.start > date) throw new Error("Start cannot be after end.");
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
    },
    duration: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, { sequelize });

User.hasMany(UserRoles);
Role.hasMany(UserRoles);
User.hasOne(Therapist);
Therapist.hasOne(User);

SocialMediaLink.belongsTo(SocialMedia);
SocialMediaLink.belongsTo(Therapist);

User.hasMany(Appointment);
Room.hasMany(RoomPicture)
RoomReservations.hasMany(Appointment);
RoomReservations.belongsTo(Therapist);
RoomReservations.belongsTo(Room);
RoomPrice.belongsTo(Room);

AppointmentDemand.belongsTo(User);
AppointmentDemand.belongsTo(Therapist);


sequelize.sync({ force: false });
async function createRoles() {
    await new Promise(r => setTimeout(r, 4000));
    await Role.findOrCreate({ where: { roleName: "Admin" } });
    await SocialMedia.findOrCreate({
        where: { name: "Web" },
        defaults: {
            color: "black",
            svgPath: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        }
    });
    await SocialMedia.findOrCreate({
        where: { name: "Facebook" },
        defaults: {
            color: "rgb(13,110,253)",
            svgPath: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        }
    });
    await SocialMedia.findOrCreate({
        where: { name: "Instagram" },
        defaults: {
            color: "#dc3545",
            svgPath: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
        }
    });
}
createRoles();
