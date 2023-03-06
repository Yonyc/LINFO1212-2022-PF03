export async function main() {
    let elem = document.querySelector("#therapist_presentation");
    if (!elem) return;

    try {
        let loc = window.location.pathname.split("/");
        let i = loc.findIndex(e => e == "therapist");
        let therapistID = loc[i + 1];

        let res = await fetch(api_url + "/therapist/infos", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                therapistID: therapistID
            })
        });

        if (res.status != 200) return false;

        res = await res.json();

        if (!res.success) {
            elem.innerHTML = res.data.message;
            return false;
        };

        let therapist = res.data.therapist;
        if (!therapist) return false;

        console.log(therapist);

        elem.innerHTML = `<div class="container rounded bg-white mt-5 mb-5">
            <div class="row">
                <div class="col-md-3 border-right">
                    <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5"
                            width="150px" src="/${therapist.User.url_pp}">
                        <span class="font-weight-bold">${therapist.User.firstname} ${therapist.User.lastname}</span>
                        <span class="text-black-50">${therapist.job}</span>
                    </div>
                </div>
                <div class="col-md border-right">
                    <div class="p-3 py-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="text-right">Qui suis-je ?</h4>
                        </div>
                        <div class="row">${therapist.whoami}</div>
                        <div class="d-flex justify-content-between align-items-center my-3">
                            <h4 class="text-right">Que fais-je ?</h4>
                        </div>
                        <div class="row">${therapist.whatido}</div>
                        <div class="d-flex justify-content-between align-items-center my-3">
                            <h4 class="text-right">Infos pratiques</h4>
                        </div>
                        <div class="row">${therapist.infos}</div>
                    </div>
                </div>
            </div>
        </div>`;

    } catch (error) { }
}