const times = [9,10,11,12,13,14,15,16,17];
//const times = [9,10,11,12,13,14,15,16,17,18,19,20,21,22]; // TEST-LIST
const fadeStart = 3000;
const fadeNormal = 1500;
// Save Toast Fade Times
const fadeToastIn = 750;
const fadeToastOut = 1500;
// Time Block Updates
const timeBlockDelayMS = 30000;

let updateInterval; // Periodic Update of past,present,future class
let curDate = moment().clone(); // Current Day is initially Today

// JQuery
$(function() {
    // Set the date in the header
    SetCurrentDateLabel();

    // Load Multi-day setting from local storage and update the checked state
    LoadMultiDaySettings();
    
    // Watch for click of Enable Multi-day support
    $("#enableDate").on("click", MultiDayChecked);

    // Initialize the Date Picker and Setup a 'change' event handler
    $("#datepicker").val(moment().format('YYYY-MM-DD'));
    $("#datepicker").on("change", DatePickerChange);

    // Load the day into the view Once at the start with a fade-in
    loadDay(fadeStart);
})

function LoadMultiDaySettings() {
    // Load Multi-day setting from local storage and set the check accordingly
    let enableMultiDay = (localStorage.getItem("enableMultiDay") === "true") ? true : false;
    if (enableMultiDay) {
        // Set the check, Show the DateGroup, trigger Date Change
        $("#enableDate").prop("checked", true);
        $("#dateGroup").show();
        DatePickerChange();
    }
}

// When the Multi-day Checkbox changes state
function MultiDayChecked() {
    // Update Local Storage with new Multi-day setting
    let $ed = $("#enableDate");
    localStorage.setItem("enableMultiDay", $ed.prop("checked"));
    // Show or Hide the Date Selector and reset date as needed
    if($ed.is(":checked")){
        $("#dateGroup").show();
    } else {
        $("#dateGroup").hide();
        // Reset the day to today
        curDate = moment();
        $("#datepicker").val(moment().format('YYYY-MM-DD'));
        loadDay(0);
        SetCurrentDateLabel();
    }
}

// A new date was selected from the Date Picker
function DatePickerChange() {
    // Get the new date - If the date is not valid default to today
    curDate = moment($("#datepicker").val(), "YYYY-MM-DD");
    if (!curDate.isValid()) {
        curDate = moment();
    }

    // Update the header, cancel existing timers, fade in the content
    SetCurrentDateLabel();
    loadDay(fadeNormal);
}
// Set's the current day in the header
function SetCurrentDateLabel() {
    $("#currentDay").text(curDate.format('dddd, MMMM Do'));
}

// Load the current day onto the page
function loadDay(fadeTime=0) {
    clearInterval(updateInterval);

    $(".container").html(""); // Clear out old data
    // Create and Load Time Blocks
    for(let index=0; index<times.length; index++) {
        $(".container").append(createTimeBlock(times[index]));
    }

    // Setup Save Button Events
    $(".saveBtn").on("click", function() {
        var $desc = $(this).siblings(".description");
        let hour = $desc.attr("data-hour");
        let text = $desc.val();
        localStorage.setItem(getStoreDatePrefix() + hour.trim(), text.trim());
        $("#save-toast").fadeIn(fadeToastIn).fadeOut(fadeToastOut);
    });

    // Setup Interval to Update past, present, future classes periodically (30s)
    updateInterval = setInterval(checkTimeBlocks, timeBlockDelayMS);

    //****************************************
    // STYLING
    //****************************************
    // Change opacity of description on hover
    $('.description').hover( function() {
        $(this).toggleClass("active");
    });
    // Hover over save button changes opacity and makes disk larger
    $('.saveBtn').hover( function() {
        $(this).toggleClass("active");
    });

    $(".container").hide().fadeIn(fadeTime);
}

// Check the timeblocks to see if their tense has changed
// Go through each hour and compare 
function checkTimeBlocks() {
    console.log("Check Time Blocks Active");
    let $descriptions = $('.description');
    $descriptions.each(function(index) {
        let hour12 = $(this).attr("data-hour"); // Get the hour
        let t = getMoment12H(hour12);
        let tense = getTense(t);
        if ($(this).hasClass(tense)) {
            //console.log("/NO CHANGE");
        } else if (tense === "present") {
            $(this).removeClass("past future");
        } else if (tense === "past") {
            $(this).removeClass("present future");
        } else if (tense === "future") {
            $(this).removeClass("past present");
        } else {
            alert("Unknown Tense");
        }
        $(this).addClass(tense);
    });
 }

// Create a Time Block Group
function createTimeBlock(hour24) {
    let row = createEl("div", "row");
    let timeBlock = createEl("div", "time-block");
    timeBlock.appendChild(row);    
    let colHour = createEl("div", "col-sm-1 col-12 pt-3 hour", hour24);
    row.appendChild(colHour);
    let colText = createEl("textarea", "col-sm-10 col-12 description", hour24);
    row.appendChild(colText);
    let colSave = createEl("div", "col-sm-1 col-12 saveBtn");
    row.appendChild(colSave);
    let icon = createEl("i", "fas fa-save");
    colSave.appendChild(icon);
    
    return timeBlock;
}

// Create a single page element
// tag = tag to create 
// cls = classes to asssign
// hour24 = the current hour (only used by hour and description classes)
function createEl(tag, cls, hour24) {
    let el = document.createElement(tag);
    // Special Handling for Hour and Description Columns which need the hour
    if (hour24) {
        let t = getMoment24H(hour24);
        let displayHour = formatAmPm(t);
        if (cls.includes("description")) {
            // description class
            cls += " " + getTense(t);
            el.textContent = localStorage.getItem(getStoreDatePrefix() + displayHour);
            el.setAttribute("data-hour", displayHour);
        } else {
            // hour class
            el.textContent = displayHour.padEnd(4, " ");
        }
    }
    // Set the classes on the element
    el.setAttribute("class", cls);
    return el;
}

// Check to see if the specified time is in the past present or future compared to time now.
// t = hour moment
// returns appropriate tense class (past, present, or future)
function getTense(t) {
    let cls;
    let n = moment();

    if (n.isSame(t, "hour") && 
        n.isSame(t, "day") && 
        n.isSame(t, "month") && 
        n.isSame(t, "year")) {
        cls = "present";
    } else if (n.isAfter(t)) {
        cls = "past"
    } else {
        cls = "future";
    }
    return cls;
}

//**********************************
// GET STRING
//**********************************
// Get string prefix for localStorage based off curDate
function getStoreDatePrefix() {
    return curDate.format("YYYYMMDD-");
}

// Return the moment formated as a 12-hour AM/PM time string (Example: 10AM)
function formatAmPm(m) { 
    return m.format("hA");
}

//**********************************
// GET MOMENT
//**********************************
// Create a new moment based off curDate and a 12hr AM/PM format time string
function getMoment12H(hour12) { 
    return moment(curDate.format("YYYYMMDD ") + hour12, "YYYYMMDD hA");
}

// Create a new moment based off curDate and a 24hr format time string
function getMoment24H(hour24) { 
    return moment(curDate.format("YYYYMMDD ") + hour24, "YYYYMMDD H");
}
