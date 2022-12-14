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
        changeContentLinkEvent();
    }
};

/* NAVBAR */
function overlap(b, c) {
    
    var slider = b.getBoundingClientRect();
    var navbar = c.getBoundingClientRect();

    return slider.y <= navbar.y && slider.y + slider.height >= navbar.y ||
        slider.y <= navbar.y + navbar.height && slider.y + slider.height >= navbar.y + navbar.height;
}

document.addEventListener("scroll", e => {
    let navbar = document.querySelector("nav");
    let carousel = document.querySelector(".mainpage");
    if (!navbar || !carousel) return;
    if (overlap(carousel, navbar)) {
        navbar.classList.remove("bg-light");
    } else {
        navbar.classList.add("bg-light");
    }
})