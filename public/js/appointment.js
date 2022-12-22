function generateDuration() {
    let min = .5;
    let max = 4;

    let selector = document.querySelector(".input_duration");
    if (!selector) return;
    selector.innerHTML = "";

    for (let i = min; i <= max; i += .25) {
        selector.innerHTML += `<option value="${i}">${String(Math.floor(i)).padStart(2, "0")}:${String(i % 1 * 60).padStart(2, "0")}</option>`;
    }
}

export function main(){

    generateDuration();

}