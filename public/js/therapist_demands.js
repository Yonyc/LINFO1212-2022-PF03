async function reloadTherapistList() {
    let list_container = document.querySelector(".demands-list");
    if (!list_container) return;

    let therapist_demands = await fetch(api_url + "/admin/therapist_approvals", {method: "POST"});
    therapist_demands = await therapist_demands.json();

    if (!therapist_demands.success) return;

    console.log(therapist_demands);
}

export function main() {
    reloadTherapistList();
}