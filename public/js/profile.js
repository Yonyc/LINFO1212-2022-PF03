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
    removeErrors();
    if (typeof user === 'undefined' || !user) window.location = "/";
    let body = {};
    let ids = ["website", "instagram", "facebook", "username", "firstname", "lastname", "phone", "mobilephone", "address", "email"];
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

    if (!res.error) return;

    if (res.error == "email_taken") {
        addError("input.email", "Cette adresse email est déjà utilisée");
    } else {
        addError("input." + res.error, "Ce champ n'a pas pu être modifié du côté du serveur");
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
    changeLoggedInputContent(".mobilephone", user?.mobilephone);
    changeLoggedInputContent(".address", user?.address);

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

function addError(selector, value) {
    let d = document.querySelector(selector);
    if (!d) return;
    let e = document.createElement("span");
    e.classList.add("error");
    e.classList.add("text-danger");
    e.innerText = value;
    d.after(e);
}

function removeErrors(selector = "") {
    document.querySelectorAll(selector + " .error").forEach(e => e.remove());
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
    removeErrors();

    let error = false;

    if (username.length < 3) {
        addError("#reg-username", "Veuillez entrer un nom d'utilisateur faisant au moins 3 caractères");
        error = true;
    }
    
    if (firstname.length <= 0) {
        addError("#reg-firstname", "Veuillez entrer un prénom");
        error = true;
    }
    
    if (lastname.length <= 0) {
        addError("#reg-lastname", "Veuillez entrer un nom");
        error = true;
    }
    
    if (email.length <= 0 || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        addError("#reg-email", "Veuillez entrer un email valide");
        error = true;
    }
    
    if (password.length < 8) {
        addError("#reg-password", "Veuillez entrer un mot de passe faisant au moins 8 caractères");
        error = true;
    }

    if (error) return;

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
            mobilephone: mobile,
            address: address
        })
    });

    res = await res.json();

    if (res.error == "none") {
        let res = await fetchUser(username, password);
        if (res === true) {
            updateUserEditPage();
            display(divSelectors.logged);

            return;
        };
    } else if (res.error == "email_taken") {
        addError("reg-email", "Addresse email déjà utilisée");
    } else {
        addError("reg-" + res.error, "Vérification de cette donnée impossible (serveur)");
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
