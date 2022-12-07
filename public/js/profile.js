const divSelectors = {
    logged: ".logged_view",
    login: ".login_register_view"
};

function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.innerText = value;
    });
}

function editProfile() {
    if (typeof username === 'undefined' || !username) window.location = "/";
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
}

async function login(username, password) {
    let res = await fetchUser(username, password);
    if (res === true) {
        updateUserEditPage();
        let a = document.querySelector(divSelectors.login);
        let b = a.parentNode;
        b.removeChild(a);
        b.appendChild(a);
        
        return;
    };
    console.error(res);
}

export function main() {
    updateText(`${divSelectors.logged} span.firstname`, document.querySelector(`${divSelectors.logged} input#firstname`)?.value);
    
    updateText(`${divSelectors.logged} span.lastname`, document.querySelector(`${divSelectors.logged} input#lastname`)?.value);
    
    document.querySelector(`${divSelectors.logged} input#firstname`)?.addEventListener("key", e => {
        updateText(`${divSelectors.logged} span.firstname`, e.target.value);
    });
    
    document.querySelector(`${divSelectors.logged} input#lastname`)?.addEventListener("change", e => {
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
}