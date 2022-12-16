if (typeof api_url === 'undefined') {
    var api_url = "/api";
}
var user;

async function fetchUser(username, password) {
    try {
        let res = await fetch(api_url + "/user/login", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username, 
                password: password
            })
        });
        res = await res.json();
        if (res.success) {
            user = res.user;
            return true;
        } else {
            return res.message;
        }

    } catch (err) {throw err;}
}