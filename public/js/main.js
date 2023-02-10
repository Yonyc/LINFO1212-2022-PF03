let errorModal = bootstrap.Toast.getOrCreateInstance(document.querySelector("#errorNotification"));

function updatePP() {
    document.querySelectorAll(`.profile_picture`).forEach(e => {
        if (user?.url_pp)
            e.src = "/" + user.url_pp;
    });
}

function preventReloadPageIfLocal(element) {
    element.addEventListener("click", e => {
        let href = e.currentTarget.href;
        if (!href || !href.startsWith(document.location.origin) || href.includes("#")) return;
        e.preventDefault();
        fetchPage(href).then(page => {
            if (page)
                changePage(page, href);
        });
    });
}

function start() {
    document.querySelectorAll("a").forEach(a => {
        preventReloadPageIfLocal(a);
    });
}

function changeContentLinkEvent() {
    document.querySelectorAll("body > .container-fluid a").forEach(a => {
        preventReloadPageIfLocal(a);
    });
}

function changePage(data, urlPath) {
    window.history.replaceState({ "html": document.querySelector("body > .container-fluid").innerHTML, "pageTitle": document.title }, '', document.location.href);
    let container = document.querySelector("body > .container-fluid");
    container.innerHTML = data.html;
    let script = container.querySelector("#re_script");
    if (script) {
        let newScript = document.createElement("script");
        newScript.id = "re_script";
        newScript.type = script.type;
        newScript.appendChild(document.createTextNode(script.innerHTML));
        script.parentNode.replaceChild(newScript, script)
    }

    document.title = data.pageTitle;
    window.history.pushState({ "html": data.html, "pageTitle": data.pageTitle }, "", urlPath);
    window.scrollTo(0, 0);
    changeContentLinkEvent();

    updatePP();
}

async function fetchPage(url) {
    let page = fetch(url + "?content=true", {
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
    });

    let title = fetch(url + "?infos=true", {
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
    });

    page = await page;
    title = await title;
    if (page.status != 200) {
        page = await page.json();
        if (!errorModal._element) errorModal = bootstrap.Toast.getOrCreateInstance(document.querySelector("#errorNotification"));
        errorModal._element.querySelector(".error_text").innerText = page.data.message;
        errorModal.show();
        return;
    }
    page = await page.text();

    if (title.status != 200) {
        title = await title.json();
        if (!errorModal._element) errorModal = bootstrap.Toast.getOrCreateInstance(document.querySelector("#errorNotification"));
        errorModal._element.querySelector(".error_text").innerText = title.data.message;
        errorModal.show();
        return;
    }
    title = await title.json();

    return {
        html: page,
        pageTitle: title.title
    };
}

document.addEventListener("DOMContentLoaded", e => {
    window.history.replaceState({ "html": document.querySelector("body > .container-fluid").innerHTML, "pageTitle": document.title }, '', document.location.href);
    start();
    document.querySelectorAll("[data-background-image-url]").forEach(el => {
        el.style.backgroundImage = "url(" + el.dataset.backgroundImageUrl + ")";
    });
    updatePP();
});

window.onpopstate = function (e) {
    if (e.state) {
        let container = document.querySelector("body > .container-fluid");
        container.innerHTML = e.state.html;
        let script = container.querySelector("#re_script");
        if (script) {
            let newScript = document.createElement("script");
            newScript.id = "re_script";
            newScript.type = script.type;
            newScript.appendChild(document.createTextNode(script.innerHTML));
            script.parentNode.replaceChild(newScript, script)
        }
        document.title = e.state.pageTitle;
        window.scrollTo(0, 0)
        changeContentLinkEvent();
    }
};

/* NAVBAR */
function navbarOverlap() {
    let n = document.querySelector("nav");
    if (!n) return;
    let overlapping = false;

    var navbar = n.getBoundingClientRect();

    [".mainpage", "#booking"].forEach(el => {
        let e = document.querySelector(el);
        if (!e) return;
        var rect = e.getBoundingClientRect();

        if (navbar.y + navbar.height < rect.y + rect.height)
            overlapping = true;

        if (window.scrollY > 0)
            overlapping = false;
    });

    if (overlapping) {
        n.classList.remove("bg-light");
    } else {
        n.classList.add("bg-light");
    }
}

document.addEventListener("scroll", e => navbarOverlap());

function checkPageForNavLink() {
    if (window.location.pathname != '/')
        window.location.href = "/";
    else if (document.getElementById("a").getAttribute("href") == "#one") {
        window.location.href = "/";
    }
}