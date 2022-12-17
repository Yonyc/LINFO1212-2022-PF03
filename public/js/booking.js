// JavaScript for booking page

var calendar;

export function main() {
    document.getElementById("myTime").min = "08:00";
    document.getElementById("myTime").max = "19:00";

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
            var tooltip = new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        events: {
            url: './api/events',
            failure: function() {
                document.getElementById('script-warning').style.display = 'block'
            }
        },
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
    
};