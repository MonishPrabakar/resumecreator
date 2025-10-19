// script.js - interactive behaviors for the Resume Builder

document.addEventListener('DOMContentLoaded', () => {
  // Elements: form inputs
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const summaryInput = document.getElementById('summary');

  // Dynamic lists
  const educationList = document.getElementById('education-list');
  const experienceList = document.getElementById('experience-list');
  const addEducationBtn = document.getElementById('add-education');
  const addExperienceBtn = document.getElementById('add-experience');

  // Templates
  const eduTemplate = document.getElementById('education-template');
  const expTemplate = document.getElementById('experience-template');

  // Skills
  const skillInput = document.getElementById('skill-input');
  const skillTags = document.getElementById('skill-tags');
  const skillsPresets = document.getElementById('skills-presets');

  // Preview elements
  const previewName = document.getElementById('preview-name');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewSummary = document.getElementById('preview-summary');
  const previewEducationList = document.getElementById('preview-education-list');
  const previewExperienceList = document.getElementById('preview-experience-list');
  const previewSkills = document.getElementById('preview-skills');

  // Controls
  const clearBtn = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');
  const progressBar = document.getElementById('progress-bar');
  const form = document.getElementById('resume-form');

  // State
  const customSkills = new Set();

  // Utility: sanitize a string for text nodes (basic)
  function textNodeSafe(text){
    return text == null || text === '' ? '' : String(text);
  }

  // Initialize with one education and one experience row
  addEducationRow();
  addExperienceRow();

  // Event listeners for primary fields
  nameInput.addEventListener('input', () => {
    previewName.textContent = textNodeSafe(nameInput.value) || 'Your Name';
    updateProgress();
    animatePreviewSection(previewName);
  });
  emailInput.addEventListener('input', () => {
    previewEmail.textContent = textNodeSafe(emailInput.value) || 'email@example.com';
    updateProgress();
  });
  phoneInput.addEventListener('input', () => {
    previewPhone.textContent = textNodeSafe(phoneInput.value) || '+1 555 555 5555';
    updateProgress();
  });
  summaryInput.addEventListener('input', () => {
    previewSummary.textContent = textNodeSafe(summaryInput.value) || 'A short summary will appear here as you type.';
    animatePreviewSection(previewSummary);
    updateProgress();
  });

  // Skills: preset checkboxes
  skillsPresets.addEventListener('change', () => {
    syncPresetSkills();
    updatePreviewSkills();
    updateProgress();
  });

  // Skill tag input (press Enter to create a tag)
  skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.value.trim();
      if (val) {
        addSkillTag(val);
      }
      skillInput.value = '';
    }
  });

  // Add education or experience
  addEducationBtn.addEventListener('click', () => {
    addEducationRow().querySelector('.edu-school')?.focus();
  });
  addExperienceBtn.addEventListener('click', () => {
    addExperienceRow().querySelector('.exp-company')?.focus();
  });

  // Clear form
  clearBtn.addEventListener('click', () => {
    form.reset();
    // clear dynamic lists
    educationList.innerHTML = '';
    experienceList.innerHTML = '';
    skillTags.innerHTML = '';
    customSkills.clear();
    // re-add empty rows
    addEducationRow();
    addExperienceRow();
    // reset preview
    previewName.textContent = 'Your Name';
    previewEmail.textContent = 'email@example.com';
    previewPhone.textContent = '+1 555 555 5555';
    previewSummary.textContent = 'A short summary will appear here as you type.';
    previewEducationList.innerHTML = '';
    previewExperienceList.innerHTML = '';
    previewSkills.innerHTML = '';
    // reset preset checkboxes
    Array.from(skillsPresets.querySelectorAll('input[type="checkbox"]')).forEach(cb => cb.checked = false);
    updateProgress();
  });

  // Download PDF
  downloadBtn.addEventListener('click', () => {
    // Use html2pdf to export the preview element. Provide some options for a nicer print.
    const element = document.getElementById('resume-preview');
    const opt = {
      margin:       [10,10,10,10],
      filename:     `${(nameInput.value || 'resume').replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // Add small print-styles fix by temporarily adding a class
    element.classList.add('print-ready');
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('print-ready');
    }).catch(err => {
      console.error('PDF generation failed', err);
      element.classList.remove('print-ready');
      alert('Failed to generate PDF. Try a different browser or check console for details.');
    });
  });

  // ---- Functions for dynamic rows ----
  function addEducationRow(){
    const node = eduTemplate.content.firstElementChild.cloneNode(true);
    educationList.appendChild(node);
    // Attach listeners
    const last = educationList.lastElementChild;
    const school = last.querySelector('.edu-school');
    const degree = last.querySelector('.edu-degree');
    const year = last.querySelector('.edu-year');
    const remove = last.querySelector('.remove-row');

    function sync(){
      renderEducationPreview();
      updateProgress();
      animatePreviewSection(previewEducationList);
    }
    [school, degree, year].forEach(el => el.addEventListener('input', sync));
    remove.addEventListener('click', () => {
      last.remove();
      renderEducationPreview();
      updateProgress();
    });
    return last;
  }

  function addExperienceRow(){
    const node = expTemplate.content.firstElementChild.cloneNode(true);
    experienceList.appendChild(node);
    const last = experienceList.lastElementChild;
    const company = last.querySelector('.exp-company');
    const role = last.querySelector('.exp-role');
    const period = last.querySelector('.exp-period');
    const desc = last.querySelector('.exp-desc');
    const remove = last.querySelector('.remove-row');

    function sync(){
      renderExperiencePreview();
      updateProgress();
      animatePreviewSection(previewExperienceList);
    }
    [company, role, period, desc].forEach(el => el.addEventListener('input', sync));
    remove.addEventListener('click', () => {
      last.remove();
      renderExperiencePreview();
      updateProgress();
    });
    return last;
  }

  // ---- Render functions for preview ----
  function renderEducationPreview(){
    previewEducationList.innerHTML = '';
    const rows = Array.from(educationList.querySelectorAll('.edu-row'));
    rows.forEach(r => {
      const school = r.querySelector('.edu-school').value.trim();
      const degree = r.querySelector('.edu-degree').value.trim();
      const year = r.querySelector('.edu-year').value.trim();

      if (!school && !degree && !year) return; // skip empties

      const wrapper = document.createElement('div');
      wrapper.className = 'preview-edu';
      const title = document.createElement('div');
      title.style.fontWeight = '700';
      title.textContent = school || degree || 'Education';
      const meta = document.createElement('div');
      meta.style.color = 'var(--muted)';
      meta.style.fontSize = '0.9rem';
      meta.textContent = `${degree || ''}${degree && year ? ' • ' : ''}${year || ''}`;
      wrapper.appendChild(title);
      wrapper.appendChild(meta);
      previewEducationList.appendChild(wrapper);
    });
  }

  function renderExperiencePreview(){
    previewExperienceList.innerHTML = '';
    const rows = Array.from(experienceList.querySelectorAll('.exp-row'));
    rows.forEach(r => {
      const company = r.querySelector('.exp-company').value.trim();
      const role = r.querySelector('.exp-role').value.trim();
      const period = r.querySelector('.exp-period').value.trim();
      const desc = r.querySelector('.exp-desc').value.trim();

      if (!company && !role && !period && !desc) return; // skip

      const wrapper = document.createElement('div');
      wrapper.className = 'preview-exp';

      const top = document.createElement('div');
      top.style.display = 'flex';
      top.style.justifyContent = 'space-between';
      top.style.alignItems = 'baseline';

      const title = document.createElement('div');
      title.style.fontWeight = '700';
      title.textContent = `${role || 'Role'}${company ? ' — ' + company : ''}`;

      const meta = document.createElement('div');
      meta.style.color = 'var(--muted)';
      meta.style.fontSize = '0.85rem';
      meta.textContent = period || '';

      top.appendChild(title);
      top.appendChild(meta);

      wrapper.appendChild(top);

      if (desc) {
        const p = document.createElement('div');
        p.style.marginTop = '6px';
        p.style.color = '#111827';
        p.textContent = desc;
        wrapper.appendChild(p);
      }

      previewExperienceList.appendChild(wrapper);
    });
  }

  function updatePreviewSkills(){
    previewSkills.innerHTML = '';
    // preset checked
    const checked = Array.from(skillsPresets.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
    checked.forEach(s => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = s;
      previewSkills.appendChild(span);
    });

    // custom skills from tags
    customSkills.forEach(s => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = s;
      previewSkills.appendChild(span);
    });
  }

  function syncPresetSkills(){
    // nothing fancy required — just presence is enough
  }

  function addSkillTag(val){
    if (!val) return;
    const normalized = val.trim();
    if (!normalized) return;
    if (customSkills.has(normalized)) return; // avoid dup

    customSkills.add(normalized);
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = normalized;

    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Remove ${normalized}`);
    btn.innerHTML = '✕';
    btn.addEventListener('click', () => {
      customSkills.delete(normalized);
      tag.remove();
      updatePreviewSkills();
      updateProgress();
    });
    tag.appendChild(btn);
    skillTags.appendChild(tag);
    updatePreviewSkills();
    updateProgress();
  }

  // ---- Progress Bar ----
  function updateProgress(){
    // Define important fields to measure progress (simple heuristic)
    const fields = [
      !!nameInput.value.trim(),
      !!emailInput.value.trim(),
      !!phoneInput.value.trim(),
      !!summaryInput.value.trim()
    ];

    // at least one education filled
    let educationFilled = false;
    for (const r of educationList.querySelectorAll('.edu-row')){
      if (r.querySelector('.edu-school').value.trim() || r.querySelector('.edu-degree').value.trim()) {
        educationFilled = true; break;
      }
    }
    fields.push(educationFilled);

    // at least one experience filled
    let experienceFilled = false;
    for (const r of experienceList.querySelectorAll('.exp-row')){
      if (r.querySelector('.exp-company').value.trim() || r.querySelector('.exp-role').value.trim()) {
        experienceFilled = true; break;
      }
    }
    fields.push(experienceFilled);

    // at least one skill (preset checked or custom)
    const presetChecked = !!skillsPresets.querySelector('input[type=checkbox]:checked');
    const skillsFilled = presetChecked || customSkills.size > 0;
    fields.push(skillsFilled);

    const score = fields.reduce((s, v) => s + (v ? 1 : 0), 0);
    const pct = Math.round((score / fields.length) * 100);
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', pct);
  }

  // Animate preview sections on update (small pulse/fade)
  function animatePreviewSection(el){
    if (!el) return;
    el.classList.remove('animated-fade-in');
    // Trigger reflow to restart animation
    void el.offsetWidth;
    el.classList.add('animated-fade-in');
  }

  // Keep preview synced for existing dynamic rows
  form.addEventListener('input', () => {
    renderEducationPreview();
    renderExperiencePreview();
  });

  // initial progress calc
  updateProgress();

  // Accessibility: keyboard support for removing tags (on focus)
  skillTags.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const el = document.activeElement;
      if (el && el.classList.contains('skill-tag')) {
        el.remove();
      }
    }
  });

  // Small UX: clicking a preset checkbox adds preview immediately
  skillsPresets.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      updatePreviewSkills();
    });
  });

  // Ensure preview renders whenever dynamic rows are added by functions above
  // (the addXRow functions attach their own input handlers which call render functions)

});