//const times = [9,10,11,12,13,14,15,16,17];
const times = [9,10,11,12,13,14,15,16,17,18,19,20,21,22]; // TEST-LIST

$(function() {
    // Set the date in the header
    $("#currentDay").text(moment().format('dddd, MMMM Do'));

    // Creat Time Blocks
    for(let index=0; index<times.length; index++) {
        $(".container").append(createTimeBlock(times[index]));
    }

    $(".saveBtn").on("click", function() {
        var $colHour = $(this).siblings(".hour");
        let hr = $colHour.text();
        let txt = $(this).siblings(".description").val();
        console.log(hr, txt);
        localStorage.setItem(moment().format("YYYYMMDD-") + hr.trim(), txt.trim());
        $("#save-toast").fadeIn(1000).fadeOut(1000);
    });
})

function createTimeBlock(hour) {
    let timeBlock = createEl("div", "time-block");
    let row = createEl("div", "row");
    let colHour = createEl("div", "col-sm-1 pt-3 hour", hour);
    let colText = createEl("textarea", "col-sm-10 description", hour);
    let colSave = createEl("div", "col-sm-1 saveBtn");
    let icon = createEl("i", "fas fa-save");
    colSave.appendChild(icon);
    row.appendChild(colHour);
    row.appendChild(colText);
    row.appendChild(colSave);
    timeBlock.appendChild(row);
    return timeBlock;
}

function createEl(tag, cls, hour) {
    let el = document.createElement(tag);
    el.setAttribute("class", cls);
    // Special Handling for Hour and Text Columns
    if (el, hour) {
        let t = getTimeMoment(hour);
        let n = getNow();
        if (tag === "textarea") {
            cls += " " + getTense(n, t);
            el.textContent = localStorage.getItem(n.format("YYYYMMDD-") + formatMoment(t));
        } else {
            el.textContent = formatMoment(t).padEnd(4, " ");
        }
    }
    el.setAttribute("class", cls);
    return el;
}

// n = Moment now
// t = time-block Moment
// returns appropriate tense class (past, present, or future)
function getTense(n, t) {
    let cls;
    if (n.isSame(t, "hour")) {
        cls = "present";
    } else if (n.isAfter(t)) {
        cls = "past"
    } else {
        cls = "future";
    }
    return cls;
}

function getTimeMoment(hour) {
    return moment(hour, "H");
}

function getNow() {
    return moment()
}

function formatMoment(m) {
    return m.format("hA");
}

function isToday(date) {
    return (moment.format("YYYYMMDD") == date);
}
