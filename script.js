// Elements
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const phoneField = document.getElementById('phone');
const profileField = document.getElementById('profile');

const previewName = document.getElementById('previewName');
const previewContact = document.getElementById('previewContact');
const previewProfile = document.getElementById('previewProfile');

const educationContainer = document.getElementById('educationContainer');
const educationList = document.getElementById('educationList');
const addEducationBtn = document.getElementById('addEducation');

const skillsCheckboxes = document.querySelectorAll('.skill');
const experienceContainer = document.getElementById('experienceContainer');
const experienceList = document.getElementById('experienceList');
const addExperienceBtn = document.getElementById('addExperience');

const previewSection = document.getElementById('resumePreview');
const resetBtn = document.getElementById('reset');

// Function to update the resume preview
function updatePreview() {
  // Personal info
  previewName.textContent = nameField.value || 'Your Name';
  previewContact.textContent = `${emailField.value || 'Email'} | ${phoneField.value || 'Phone'}`;
  previewProfile.textContent = profileField.value || 'Profile summary will appear here...';

  // Education
  educationList.innerHTML = '';
  Array.from(educationContainer.querySelectorAll('.education-row')).forEach(row => {
    const degree = row.querySelector('.edu-degree').value.trim();
    const institution = row.querySelector('.edu-institution').value.trim();
    const year = row.querySelector('.edu-year').value.trim();
    if (degree || institution || year) {
      const li = document.createElement('li');
      li.textContent = `${degree} at ${institution} (${year})`;
      educationList.appendChild(li);
    }
  });

  // Skills
  const selectedSkills = Array.from(skillsCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  skillsList.innerHTML = '';
  selectedSkills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    skillsList.appendChild(li);
  });

  // Experience
  experienceList.innerHTML = '';
  Array.from(experienceContainer.querySelectorAll('.experience-row')).forEach(row => {
    const title = row.querySelector('.exp-title').value.trim();
    const company = row.querySelector('.exp-company').value.trim();
    const year = row.querySelector('.exp-year').value.trim();
    if (title || company || year) {
      const li = document.createElement('li');
      li.textContent = `${title} at ${company} (${year})`;
      experienceList.appendChild(li);
    }
  });

  // Animate the preview appearing
  if (!previewSection.classList.contains('show')) {
    previewSection.classList.add('show');
  }
}

// Event listeners for form inputs
nameField.addEventListener('input', updatePreview);
emailField.addEventListener('input', updatePreview);
phoneField.addEventListener('input', updatePreview);
profileField.addEventListener('input', updatePreview);
skillsCheckboxes.forEach(cb => cb.addEventListener('change', updatePreview));

// Add Education Row
let eduCount = 1;
document.getElementById('addEducation').addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'education-row';
  div.setAttribute('data-index', eduCount);
  div.innerHTML = `
    <input type="text" placeholder="Degree" class="edu-degree" />
    <input type="text" placeholder="Institution" class="edu-institution" />
    <input type="text" placeholder="Year" class="edu-year" />
  `;
  educationContainer.appendChild(div);
  eduCount++;
  // Attach input listeners
  div.querySelectorAll('input').forEach(input => input.addEventListener('input', updatePreview));
});

// Add Experience Row
let expCount = 1;
document.getElementById('addExperience').addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'experience-row';
  div.setAttribute('data-index', expCount);
  div.innerHTML = `
    <input type="text" placeholder="Job Title" class="exp-title" />
    <input type="text" placeholder="Company" class="exp-company" />
    <input type="text" placeholder="Year" class="exp-year" />
  `;
  experienceContainer.appendChild(div);
  expCount++;
  div.querySelectorAll('input').forEach(input => input.addEventListener('input', updatePreview));
});

// Reset button
document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('resumeForm').reset();
  educationContainer.innerHTML = `
    <div class="education-row" data-index="0">
      <input type="text" placeholder="Degree" class="edu-degree" />
      <input type="text" placeholder="Institution" class="edu-institution" />
      <input type="text" placeholder="Year" class="edu-year" />
    </div>`;
  experienceContainer.innerHTML = `
    <div class="experience-row" data-index="0">
      <input type="text" placeholder="Job Title" class="exp-title" />
      <input type="text" placeholder="Company" class="exp-company" />
      <input type="text" placeholder="Year" class="exp-year" />
    </div>`;
  // Reset counts
  eduCount = 1;
  expCount = 1;
  // Clear preview
  previewName.textContent = 'Your Name';
  document.getElementById('previewContact').textContent = 'Email | Phone';
  previewProfile.textContent = 'Profile summary will appear here...';
  document.getElementById('educationList').innerHTML = '';
  document.getElementById('skillsList').innerHTML = '';
  document.getElementById('experienceList').innerHTML = '';
  // Remove appearance animation
  previewSection.classList.remove('show');
});
