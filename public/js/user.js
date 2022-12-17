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
        
        if (res.status == 401) {
            return false;
        }
        
        res = await res.json();
        user = res.user;
        return true;

    } catch (err) {throw err;}
}