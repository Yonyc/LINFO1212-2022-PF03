function autocomplete(inp, arr) {
    /* 
        CREDIT: https://www.w3schools.com/howto/howto_js_autocomplete.asp
    */

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus = -1;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        updateList(this.value, this);
    });
    inp.addEventListener("focus", e => {
        updateList(e.target.value, e.target);
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function updateList(val, elem) {
        let a, b, i = val;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) val = "";
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", elem.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        elem.parentNode.appendChild(a);
        /*for each item in the array...*/
        let c = 0;
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            let valSearch = arr[i].toLowerCase();
            let valSearching = val.toLowerCase();
            if (val.length == 0 || valSearch.includes(valSearching)) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                let index = valSearch.indexOf(valSearching);
                b.innerHTML = arr[i].substr(0, index);
                b.innerHTML += "<strong>" + arr[i].substr(index, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(index + val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.querySelector("input").value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
                c++;
            }
        }

        if (c == 0) updateList(val.substr(0, val.length - 1), elem);
    }
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

function generateDuration() {
    let min = 0;
    let max = 4;

    let selector = document.querySelector(".input_duration");
    if (!selector) return;
    selector.innerHTML = "";

    for (let i = min; i <= max; i += .25) {
        selector.innerHTML += `<option value="${i}">${String(Math.floor(i)).padStart(2, "0")}:${String(i % 1 * 60).padStart(2, "0")}</option>`;
    }
}

var coachs = [];
async function generateCoachs() {
    try {
        let res = await fetch(api_url + "/therapist/list", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
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

        coachs = res.data.therapists;

    } catch (e) {
        console.error(e);
    }
}

function setError(error) {
    document.querySelector('#appointment .error').innerText = error;
}

function getAppointmentDate() {
    let date = document.querySelector('.input_date').value;
    let hour = document.querySelector('.input_hour').value;

    if (!date || date.length <= 0 || !hour || hour.length <= 0) return;
    return new Date(date + " " + hour);
}

async function askAppointment() {
    let btn = document.querySelector("#appointment_btn");
    btn.setAttribute("disabled", true);

    function setErrorAsk(e) {
        setError(e);
        btn.removeAttribute("disabled");
    }
    setError("");

    let date = getAppointmentDate();
    if (!date) return setErrorAsk("Aucune date sélectionée");

    let duration = document.querySelector(".input_duration");
    if (!duration) return setErrorAsk("Aucune durée sélectionée");

    let reccurence = document.querySelector(".input_reccurence");
    if (!reccurence) return setErrorAsk("Aucune réccurence sélectionée");

    let end_reccurence = document.querySelector(".input_end_reccurence");
    if (!end_reccurence || (reccurence.value != "none" && end_reccurence.value.length <= 0)) return setErrorAsk("Aucune date de fin de reccurence sélectionnée");
    end_reccurence = (end_reccurence.value.length > 0) ? new Date(end_reccurence.value) : new Date();

    let therapist = document.querySelector("#input_therapist");
    if (!therapist) return setErrorAsk("Aucune thérapeute sélectioné");
    therapist = coachs.find(t => `${t.User.firstname} ${t.User.lastname} (${t.job})` === therapist.value);
    if (!therapist) return setErrorAsk("Aucune thérapeute sélectioné");

    let err;
    try {
        let res = await fetch(api_url + "/appointment/ask_appointment", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: date,
                duration: duration.value,
                reccurence: reccurence.value,
                end_reccurence: end_reccurence,
                therapist: therapist.id
            })
        });

        if (res.status != 200) {
            res = await res.json();
            setErrorAsk(res.data.message);
            return;
        }
        res = await res.json();

        if (!res.success) {
            setErrorAsk(res.data.message);
            return;
        }

    } catch (e) { err = e; console.error(e); }
    await getDemands();
    btn.removeAttribute("disabled");
}

function time_convert(num) {
    var hours = Math.floor(num / 60);
    var minutes = num % 60;
    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

async function getDemands() {
    let demands_container = document.querySelector(".appointement_demands");

    let demands;
    try {
        let res = await fetch(api_url + "/appointment/my_appointments", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (res.status != 200) {
            res = await res.json();
            setErrorAsk(res.data.message);
            return;
        }
        res = await res.json();

        if (!res.success) {
            setErrorAsk(res.data.message);
            return;
        }

        demands = res.data.appointments;
    } catch (e) { err = e; console.error(e); }
    console.log(demands)

    demands_container.innerHTML = "";
    demands.forEach(d => {
        let booking = document.createElement("div");
        booking.setAttribute("class", "booking-form mb-3 row");
        booking.innerHTML = `<div class="col">${(new Date(d.date)).toLocaleString()} - Durée: ${(d.duration > 0) ? time_convert(d.duration * 60) : "À déterminer"}</div><div class="col">${d.Therapist.User.firstname} ${d.Therapist.User.lastname} (${d.Therapist.job})</div><div class="col">${({ none: "Aucune réccurence", monthly: "Tous les mois", daily: "Tous les jours", weekly: "Toutes les semaines" })[d.reccurence]} ${d.reccurence != "none" ? `jusqu'au ${(new Date(d.reccurenceEnd)).toLocaleDateString()}` : ""}</div>`

        let cancelCol = document.createElement("div");
        cancelCol.setAttribute("class", "col-1");
        booking.appendChild(cancelCol)

        if (d.accepted) {
            cancelCol.innerHTML = `<span class="text-success">Accepté</span>`;
        } else {
            let cancel = document.createElement("button");
            cancelCol.appendChild(cancel);

            cancel.innerHTML = d.refused ? `<span>Refusé</span>` : `<i class="far fa-times-circle mr-2"></i>`;
            cancel.setAttribute("class", "btn btn-outline-danger");

            cancel.addEventListener("click", async e => {
                e.target.setAttribute("disabled", true);
                try {
                    let res = await fetch(api_url + "/appointment/cancel", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            appointmentDemand: d.id
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
            });
        }

        demands_container.appendChild(booking);
    });
}

export async function main() {

    generateDuration();

    getDemands();

    await generateCoachs();

    document.querySelector("#appointment_btn").addEventListener("click", e => askAppointment());

    autocomplete(document.querySelector("#input_therapist"), coachs.map(c => `${c.User.firstname} ${c.User.lastname} (${c.job})`));

}

