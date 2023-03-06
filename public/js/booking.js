// JavaScript for booking page

import { generateCalendarFilters, loadCalendar, refreshUserEvent, updateCalendarFilters, updateRoomList } from "./roomCalendar.js";

function setError(error) {
    document.querySelector('#booking .error').innerText = error;
}

export function getReservationDate() {
    let date = document.querySelector('.input_date').value;
    let hour = document.querySelector('.input_hour').value;

    if (!date || date.length <= 0 || !hour || hour.length <= 0) return;
    return new Date(date + " " + hour);
}

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

async function askReservation() {
    let btn = document.querySelector("#reservation_btn");
    btn.setAttribute("disabled", null);

    function returnError(message) {
        btn.removeAttribute("disabled");
        return setError(message);
    }

    let date = getReservationDate();
    if (!date) return returnError("Aucune date sélectionée");

    let duration = document.querySelector(".input_duration");
    if (!duration) return returnError("Aucune durée sélectionée");

    let reccurence = document.querySelector(".input_reccurence");
    if (!reccurence) return returnError("Aucune réccurence sélectionée");

    let end_reccurence = document.querySelector(".input_end_reccurence");
    if (!end_reccurence || (reccurence.value != "none" && end_reccurence.value.length <= 0)) return;
    end_reccurence = (end_reccurence.value.length > 0) ? new Date(end_reccurence.value) : new Date();

    let room = document.querySelector(".input_room");
    if (!room) return;

    let err;
    try {
        let res = await fetch(api_url + "/room/book", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: date,
                duration: duration.value,
                reccurence: reccurence.value,
                end_reccurence: end_reccurence,
                room: room.value
            })
        });
        
        if (res.status != 200) {
            res = await res.json();
            return returnError(res.data.message);;
        }
        res = await res.json();

        if (!res.success) {
            return returnError(res.data.message);
        }

        setError("");

    } catch (e) {err = e;console.error(e);}
    btn.removeAttribute("disabled");
    if (!err)
        document.querySelector("a[href='/profile']").click();
}

export async function main() {
    await updateRoomList();

    generateCalendarFilters();

    generateDuration();

    loadCalendar();

    document.querySelector(".input_date").addEventListener("input", e => refreshUserEvent());
    document.querySelector(".input_hour").addEventListener("input", e => refreshUserEvent());
    document.querySelector(".input_room").addEventListener("input", e => refreshUserEvent());
    document.querySelector(".input_duration").addEventListener("input", e => refreshUserEvent());

    document.querySelector("#reservation_btn").addEventListener("click", e => askReservation());
};