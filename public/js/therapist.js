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
    console.log(infos)
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

export async function main() {

    getDemands();

}