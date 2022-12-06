

function start() {

    document.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            if (!e.target.href) return;
            fetchPage(e.target.href).then(page => {
                changePage(page, e.target.href);
            });
        });
    
    });

}

function changeContentLinkEvent() {
    document.querySelectorAll("body > .container-fluid a").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            if (!e.target.href) return;
            fetchPage(e.target.href).then(page => {
                changePage(page, e.target.href);
            });
        });
    
    });
}

function changePage(data, urlPath){
    window.history.replaceState({"html":document.querySelector("body > .container-fluid").innerHTML, "pageTitle":document.title}, '', document.location.href);
    document.querySelector("body > .container-fluid").innerHTML = data.html;
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