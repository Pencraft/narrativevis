// Adapted from https://www.w3schools.com/howto/howto_js_vertical_tabs.asp
function openSlide(evt, slideName) {
    // Declare all variables
    var i, tabcontent, tablinks, nextTab;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(slideName).style.display = "block";
    evt.currentTarget.className += " active";

    // Reveal next slide tab in menu
    nextTab = "Tab" + (Number(slideName[5]) + 1);
    document.getElementById(nextTab).style.visibility = "visible";
}

function hideTabs(evt) {
    var i, tabcontent, tablinks;

    // Hide all but the first tab from the menu
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 1; i < tablinks.length; i++) {
        tablinks[i].style.visibility = "hidden";
    }

    // Hide all tab contents at start
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Make page visible
    document.getElementsByTagName("html")[0].style.visibility = "visible";
}