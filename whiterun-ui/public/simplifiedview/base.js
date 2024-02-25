

let selectedMode = "tti"

function addView(currentMode){
    const previousMode = document.getElementById(selectedMode)
    const mode = document.getElementById(currentMode)

    previousMode.style.color = "black"
    mode.style.background = "white"

    mode.style.background = "#53389E"
    mode.style.color = "white"

    selectedMode = currentMode
}

addView("tti")


const modeSection = document.querySelector('.mode-section');

// Add event listener to mode section
modeSection.addEventListener('click', function(event) {
    const conditionOne = event.target.parentElement.className === "mode-button"
    let target = event.target

    if (conditionOne){
        target = event.target.parentElement
    }

    const conditionTwo = event.target.className === "mode-button"
    // Check if the clicked element is a button with the class 'mode-button'
    if (conditionTwo || conditionOne) {
        addView(target.id)
        console.log("here")
    }
});