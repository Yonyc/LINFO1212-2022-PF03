var therapistData;

import { loadCalendar } from "/js/roomCalendar.js";

async function respond(response, id) {
    try {
        let res = await fetch(api_url + "/appointment/" + response, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appointmentDemand: id
            })
        });

        if (res.status != 200) {
            errorModal._element.querySelector(".error_text").innerText = res.data.message;
            errorModal.show();
            return;
        }
        res = await res.json();

        if (res.success)
            return getDemands();

        errorModal._element.querySelector(".error_text").innerText = res.data.message;
        errorModal.show();

    } catch (e) { console.error(e); }
}

function time_convert(num) {
    var hours = Math.floor(num / 60);
    var minutes = num % 60;
    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function generateDemand(infos) {
    var temp = document.querySelector("#appointment_demand");
    var demand = temp.content.cloneNode(true);
    demand.querySelector(".card-title").innerHTML = (infos.accepted) ? `<span class="text-success">Demande acceptée</span>` : ((infos.refused) ? `<span class="text-danger">Demande refusée</span>` : `<span class="text-warning">Demande en cours</span>`);

    demand.querySelector(".profile_picture").src = infos.User.url_pp;
    demand.querySelector(".appointment_date").innerText = (new Date(infos.date)).toLocaleString();
    demand.querySelector(".appointment_duration").innerText = (infos.duration > 0) ? time_convert(infos.duration * 60) : "À déterminer";
    demand.querySelector(".reccurence").innerText = ({ none: "Aucune réccurence", monthly: "Tous les mois", daily: "Tous les jours", weekly: "Toutes les semaines" })[infos.reccurence];
    demand.querySelector(".reccurence_end").innerText = infos.reccurence != "none" ? `Jusqu'au ${(new Date(infos.reccurenceEnd)).toLocaleDateString()}` : "";
    demand.querySelector(".email").innerText = infos.User.email;
    demand.querySelectorAll(".name").forEach(n => n.innerText = `${infos.User.firstname} ${infos.User.lastname}`);

    if (infos.accepted) {
        demand.querySelector(".btn_accept").remove();
    } else {
        demand.querySelector(".btn_accept").addEventListener("click", e => {
            e.target.setAttribute("disabled", true);
            respond("accept", infos.id);
        });
    }

    if (infos.refused) {
        demand.querySelector(".btn_refuse").remove();
    } else {
        demand.querySelector(".btn_refuse").addEventListener("click", e => {
            e.target.setAttribute("disabled", true);
            respond("refuse", infos.id);
        });
    }

    return demand;
}

async function getDemands() {
    let demands_container = document.querySelector(".appointement_demands");

    let demands;
    try {
        let res = await fetch(api_url + "/appointment/therapist_demands", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.status != 200) {
            errorModal._element.querySelector(".error_text").innerText = res.data.message;
            errorModal.show();
            return;
        }
        res = await res.json();

        if (!res.success) {
            errorModal._element.querySelector(".error_text").innerText = res.data.message;
            errorModal.show();
            return;
        }

        demands = res.data.appointments;
    } catch (e) { err = e; console.error(e); }

    demands_container.innerHTML = "";
    demands.forEach(d => {
        demands_container.appendChild(generateDemand(d));
    });
}

function genEditFields() {
    let editors = document.querySelector("#therapist_editors");
    if (!editors) return;

    let vals = {
        "whoami": "Qui suis-je ?",
        "whatido": "Que fais-je ?",
        "infos": "Infos pratiques"
    };

    Object.keys(vals).forEach(val => {
        editors.innerHTML += `<div class="row container-fluid">
            <div class="row mt-5">
                <div class="col d-flex justify-content-between">
                    <h1 class="aquaticfont">${vals[val]}</h1>
                    <button class="btn btn-info align-self-end" id="${val}_edit">Enregistrer</button>
                </div>
            </div>
            <div class="row mt-1">
                <form class="col" id="${val}_form">
                    <textarea id="${val}" class="therapist_attribute text_editor">${therapistData[val] ?? ""}</textarea>
                </form>
            </div>
        </div>`;
    });

    Object.keys(vals).forEach(async val => {
        let editor = await tinymce.init({
            selector: '#' + val,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
        });


        let el = document.querySelector(`#${val}_edit`);
        if (!el) return;



        el.addEventListener("click", async e => {
            if (el.getAttribute("disabled")) return;
            el.setAttribute("disabled", true);
            try {
                let res = await fetch(api_url + "/therapist/edit/" + val, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: editor[0].getContent()
                    })
                });
            } catch (e) {
                errorModal._element.querySelector(".error_text").innerText = e;
                errorModal.show();
            }
            el.removeAttribute("disabled");
        });
    });
}

async function setTherapistData() {
    //profile_show
    let err, res;
    try {
        res = await fetch(api_url + "/therapist/data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.status != 200) {
            errorModal._element.querySelector(".error_text").innerText = res.data.message;
            errorModal.show();
            return;
        }
        res = await res.json();

        if (!res.success) {
            errorModal._element.querySelector(".error_text").innerText = res.data.message;
            errorModal.show();
            return;
        }
    } catch (e) { err = e; }
    if (err) return;

    therapistData = res.data;

    let listShow = document.querySelector("#profile_show");

    if (listShow) {
        listShow.checked = res.data.shown;
    }

    let job = document.querySelector("#job_field");

    if (job && res.data.job) {
        job.value = res.data.job;
    }

    genEditFields();
}

async function setupBtns() {
    let btn_job = document.querySelector("#job_edit");
    let jobField = document.querySelector("#job_field");
    if (btn_job && jobField) {
        btn_job.removeAttribute("disabled");
        jobField.removeAttribute("disabled");
        btn_job.addEventListener("click", async e => {
            e.target.setAttribute("disabled", true);
            try {
                let res = await fetch(api_url + "/therapist/edit/job", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        job: jobField.value
                    })
                });
            } catch (e) {
                errorModal._element.querySelector(".error_text").innerText = e;
                errorModal.show();
            }
            e.target.removeAttribute("disabled");
        });
    }

    let listShow = document.querySelector("#profile_show");
    if (listShow) {
        listShow.removeAttribute("disabled");
        listShow.addEventListener("change", async e => {
            e.target.setAttribute("disabled", true);
            try {
                let res = await fetch(api_url + "/therapist/edit/shown", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        shown: e.target.checked
                    })
                });
            } catch (e) {
                errorModal._element.querySelector(".error_text").innerText = e;
                errorModal.show();
            }
            e.target.removeAttribute("disabled");
        });
    }


}

export async function main() {
    loadCalendar({
        api_url: "/room/mycalendar",
        popupcontent: (infos) => {
            return "Cliquez sur la réservation pour l'annuler";
        },
        eventClick: async (info) => {
            console.log(info.event);
            try {
                let res = await fetch(api_url + "/room/cancel", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reservationID: info.event.id
                    })
                });

                if (res.status != 200) return;

                res = await res.json();

                if (!res.success) {
                    errorModal._element.querySelector(".error_text").innerText = res.data.message;
                    errorModal.show();
                    return;
                }

                location.reload();

            } catch (e) {
                errorModal._element.querySelector(".error_text").innerText = e;
                errorModal.show();
            }
        }
    });
    getDemands();
    setupBtns();
    setTherapistData();
}