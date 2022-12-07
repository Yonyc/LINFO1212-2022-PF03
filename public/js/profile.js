function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        el.innerText = value;
    });
}

export function main() {
    updateText(".firstname", document.querySelector("#input_firstname").value);
    
    updateText(".lastname", document.querySelector("#input_lastname").value);
    
    document.querySelector("#input_firstname").addEventListener("keyup", e => {
        updateText(".firstname", e.target.value);
    });
    
    document.querySelector("#input_lastname").addEventListener("keyup", e => {
        updateText(".lastname", e.target.value);
    });

    document.querySelectorAll("input").forEach(el => {
        el.addEventListener("change", e => {
            let a = document.querySelector("#profil_edit");
            if (a)
                a.removeAttribute("disabled");
        });
    });
}