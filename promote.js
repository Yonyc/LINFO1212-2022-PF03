import {User, UserRoles} from './modules/database.js'

async function main() {
    if (process.argv.length == 2 || process.argv.length > 4) {
        console.log("Usage: node promote.js [role] [username]");
        return;
    }

    if (process.argv[2] == "admin") {
        let user = await User.findOne({
            where: {
                username: process.argv[3]
            }
        });

        if (!user) {
            console.log("Usage: node promote.js [role] [username]");
            return;
        }

        UserRoles.create({
            UserId: user.id,
            RoleId: 1
        });
        console.log('User successfully promoted');
        return;
    }

}

main();