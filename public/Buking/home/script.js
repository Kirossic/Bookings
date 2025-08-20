const elemrnts = {
    profile_pic: document.getElementsByClassName("profile-pic"),
    options: document.getElementById("options"),
    cloes: document.getElementById("cloes")
}
elemrnts.profile_pic[0].addEventListener('click', () => {
    elemrnts.options.style.display = "inline";
    elemrnts.profile_pic[0].style.display = "none";
})
elemrnts.cloes.addEventListener('click', () => {
    elemrnts.options.style.display = "none";
    elemrnts.profile_pic[0].style.display = "inline";
})
console.log(elemrnts.profile_pic);