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
        card.style.width = "25rem";

        let cb = document.createElement('div');
        cb.classList.add("card-body");
        cb.classList.add("d-flex");
        cb.classList.add("justify-content-evenly");

        let ct = document.createElement('h5');
        ct.classList.add("card-title");
        ct.innerText = `${therapist.User?.firstname} ${therapist.User?.lastname}`;

        let approveBtn = document.createElement("btn");
        approveBtn.classList.add("btn");
        approveBtn.classList.add("btn-outline-success");
        approveBtn.innerText = "Promote";
        approveBtn.addEventListener("click", async e => {
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
        
        let refuseBtn = document.createElement("btn");
        refuseBtn.classList.add("btn");
        refuseBtn.classList.add("btn-outline-danger");
        refuseBtn.innerText = "Refuse";
        refuseBtn.addEventListener("click", async e => {
            await fetch(api_url + "/admin/refuse", {
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
        cb.appendChild(approveBtn);
        cb.appendChild(refuseBtn);
        card.appendChild(cb);

        list_container.appendChild(card);
    });

    let n_demands = document.querySelector("#therapist_demands_count")
    if (n_demands) n_demands.innerText = therapist_demands.therapists.length;
}

export function main() {
    reloadTherapistList();
}