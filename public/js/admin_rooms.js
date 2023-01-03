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

function setError(error) {
    document.querySelector('.roomCreationError').innerText = error;
}

async function createRoom() {
    let btn = document.querySelector(".room_creation_btn");
    btn.setAttribute("disabled", "");

    function setErrorRoom(e) {
        setError(e);
        btn.removeAttribute("disabled");
    }
    setError("");

    let price = document.querySelector(".input_roomPrice");
    if (!price || price.value < 0) return setErrorRoom("Le prix est invalide");

    let duration = document.querySelector(".input_roomHour");
    if (!duration) return setErrorRoom("La durée est invalide");

    let name = document.querySelector(".input_roomName");
    if (!name || !name.value) return setErrorRoom("Le nom de la salle est manquant");

    let description = document.querySelector(".input_roomDescription");
    if (!description) return setErrorRoom("La description est invalide");

    let size = document.querySelector(".input_roomDescription");
    if (!size) return setErrorRoom("La taille est invalide");

    let capacity = document.querySelector(".input_roomCapacity");
    if (!capacity) return setErrorRoom("La capacité est invalide");

    try {
        let res = await fetch(api_url + "/admin/room/create", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.value,
                size: size.value,
                description: description.value
            })
        });
        
        if (res.status != 200) {
            res = await res.json();
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

        await updateRoomList();
        generateCalendarFilters();
    
        btn.removeAttribute("disabled");
    } catch (e) {console.error(e);}
}

function initializeRoomCreation() {
    document.querySelector(".room_creation_btn").addEventListener("click", e => createRoom());
}

export async function main() {
    await updateTherapistList();

    await updateRoomList();

    generateCalendarFilters(calendarParams);

    loadCalendar();

    createMultiUserSelect();

    initializeRoomCreation();
}