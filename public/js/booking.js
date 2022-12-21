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

function refreshUserEvent() {
    let e = calendar.getEventById("demand");

    if (e)
        e.remove();

    let date = document.querySelector('.input_date').value;
    let hour = document.querySelector('.input_hour').value;

    if (!date || date.length <= 0 || !hour || hour.length <= 0) return;

    date = new Date(date.replaceAll("-", "/") + "-" + hour);
    let endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 60);

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

function updateCalendarFilters() {
    let flipper = document.querySelector(".calendar_container #flip_filters");
    document.querySelectorAll(".calendar_container .filters input[type=checkbox]").forEach(i => {
        i.checked = flipper.checked;
    });
    refreshCalendarEvents();
}

export async function main() {
    document.getElementById("myTime").min = "08:00";
    document.getElementById("myTime").max = "19:00";

    await updateRoomList();

    generateCalendarFilters();

    loadCalendar();

    document.querySelector(".input_date").addEventListener("input", e => refreshUserEvent());
    document.querySelector(".input_hour").addEventListener("input", e => refreshUserEvent());
    document.querySelector(".input_room").addEventListener("input", e => refreshUserEvent());

    document.querySelector(".calendar_container #flip_filters").addEventListener("click", e => updateCalendarFilters());
};