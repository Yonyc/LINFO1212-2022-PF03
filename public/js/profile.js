const divSelectors = {
    logged: ".logged_view",
    login: ".login_register_view"
};



function display(selector) {
    let a = document.querySelector(selector);
    let b = a.parentNode;
    b.removeChild(a);
    b.prepend(a);
}

function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.innerText = value;
    });
}

function editProfile() {
    if (typeof user === 'undefined' || !user) window.location = "/";
    let body = {};
    let ids = ["website", "instagram", "facebook", "firstname", "lastname", "phone", "mobile", "address", "email"];
    ids.forEach(key => {
        let v = document.querySelector("input#" + key);
        if (v && v.value)
            body[key] = v.value;
    });
    console.log(body);
}

function changeLoggedInputContent(selector, content) {
    let input = document.querySelector(`${divSelectors.logged} input${selector}`);
    if (input && content) input.value = content;
}

function updateUserEditPage() {
    changeLoggedInputContent(".username", user?.username);
    changeLoggedInputContent(".firstname", user?.firstname);
    changeLoggedInputContent(".lastname", user?.lastname);
    changeLoggedInputContent(".email", user?.email);
    changeLoggedInputContent(".phone", user?.phone);
    changeLoggedInputContent(".mobile", user?.mobile);
    changeLoggedInputContent(".address", user?.address);
    changeLoggedInputContent(".instagram", user?.instagram);
    changeLoggedInputContent(".facebook", user?.facebook);
    changeLoggedInputContent(".website", user?.website);

    document.querySelectorAll(`.profile_picture`).forEach(e => {
        if (user?.url_pp)
            e.src = user.url_pp;
    });

    updateText(`${divSelectors.logged} span.firstname`, document.querySelector(`${divSelectors.logged} input.firstname`)?.value);
    updateText(`${divSelectors.logged} span.lastname`, document.querySelector(`${divSelectors.logged} input.lastname`)?.value);
}

async function login(username, password) {
    let res = await fetchUser(username, password);
    if (res === true) {
        updateUserEditPage();
        display(divSelectors.logged);
        
        return;
    };
    console.error(res);
}

export function main() {
    document.querySelector(`${divSelectors.logged} input.firstname`)?.addEventListener("keyup", e => {
        updateText(`${divSelectors.logged} span.firstname`, e.target.value);
    });
    
    document.querySelector(`${divSelectors.logged} input.lastname`)?.addEventListener("keyup", e => {
        updateText(`${divSelectors.logged} span.lastname`, e.target.value);
    });

    document.querySelector(`${divSelectors.login} .login_btn`)?.addEventListener("click", e => {
        let log = document.querySelector(`${divSelectors.login} input.login`)?.value;
        let pass = document.querySelector(`${divSelectors.login} input.password`)?.value;
        login(log, pass);
    });

    document.querySelectorAll(`input`).forEach(el => {
        el.addEventListener("change", e => {
            let a = document.querySelector(`${divSelectors.logged} button#profil_edit`);
            if (a)
                a.removeAttribute("disabled");
        });
    });

    document.querySelector("#profil_edit")?.addEventListener("click", e => editProfile());

    if (typeof user !== "undefined" && user) {
        display(divSelectors.logged);
    }
}

async function register() {
    let username = document.getElementById('reg-username').value;
    let firstname = document.getElementById('reg-firstname').value;
    let lastname = document.getElementById('reg-lastname').value;
    let email = document.getElementById('reg-email').value;
    let password = document.getElementById('reg-password').value;
    let phone = document.getElementById('reg-phone').value;
    let mobile = document.getElementById('reg-mobile').value;
    let address = document.getElementById('reg-address').value;

    if (username == "" || firstname == "" || lastname == "" || email == "" || password == "" || phone == "" || mobile == "" || address == "") {
        let errorP = document.getElementById("reg-error");
        errorP.innerHTML = "Please fill in everything";
        errorP.parentElement.hidden = false;
        return;
    }

    let res = await fetch(api_url + "/user/register", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: password,
            phone: phone,
            mobile: mobile,
            address: address
            })
        });

        res = await res.json()

        if (res.error == "email") {
            let errorP = document.getElementById("reg-error");
            errorP.innerHTML = "Incorrect email format";
            errorP.parentElement.hidden = false;
        } else if (res.error == "none") {
            let res = await fetchUser(username, password);
            if (res === true) {
                console.log("fetched");
                updateUserEditPage();
                let a = document.querySelector(divSelectors.login);
                let b = a.parentNode;
                b.removeChild(a);
                b.appendChild(a);
                
                return;
            };
        }
}
document.getElementById("reg-submit").addEventListener("click", e => register());