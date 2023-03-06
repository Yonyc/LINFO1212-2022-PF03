import { getReservationDate } from "./booking.js";
var calendar;
var rooms = [];

export async function updateRoomList() {
    try {
        let res = await fetch(api_url + "/room/display_infos", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.status != 200) {
            res = await res.json();
            return false;
        }

        res = await res.json();

        if (!res.success) {
            return false;
        }

        rooms = res.data.roomList;

        let roomListElem = document.querySelector(".input_room");
        if (roomListElem) {
            roomListElem.innerHTML = "";
            res.data.roomList.forEach(room => {
                roomListElem.innerHTML += `<option value="${room.id}">${room.name}</option>`;
            });
        }

    } catch (err) { throw err; }
}

export async function loadCalendar(params = {}) {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            start: 'prev,next today',
            center: 'title',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        editable: false,
        navLinks: true,
        eventDidMount: function (info) {
            $(info.el).popover({
                title: info.event.title,
                placement: 'top',
                trigger: 'hover',
                content: params.popupcontent ? params.popupcontent(info) : "" ,
                container: 'body'
            });
        },
        eventClick: params.eventClick,
        eventSources: [
            {
                url: api_url + (params.api_url ?? '/room/calendar'),
                method: 'POST',
                failure: function (e) { }
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
        slotMinTime: "08:00:00",
        slotMaxTime: "20:00:00",
        initialView: 'timeGridWeek',
        allDaySlot: false,
        locale: 'fr',
        firstDay: 1,
        hiddenDays: []
    });

    calendar.render();
}

export function refreshCalendarEvents(params = {}) {
    calendar.getEventSources().forEach(eS => eS.remove());

    document.querySelectorAll(".calendar_container .filters input[type=checkbox]").forEach(i => {
        if (!i.checked) return;
        calendar.addEventSource({
            url: api_url + (params.api_url ?? '/room/calendar'),
            method: 'POST',
            extraParams: {
                roomID: i.id.split("_")[1],
                ...params.suppData
            },
        });
    });
}

export function generateCalendarFilters() {
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

        input.addEventListener("click", e => {
            refreshCalendarEvents();
            refreshUserEvent();
        });

        div.appendChild(input);
        div.appendChild(label);

        filters.appendChild(div);
    });

    document.querySelector(".calendar_container #flip_filters").addEventListener("click", e => updateCalendarFilters());
}

export function updateCalendarFilters(params = {}) {
    let flipper = document.querySelector(".calendar_container #flip_filters");
    document.querySelectorAll(".calendar_container .filters input[type=checkbox]").forEach(i => {
        i.checked = flipper.checked;
    });
    refreshCalendarEvents(params);
}

export function refreshUserEvent() {
    let e = calendar.getEventById("demand");

    if (e)
        e.remove();

    let date = getReservationDate();

    if (!date) return;

    let duration = document.querySelector(".input_duration");

    let endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 60 * duration?.value);

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