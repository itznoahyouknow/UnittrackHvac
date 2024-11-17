document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.getElementById('job-form');
    const jobListTable = document.querySelector('#job-list tbody');
    const completedJobsKey = 'completedJobs';
    const currentJobsKey = 'currentJobs';
    const lastAccessedDateKey = 'lastAccessedDate';
  
    // Load jobs from local storage
    loadJobs();
  
    // Check if a new day has started
    checkNewDay();
  
    jobForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const unitNumber = document.getElementById('unit-number').value;
      const taskDetails = document.getElementById('task-details').value;
      const timestamp = new Date().toLocaleString();
  
      addJobToTable(unitNumber, taskDetails, timestamp);
      saveJob(unitNumber, taskDetails, timestamp);
  
      jobForm.reset();
    });
  
    function addJobToTable(unitNumber, taskDetails, timestamp) {
      const newRow = document.createElement('tr');
  
      const unitCell = document.createElement('td');
      unitCell.textContent = unitNumber;
      newRow.appendChild(unitCell);
  
      const taskCell = document.createElement('td');
      taskCell.textContent = taskDetails;
      newRow.appendChild(taskCell);
  
      const timestampCell = document.createElement('td');
      timestampCell.textContent = timestamp;
      newRow.appendChild(timestampCell);
  
      jobListTable.appendChild(newRow);
    }
  
    function saveJob(unitNumber, taskDetails, timestamp) {
      const jobs = JSON.parse(localStorage.getItem(currentJobsKey)) || [];
      jobs.push({ unitNumber, taskDetails, timestamp });
      localStorage.setItem(currentJobsKey, JSON.stringify(jobs));
    }
  
    function loadJobs() {
      const jobs = JSON.parse(localStorage.getItem(currentJobsKey)) || [];
      jobs.forEach(job => {
        addJobToTable(job.unitNumber, job.taskDetails, job.timestamp);
      });
    }
  
    function checkNewDay() {
      const lastAccessedDate = localStorage.getItem(lastAccessedDateKey);
      const today = new Date().toLocaleDateString();
  
      if (lastAccessedDate !== today) {
        moveCurrentJobsToCompleted();
        localStorage.setItem(lastAccessedDateKey, today);
      }
    }
  
    function moveCurrentJobsToCompleted() {
      const currentJobs = JSON.parse(localStorage.getItem(currentJobsKey)) || [];
      const completedJobs = JSON.parse(localStorage.getItem(completedJobsKey)) || [];
      
      currentJobs.forEach(job => {
        completedJobs.push(job);
      });
  
      localStorage.setItem(completedJobsKey, JSON.stringify(completedJobs));
      localStorage.removeItem(currentJobsKey);
      jobListTable.innerHTML = '';
    }
  });
  
//menu.js
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const body = document.body;

  menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('show');
      body.classList.toggle('menu-open');
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.classList.add('close-menu');
  closeButton.addEventListener('click', function() {
      navLinks.classList.remove('show');
      body.classList.remove('menu-open');
  });

  navLinks.insertBefore(closeButton, navLinks.firstChild);
});
