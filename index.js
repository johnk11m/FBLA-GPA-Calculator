document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();

    setupEventListeners();
  
    var introModal = M.Modal.init(document.getElementById('introModal'));
    introModal.open();

    document.querySelector(".intModal").addEventListener("click", function(){
        introModal.open();
    });
    document.getElementById("introContinueBtn").addEventListener("click",function(){
        introModal.close();
    });
    loadSavedData();
});

const maxCourses = 15;
let unweightedCourses = 0;
let weightedCourses = 0;
//--Helps buttons work.--//
function setupEventListeners(){
    document.getElementById("calculateUnweighted").addEventListener("click", calculateTotalGPA);
    document.getElementById("calculateWeighted").addEventListener("click", calculateTotalWeightedGPA);
    document.querySelector(".add-Course").addEventListener("click", addCourseInputFields);
    document.querySelector(".resetNav").addEventListener("click", resetGPAForm);
    document.querySelector(".saveData").addEventListener("click", function(event){
        event.preventDefault();
        saveData();
    });
}
//Loads data//
function loadSavedData() {
    // Load saved data from local storage
    const savedData = JSON.parse(localStorage.getItem('gpaCalculatorData'));
    if (savedData && savedData.courses) { // Check if savedData and savedData.courses exist
        // Populate the input fields with saved data
        savedData.courses.forEach(course => {
            addCourseInputFields(course.courseName, course.credits, course.grade, course.tab);
        });
        // Calculate GPA again with loaded data
        calculateTotalGPA();
        calculateTotalWeightedGPA();
    }
}
//Saves data//
function saveData() {
    const courses = [];
    const courseContainers = document.querySelectorAll('.row');
    courseContainers.forEach(courseContainer => {
        const courseNameInput = courseContainer.querySelector('.course-name-input');
        if (courseNameInput) {
            const credits = courseContainer.querySelector('.credits-select').value;
            const grade = courseContainer.querySelector('.grade-select').value;
            const tab = courseContainer.parentNode.id;
            const courseName = courseNameInput.value;
            courses.push({ courseName, credits, grade, tab });
        }
        M.toast({ html: "Data Stored!", classes: 'green'});
    });

    // Save data to local storage
    localStorage.setItem('gpaCalculatorData', JSON.stringify({ courses }));
}

function resetGPAForm(event) {
    event.preventDefault();

    var courseContainers = document.querySelectorAll('.row');

    if (courseContainers.length === 0) {
        M.toast({ html: "Nothing to reset. Please add courses first.", classes: 'red' });
        return;
    }

    // Display confirmation modal or alert for reset
    var resetConfirmation = confirm("Are you sure you want to reset the added courses and saved data?");

    if (resetConfirmation) {
        // Perform the reset action for added courses only
        resetAddedCourses();
        document.getElementById("totalGPA").textContent="-";
        document.getElementById("totalWeightedGPA").textContent="-";
        localStorage.removeItem('gpaCalculatorData'); // Clear saved data
        M.toast({html: "Added courses and saved data reset.", classes: 'green'});
    }else{
        M.toast({ html: "Reset canceled.", classes: 'orange' });
    }
}

function resetAddedCourses() {
    var courseContainer = document.getElementById("courseContainer");
    courseContainer.querySelectorAll('.row').forEach(function (courseDiv) {
        courseDiv.remove();
    });

    unweightedCourses = 0;
    weightedCourses = 0;
}
 
function addCourseInputFields(courseName= "", credits= "", grade = "",) {
    var courseContainer = document.getElementById("courseContainer");
    
    var newCourseDiv = document.createElement("div");
    newCourseDiv.classList.add("row");
    newCourseDiv.innerHTML = `
        <span class="add-course"></span>
        <div class="col s6">
            <div class="card-panel indigo darken-1">
                <input class="white-text course-name-input" type="text" value="${courseName}" placeholder="Course Name">
            </div>
        </div>
        <div class="col s2">
            <div class="card-panel indigo darken-2">
                <div class="input-field">
                    <select class="white-text credits-select">
                        <option value="" disabled ${credits === "" ? 'selected' : ''}>Choose Credits</option>
                        <option value="0.5" class="white-text" ${credits === "0.5" ? 'selected' : ''}>0.5</option>
                        <option value="1" class="white-text" ${credits === "1" ? 'selected' : ''}>1</option>
                    </select>
                    <label class="white-text">Credits</label>
                </div>
            </div>
        </div>
        <div class="col s4">
            <div class="card-panel indigo darken-3">
                <div class="input-field">
                    <select class="white-text grade-select">
                        <option value="" disabled ${grade === "" ? 'selected' : ''}>Choose Your Grade</option>
                        <option value="A" ${grade === "A" ? 'selected' : ''}>A</option>
                        <option value="A-" ${grade === "A-" ? 'selected' : ''}>A-</option>
                        <option value="B+" ${grade === "B+" ? 'selected' : ''}>B+</option>
                        <option value="B" ${grade === "B" ? 'selected' : ''}>B</option>
                        <option value="B-" ${grade === "B-" ? 'selected' : ''}>B-</option>
                        <option value="C+" ${grade === "C+" ? 'selected' : ''}>C+</option>
                        <option value="C" ${grade === "C" ? 'selected' : ''}>C</option>
                        <option value="C-" ${grade === "C-" ? 'selected' : ''}>C-</option>
                        <option value="D+" ${grade === "D+" ? 'selected' : ''}>D+</option>
                        <option value="D" ${grade === "D" ? 'selected' : ''}>D</option>
                        <option value="D-" ${grade === "D-" ? 'selected' : ''}>D-</option>
                        <option value="F" ${grade === "F" ? 'selected' : ''}>F</option>
                    </select>
                    <label class="white-text">Choose Your Grade</label>
                </div>
            </div>
        </div>
    `;

    var activeTab = getActiveTab();

    if (activeTab === 'unweightedTab') {
        if (unweightedCourses >= maxCourses) {
            M.toast({ html: 'You can only add up to 15 courses in Unweighted GPA.', classes: 'red' });
            return;
        }
        courseContainer.querySelector(`#${activeTab}`).appendChild(newCourseDiv);
        unweightedCourses++;
    } else if (activeTab === 'weightedTab') {
        if (weightedCourses >= maxCourses) {
            M.toast({ html: 'You can only add up to 15 courses in Weighted GPA.', classes: 'red' });
            return;
        }
        courseContainer.querySelector(`#${activeTab}`).appendChild(newCourseDiv);
        weightedCourses++;
    }
    var newCreditsSelect = newCourseDiv.querySelector('.credits-select');
    M.FormSelect.init(newCreditsSelect);
    var newGradeSelect = newCourseDiv.querySelector('.grade-select');
    M.FormSelect.init(newGradeSelect);


    newCreditsSelect.addEventListener('change', function(){
        var newGradeSelect= newCourseDiv.querySelector('.grade-select');
        newGradeSelect.addEventListener('change',getActiveTab==='unweightedTab'? calculateTotalGPA:calculateTotalWeightedGPA);
    })

    var toastContent = document.createElement("div");
    toastContent.innerHTML = `<span>Course added successfully!</span><button class='btn-flat toast-action' onclick='undoAddCourse("${activeTab}")'>Undo</button>`;
    M.toast({ html: toastContent, classes: 'green', displayLength: 3000 });
}

function undoAddCourse(tab) {
    if (tab === 'unweightedTab') {
        unweightedCourses--;
    } else if (tab === 'weightedTab') {
        weightedCourses--;
    }

    var courseContainers = document.querySelectorAll(`#${tab} .row`);
    if (courseContainers.length > 0) {
        courseContainers[courseContainers.length - 1].remove();
    }

    M.toast({ html: 'Course removed.', classes: 'orange' });
}

function getActiveTab() {
    var tabs = document.querySelectorAll('.tabs');
    var activeTab;

    tabs.forEach(function (tab) {
        if (tab.querySelector('li.tab a.active')) {
            activeTab = tab.querySelector('li.tab a.active').getAttribute('href').substring(1);
        }
    });

    return activeTab;
}

function calculateTotalGPA() {
    var courseContainers = document.querySelectorAll('#unweightedTab .row');

    var totalGradePoints = 0;
    var totalCredits = 0;

    courseContainers.forEach(function (courseContainer) {
        var creditsSelect = courseContainer.querySelector('.credits-select');
        var selectedGradeSelect = courseContainer.querySelector('.grade-select');
        
        var credits = parseFloat(creditsSelect.value);
        var selectedGrade = selectedGradeSelect.value;

        var gradePoints = calculateUnweightedGradePoints(selectedGrade);
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
    }); 

    var totalGPAValue = (totalGradePoints / totalCredits).toFixed(2);
  document.getElementById("totalGPA").textContent=isNaN(totalGPAValue)?'-':totalGPAValue;
  document.getElementById("totalGPA").classList.remove('hidden');
}

function calculateTotalWeightedGPA() {
    var courseContainers = document.querySelectorAll('#weightedTab .row');
    var totalGradePoints = 0;
    var totalCredits = 0;

    courseContainers.forEach(function (courseContainer) {
        var creditsSelect = courseContainer.querySelector('.credits-select');
        var selectedGradeSelect = courseContainer.querySelector('.grade-select');

        var credits = parseFloat(creditsSelect.value);
        var selectedGrade = selectedGradeSelect.value;

        var gradePoints = calculateWeightedGradePoints(selectedGrade);
        totalGradePoints += gradePoints * credits;
        totalCredits += credits;
    });

    var totalWeightedGPAValue = (totalGradePoints / totalCredits).toFixed(2);
    document.getElementById("totalWeightedGPA").textContent=isNaN(totalWeightedGPAValue)?'-':totalWeightedGPAValue;
    document.getElementById("totalWeightedGPA").classList.remove('hidden');
}
//-------Unweighted Grading Standards---------//
function calculateUnweightedGradePoints(grade) {
    switch (grade) {
        case 'A':
            return 4.0;
        case 'A-':
            return 3.67;
        case 'B+':
            return 3.33;
        case 'B':
            return 3.0;
        case 'B-':
            return 2.67;
        case 'C+':
            return 2.33;
        case 'C':
            return 2.0;
        case 'C-':
            return 1.67
        case 'D+':
            return 1.33;
        case 'D-':
            return 0.67;
        case 'F':
            return 0.0;
        default:
            return 0.0;
    }
}
//-----Weighted Grading Standards------//
function calculateWeightedGradePoints(grade) {
    switch (grade) {
        case 'A':
            return 5.0;
        case 'A-':
            return 4.67;
        case 'B+':
            return 4.33;
        case 'B':
            return 4.0;
        case 'B-':
            return 3.67;
        case 'C+':
            return 3.33;
        case 'C':
            return 3.0;
        case 'C-':
            return 2.67
        case 'D+':
            return 2.33;
        case 'D':
            return 2.0;
        case 'D-':
            return 1.67;
        case 'F':
            return 0.0;
        default:
            return 0.0;
    }
}