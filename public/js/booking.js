// JavaScript for booking page

var calendar;
var rooms = [];

async function loadCalendar() {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'list' ],
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        editable: false,
        navLinks: true,
        eventLimit: true,
        eventRender: function(info) {
        },
        eventSources: [
            {
                url: '/api/room/calendar',
                method: 'POST',
                failure: function (e) {}
            }
        ],
        eventTimeFormat: { // like '14:30:00'
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        },
        minTime: "08:00:00",
        maxTime: "20:00:00",
        defaultView: 'timeGridWeek',
        allDaySlot: false,
        locale: 'fr',
        firstDay: 1,
        hiddenDays: []
    });

    calendar.render();
}

async function updateRoomList() {
    try {
        let res = await fetch(api_url + "/room/display_infos", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });
        
        if (res.status != 200)
            return false;
        
        res = await res.json();

        if (!res.success)
            return false;

        let roomListElem = document.querySelector(".input_room");
        if (!roomListElem)
            return false;

        roomListElem.innerHTML = "";
        res.data.roomList.forEach(room => {
            roomListElem.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
        rooms = res.data.roomList;

    } catch (err) {throw err;}
}

function setError(error) {
    document.querySelector('#booking .error').innerText = error;
}

function getReservationDate() {
    let date = document.querySelector('.input_date').value;
    let hour = document.querySelector('.input_hour').value;

    if (!date || date.length <= 0 || !hour || hour.length <= 0) return;
    return new Date(date + " " + hour);
}

function refreshUserEvent() {
    let e = calendar.getEventById("demand");

    if (e)
        e.remove();

    let date = getReservationDate();

    if (!date) return;
    
    let duration = document.querySelector(".input_duration");

    let endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 60*duration?.value);

    let room = document.querySelector(".input_room");
    if (!room) return;
    calendar.addEvent({
        id: "demand",
        backgroundColor: "transparent",
        borderColor: "red",
        textColor: "black",
        roomID: room.value,
        start: date.toISOString(),
        end: endDate.toISOString()
    });
}

function refreshCalendarEvents() {
    calendar.getEventSources().forEach(eS => eS.remove());

    document.querySelectorAll(".calendar_container .filters input[type=checkbox]").forEach(i => {
        if (!i.checked) return;
        calendar.addEventSource({
            url: '/api/room/calendar',
            method: 'POST',
            extraParams: {
                roomID: i.id.split("_")[1]
            },
        });
    });

    refreshUserEvent();
}

function generateCalendarFilters() {
    let filters = document.querySelector(".calendar_container .filters");
    filters.innerHTML = "";
    rooms.forEach(r => {
        let id = "room_" + r.id;
        let div = document.createElement("div");
        div.classList.add("form-check");
        div.classList.add("form-switch");
        div.classList.add("form-check-inline");

        let input = document.createElement("input");
        input.classList.add("form-check-input");
        input.type = "checkbox";
        input.checked = true;
        input.id = id;

        let label = document.createElement("label");
        label.classList.add("form-check-label");
        label.setAttribute("for", id);
        label.innerText = r.name;

        input.addEventListener("click", e => refreshCalendarEvents());

        div.appendChild(input);
        div.appendChild(label);

        filters.appendChild(div);
    });
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

function updateCalendarFilters() {
    let flipper = document.querySelector(".calendar_container #flip_filters");
    document.querySelectorAll(".calendar_container .filters input[type=checkbox]").forEach(i => {
        i.checked = flipper.checked;
    });
    refreshCalendarEvents();
}

async function askReservation() {
    let btn = document.querySelector("#reservation_btn");
    btn.setAttribute("disabled", null);

    let date = getReservationDate();
    if (!date) return setError("Aucune date sélectionée");

    let duration = document.querySelector(".input_duration");
    if (!duration) return setError("Aucune durée sélectionée");

    let reccurence = document.querySelector(".input_reccurence");
    if (!reccurence) return setError("Aucune réccurence sélectionée");

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
            setError(res.data.message);
            btn.removeAttribute("disabled");
            return;
        }
        res = await res.json();

        if (!res.success) {
            setError(res.data.message);
            btn.removeAttribute("disabled");
            return;
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

    document.querySelector(".calendar_container #flip_filters").addEventListener("click", e => updateCalendarFilters());

    document.querySelector("#reservation_btn").addEventListener("click", e => askReservation());
};