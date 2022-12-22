export function main(){

    document.querySelector(".firstname").innerText=user.firstname;
    document.querySelector(".lastname").innerText=user.lastname;

    document.querySelectorAll(`.profile_picture`).forEach(e => {
        if (user?.url_pp)
            e.src = user.url_pp;
    });

}

export function updateTextInput(val) {
    document.getElementById('textInput').value=val; 
}