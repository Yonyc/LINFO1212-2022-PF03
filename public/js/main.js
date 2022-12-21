function preventReloadPageIfLocal(element) {
    element.addEventListener("click", e => {
        let href = e.currentTarget.href;
        if (!href || !href.startsWith(document.location.origin) || href.includes("#")) return;
        e.preventDefault();
        fetchPage(href).then(page => {
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

function changePage(data, urlPath){
    window.history.replaceState({"html":document.querySelector("body > .container-fluid").innerHTML, "pageTitle":document.title}, '', document.location.href);
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
    window.history.pushState({"html":data.html,"pageTitle":data.pageTitle},"", urlPath);
    window.scrollTo(0,0)
    changeContentLinkEvent();
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

    page =  await (await page).text();
    title = await (await title).json();
    return {
        html: page,
        pageTitle: title.title
    };
}

document.addEventListener("DOMContentLoaded", e => {
    window.history.replaceState({"html":document.querySelector("body > .container-fluid").innerHTML, "pageTitle":document.title}, '', document.location.href);
    start();
    document.querySelectorAll("[data-background-image-url]").forEach(el => {
		el.style.backgroundImage = "url(" + el.dataset.backgroundImageUrl + ")";
	});
});

window.onpopstate = function(e){
    if(e.state){
        document.querySelector("body > .container-fluid").innerHTML = e.state.html;
        document.title = e.state.pageTitle;
        window.scrollTo(0,0)
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
    else if(document.getElementById("a").getAttribute("href") == "#one"){
        window.location.href = "/";
    }
 }