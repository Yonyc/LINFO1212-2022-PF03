function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.innerText = value;
    });
}

updateText(".firstname", document.querySelector("#input_firstname").value);

updateText(".lastname", document.querySelector("#input_lastname").value);

document.querySelector("#input_firstname").addEventListener("keyup", e => {
    updateText(".firstname", e.target.value);
});

document.querySelector("#input_lastname").addEventListener("keyup", e => {
    updateText(".lastname", e.target.value);
});