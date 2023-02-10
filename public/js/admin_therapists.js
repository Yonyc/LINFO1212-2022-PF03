async function reloadTherapistList() {
    let lists = [
        { name: "approvals", target: document.querySelector(".therapists_demands") },
        { name: "list", target: document.querySelector(".therapists_list") },
        { name: "rejected", target: document.querySelector(".therapists_demands_refused") }
    ];
    for (let index = 0; index < lists.length; index++) {
        if (!lists[index]) return;
    }

    for (let index = 0; index < lists.length; index++) {
        let e = lists[index];
        e.response = await fetch(api_url + "/admin/therapist/" + e.name, { method: "POST" });
    }

    for (let index = 0; index < lists.length; index++) {
        let e = lists[index];
        e.response = await e.response.json();

        if (!e.response.success) return;
    }

    for (let index = 0; index < lists.length; index++) {
        let therapist_demands = lists[index];
        therapist_demands.target.innerHTML = "";

        therapist_demands.response.therapists.forEach(therapist => {
            let card = document.createElement('li');
            card.classList.add("position-relative");
            card.classList.add("booking");

            card.innerHTML += `<div class="media">
    
                <div class="msg-img">
                    <img class="profile_picture" alt="" src="/${therapist.User.url_pp}">
                </div>
    
                <div class="media-body">
                    <h5 class="mb-4">${therapist.User.firstname} ${therapist.User.lastname}</h5>
                    <div class="mb-5">
                        <span class="mr-2 d-block d-sm-inline-block mb-1 mb-sm-0">Détail de l'utilisateur:</span>
                        <span class="border-right pr-2 mr-2">${therapist.User.username}</span>
                        <span class="border-right pr-2 mr-2">${therapist.User.email}</span>
                        <span class="phone">${therapist.User.phone}</span>
                    </div>
                </div>
    
            </div>`;

            let btnContainer = document.createElement("div");
            btnContainer.classList.add("buttons-to-right");

            let approveBtn = document.createElement("btn");
            approveBtn.classList.add("btn");
            approveBtn.classList.add("btn-gray");
            approveBtn.classList.add("mr-2");
            approveBtn.innerHTML = `<i class="far fa-check-circle mr-2"></i>Approuver`;
            approveBtn.addEventListener("click", async e => {
                await fetch(api_url + "/admin/therapist/promote", {
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
            refuseBtn.classList.add("btn-gray");
            refuseBtn.innerHTML = `<i class="far fa-times-circle mr-2"></i> Refuser`;
            refuseBtn.addEventListener("click", async e => {
                await fetch(api_url + "/admin/therapist/refuse", {
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
            btnContainer.appendChild(approveBtn);
            btnContainer.appendChild(refuseBtn);
            card.appendChild(btnContainer);

            therapist_demands.target.appendChild(card);
        });
    }
}

export function main() {
    reloadTherapistList();
}