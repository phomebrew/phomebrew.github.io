//The current interval moving the tooltip, only one should be moving the tooltip at a time
var tooltipAnimInterval = null;

/*
    Connects the block contents names with the interval that is currently moving them (it can be null or
    "spotlight", which indicates its the one being highlighed per say) and it relates to the position 
    the tooltip should be
*/
var movingContents = new Map([
    ["homePage", [null, 0]],
    ["worksPage", [null, 1]],
    ["contactPage", [null, 2]]
]);

/*
    Holds the discription of all the works
    The format for the value should be:
    ["Title", "Text", "Link", "LinkImg"]
*/
var discTexts = new Map([
    ["website", ["Personal Portfolio", "A portolio website that I coded using html, css, and javascript.", "https://github.com/phomebrew/phomebrew.github.io", "https://phomebrew.github.io"]]
])

var fadeAnim;
var discState = "out";

var desiredDiscTextOpac = 0.9;
var dersiredDiscBackOpac = 0.5;

var minPage = 0;

var maxPage = 2;

var startPage;

var selectedPage;

// Animating a content to move in on load
window.onload = (event) => {
    startPage = "homePage";
    // Checks if url has a preference on which content block to go to
    var url = window.location.href;
    movingContents.forEach(function(value, key){
        if(url.endsWith("?" + key)){
            startPage = key;
        }
    });
    selectPage(startPage);
};

// Handles moving content in and out of page
function selectPage(toPage){
    var goPage;
    // Checks whether or not the arrows or buttons are being used to change pages
    if(typeof toPage == "boolean"){
        var loc;
        // Decides which page to load with toPage being true means right, false is left
        if(toPage){
            loc = Math.min(movingContents.get(selectedPage)[1] + 1, maxPage);
        }else{
            loc = Math.max(movingContents.get(selectedPage)[1] - 1, minPage);
        }
        // Finds page in map
        movingContents.forEach(function(value, key){
            if(value[1] == loc){
                goPage = key;
            }
        });
        // Checks if page is already in spotlight in order to not run animation again
        if(movingContents.get(goPage)[0] != null){
            return;
        }
    }
    else{
        // Checks if page is already selected in order to not run animation again
        if(selectedPage == toPage){
            return;
        }
        goPage = toPage;
    }
    // Updates Selected Page
    if(document.getElementById(selectedPage + "Btn")){
        document.getElementById(selectedPage + "Btn").classList.remove("selected");
    }
    // Updates Url without reloading
    window.history.pushState("","", "?" + goPage);
    document.getElementById(goPage + "Btn").classList.add("selected");
    // Starts animation
    selectedPage = goPage;
    moveHandler(selectedPage);
}

// Handles the animation for moving the content blocks and tooltip
function moveHandler(id){
    // Variable to determine which direction the new content should come in based off the current spotlight
    let inDirection = -1;
    movingContents.forEach(function(value, key){
        if(key != id && value[0] != null){
            // Checks if this key is the one being spotlit as an indicator for inDirection
            if(value[0] == "spotlight"){
                inDirection = movingContents.get(id)[1] > value[1] ? -1 : 1;
            }
            // Moves all content out of the way
            moveContentOut(key, (movingContents.get(id)[1] > value[1] ? 1 : -1));
        }
    });
    // Runs the animation 
    // Cheks whether or not the content is already being spoltighted or not
    if(movingContents.get(id)[0] != "spotlight"){
        moveContentIn(id, inDirection);
    }
    updateContentBackground(id);
}

// Sets the new height which is then automatically animated
function updateContentBackground(id){
    document.getElementById("contentBackground").style.height = "calc(" + window.getComputedStyle(document.getElementById(id)).getPropertyValue('height') + " + 5em)";   
}

// Moves content to be spotlight
function moveContentIn(id, direction = 1){
    clearInterval(movingContents.get(id)[0]);
    const contentSection = document.getElementById(id);
    // Presets the direction it should be coming from
    contentSection.style.left = (direction * 200) + "%";
    // Gets width of screen
    const mediaWidth = parseInt(document.getElementById("contentBackground").clientWidth);
    // Finds the start location that was previously set in terms of pixels
    const startDest = direction * 2 * mediaWidth;
    const startTime = Date.now();
    const animDur = 1000;
    contentSection.style.display = "block";
    movingContents.set(id, [setInterval(moveText, 5), movingContents.get(id)[1]]);
    function moveText(){
        // Checks if the animation timer is finished, if so clip the content block
        if((Date.now() - startTime)/animDur >= 1){
            contentSection.style.left = 0;
            clearInterval(movingContents.get(id)[0]);
            // Updates to show that this content is now the spotlight
            movingContents.set(id, ["spotlight", movingContents.get(id)[1]]);
        }else{
            // Equation to find where the content should be and sets it to it, based off the equation (x-1)^3+1
            contentSection.style.left = (startDest - (startDest * (((((Date.now() - startTime) / animDur) - 1) ** 3) + 1)))/16 + "em";
        }
    }
}

// Moves the content block outside of the screen
function moveContentOut(id, direction){
    clearInterval(movingContents.get(id)[0]);
    // Gets the content
    const contentSection = document.getElementById(id);
    // Gets width of screen
    const mediaWidth = parseInt(document.getElementById("contentBackground").clientWidth);
    const startDest = parseInt(window.getComputedStyle(contentSection).left);
    const endDest = direction * 2 * mediaWidth;
    const distance = Math.abs(startDest - endDest);
    const startTime = Date.now();
    const animDur = 1000;
    movingContents.set(id, [setInterval(moveText, 5), movingContents.get(id)[1]]);
    function moveText(){
        // Checks if the animation timer is finished, if so clip the content block
        if((Date.now() - startTime)/animDur >= 1){
            contentSection.style.display = "none";
            contentSection.style.left = (direction * 200) + "%";
            clearInterval(movingContents.get(id)[0]);
            movingContents.set(id, [null, movingContents.get(id)[1]]);
        }else{
            // Equation to find where the content should be and sets it to it, based off the equation (x-1)^3+1
            contentSection.style.left = (startDest + direction * (distance * (((((Date.now() - startTime) / animDur) - 1) ** 3) + 1)))/16 + "em";
        }
    }
}

// Brings up the disc overlay and set up it's contents 
// The name parameter is the name of the work that whose text will be brought up
function setupDiscOverlay(name){
    //When no text is found, do not display the overlay
    if(!discTexts.has(name)){
        return; 
    }
    var texts;
    texts = discTexts.get(name);
    // Sets up the text
    document.getElementById("discOverlay").style.display = "block";
    document.getElementById("discTitle").textContent = texts[0];
    document.getElementById("discText").textContent = texts[1];
    if(name[2] == null){
        document.getElementById("discCodeLink").style.display = "none";
    }else{
        document.getElementById("discCodeLink").style.display = "inline-block";
        document.getElementById("discCodeLink").href = texts[2];
    }
    if(name[3] == null){
        document.getElementById("discAppLink").style.display = "none";
    }else{
        document.getElementById("discAppLink").style.display = "inline-block";
        document.getElementById("discAppLink").href = texts[3];
    }
    // Runs animation
    fadeDiscOverlay(true);
}

// Fades in the discOverlay
function fadeDiscOverlay(isFadingIn){
    // Prevents the out animation from occuring twice
    if(!isFadingIn && discState == "out")
        return;
    clearInterval(fadeAnim);
    var overlayBack = document.getElementById("discBackground");
    var overlayDisc = document.getElementById("discContents");
    const startTime = Date.now();
    const animDur = 1000;
    if(isFadingIn){
        discState = "in";
        fadeAnim = setInterval(fadeIn, 5)
    }
    else{
        discState = "out";
        fadeAnim = setInterval(fadeOut, 5)
    }
    function fadeIn(){
        // Checks if the animation timer is finished
        if((Date.now() - startTime)/animDur >= 1){
            overlayBack.style.opacity = dersiredDiscBackOpac;
            overlayDisc.style.opacity = desiredDiscTextOpac;
            clearInterval(fadeAnim)
            fadeAnim = null;
        }else{
            // Equation to find where the content should be, based off the equation (x-1)^3+1
            overlayBack.style.opacity = dersiredDiscBackOpac * (((((Date.now() - startTime) / animDur) - 1) ** 3) + 1);
            overlayDisc.style.opacity = desiredDiscTextOpac * (((((Date.now() - startTime) / animDur) - 1) ** 3) + 1);
        }
    }
    function fadeOut(){
        // Checks if the animation timer is finished
        if((Date.now() - startTime)/animDur >= 1){
            overlayBack.style.opacity = 0;
            overlayDisc.style.opacity = 0;
            document.getElementById("discOverlay").style.display = "none";
            clearInterval(fadeAnim)
            fadeAnim = null;
        }else{
            // Equation to find where the content should be, based off the equation -(x-1)^3
            overlayBack.style.opacity = dersiredDiscBackOpac * -1 * ((((Date.now() - startTime) / animDur) - 1) ** 3);
            overlayDisc.style.opacity = desiredDiscTextOpac * -1 * ((((Date.now() - startTime) / animDur) - 1) ** 3);
        }
    }
}

// Listener for input
window.addEventListener("keyup", (event) =>{
    //Checks if event has already been listened to
    if(event.defaultPrevented){
        return;
    }
    /*
        Remove the disc overlay when esc is pressed
        Left and Right arrow keys control content direction
    */
    if(event.key == "Escape" && discState == "in"){
        fadeDiscOverlay(false);
    }else if(event.key == "ArrowLeft"){
        selectPage(false);
    }else if(event.key == "ArrowRight"){
        selectPage(true);
    }
});