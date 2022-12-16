async function reloadTherapistList() {
    let list_container = document.querySelector(".demands-list");
    if (!list_container) return;

    let therapist_demands = await fetch(api_url + "/admin/therapist_approvals", {method: "POST"});
    therapist_demands = await therapist_demands.json();

    if (!therapist_demands.success) return;

    list_container.innerHTML = "";
    therapist_demands.therapists.forEach(therapist => {
        let card = document.createElement('div');
        card.classList.add("card");
        card.style.width = "18rem";

        let cb = document.createElement('div');
        cb.classList.add("card-body");
        cb.classList.add("d-flex");
        cb.classList.add("justify-content-evenly");

        let ct = document.createElement('h5');
        ct.classList.add("card-title");
        ct.innerText = `${therapist.User?.firstname} ${therapist.User?.lastname}`;

        let cBtn = document.createElement("btn");
        cBtn.classList.add("btn");
        cBtn.classList.add("btn-outline-success");
        cBtn.innerText = "Promote";
        cBtn.addEventListener("click", async e => {
            await fetch(api_url + "/admin/promote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    therapist: therapist.id
                })
            });
            reloadTherapistList();
        });

        cb.appendChild(ct);
        cb.appendChild(cBtn);
        card.appendChild(cb);

        list_container.appendChild(card);
        
    });
}

export function main() {
    reloadTherapistList();
}