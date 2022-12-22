import { generateCalendarFilters, loadCalendar, refreshCalendarEvents, updateRoomList } from './roomCalendar.js';

async function updateTherapistList() {
    //let select = document.querySelector("#input_users");

    let therapists = [];
    try {
        let res = await fetch(api_url + "/admin/therapist/all", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify()
        });
        
        if (res.status != 200) {
            return;
        }
        res = await res.json();

        if (!res.success) {
            return;
        }

        therapists = res.data.therapists;
    } catch (e) {console.error(e);}

    therapists.forEach(t => {
        //select.innerHTML += `<option value="${t.id}">${t.User.firstname} ${t.User.lastname}</option>`;
    });
}

var selectedUsers = [];

let calendarParams = {
    api_url: "/admin/room/calendar",
    suppData: {
        users: JSON.stringify([])
    }
};

function createMultiUserSelect() {
    let input = document.querySelector(".input_users");
    if (!input) return false;

    input.addEventListener("keydown", e => {
        if (e.key != "Enter" || input.value.length <= 0) return;

        if (selectedUsers.includes(input.value.toLocaleLowerCase())) {
            selectedUsers = selectedUsers.filter(u => u != input.value.toLocaleLowerCase());
        } else {
            selectedUsers.push(input.value.toLocaleLowerCase());
        }

        input.value = "";

        refreshUsersList();
    });
}

function refreshUsersList() {
    let users_list = document.querySelector(".users_list");
    if (!users_list) return false;

    calendarParams.suppData.users = JSON.stringify(selectedUsers);

    users_list.innerHTML = "";

    selectedUsers.forEach(u => {
        users_list.innerHTML += `<div class="px-2 m-1 border border-1 rounded-pill">${u}</div>`
    });
}

export async function main() {
    await updateTherapistList();

    await updateRoomList();

    generateCalendarFilters(calendarParams);

    loadCalendar();

    createMultiUserSelect();
}