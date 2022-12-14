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

function displayError(nextTo, error) {
    let e = document.querySelector(nextTo);
    if (!e || !e.parentNode) return;
    let span = e.parentNode.querySelector("span.error");
    if (span) {
        span.innerText = error;
        return;
    }

    span = document.createElement("span");
    span.classList.add("error");
    span.innerText = error;
    e.after(span);
}

//displayError(`${divSelectors.login} > .register input.username`, "bananan");

function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.innerText = value;
    });
}

async function editProfile() {
    if (typeof user === 'undefined' || !user) window.location = "/";
    let body = {};
    let ids = ["website", "instagram", "facebook", "username", "firstname", "lastname", "phone", "mobile", "address", "email"];
    ids.forEach(key => {
        let v = document.querySelector("input." + key);
        if (v && v.value)
            body[key] = v.value;
    });

    let res = await fetch(api_url + "/user/edit", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    res = await res.json();

    if (res.error == "empty") {
        let errorP = document.getElementById("edit-error");
        errorP.innerHTML = "Invalid phone number";
        errorP.parentElement.hidden = false;
    } else if (res.error == "phone") {
        let errorP = document.getElementById("edit-error");
        errorP.innerHTML = "Invalid phone number";
        errorP.parentElement.hidden = false;
    }
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
    changeLoggedInputContent(".mobile", user?.mobilephone);
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
        updateTherapistData();
        return;
    } else {
        displayError(`${divSelectors.login} > .login input.password`, "Invalid Username/password");
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
        method: "POST",
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

    res = await res.json();

    if (res.error == "email") {
        displayError(`${divSelectors.login} > .register input.email`, "Incorrect email format");
    } else if (res.error == "empty") {
        displayError(`${divSelectors.login} > .register input.address`, "Please fill in everything");
    } else if (res.error == "phone") {
        displayError(`${divSelectors.login} > .register input.mobile`, "Invalid phone number");
    } else if (res.error == "none") {
        let res = await fetchUser(username, password);
        if (res === true) {
            updateUserEditPage();
            display(divSelectors.logged);

            return;
        };
    }
}

async function askTherapistPromotion() {
    let res = await fetch(api_url + "/user/therapist_promotion", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    updateTherapistData();
}

async function fetchTherapist() {
    if (!user) return;
    try {
        let res = await fetch(api_url + "/user/info_therapist", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });
        res = await res.json();
        if (res.success) {
            if (res.therapist)
                user.therapist = res.therapist;
            else if (res.asked)
                user.therapist = {asked: true}
        }

    } catch (err) {throw err;
    }
}

async function updateTherapistData() {
    await fetchTherapist();
    if (user && user.therapist) {
        let btn = document.querySelector("#profil_ask_therapist");
        if (btn) 
            btn.setAttribute("disabled", "true");
    }
}

async function disconnect() {
    await fetch(api_url + "/user/logout");

    user = null;
    
    updateUserEditPage();
    display(divSelectors.login);
    updateTherapistData();
}

export function main() {
    document.querySelector("#profil_edit")?.addEventListener("click", e => editProfile());
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

    document.querySelector("#profil_disconnect").addEventListener("click", e => disconnect());
    document.querySelectorAll(`input`).forEach(el => {
        el.addEventListener("change", e => {
            let a = document.querySelector(`${divSelectors.logged} button#profil_edit`);
            if (a)
                a.removeAttribute("disabled");
        });
    });

    document.getElementById("reg-submit").addEventListener("click", e => register());
    $('#profile_picture').click(function(){ $('#profile_pic_input').trigger('click'); });

    document.querySelector("#profil_ask_therapist").addEventListener("click", e => askTherapistPromotion());

    updateTherapistData();

    if (typeof user !== 'undefined') {
        updateUserEditPage();
        display(divSelectors.logged);

        return;
    }
}
