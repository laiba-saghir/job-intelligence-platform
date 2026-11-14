// ============================================
// SKILLS PAGE - LOGIC
// ============================================

const MAX_SKILLS = 50;          // most skills a user can have
const MAX_SKILL_LENGTH = 40;    // longest single skill name
const RECOMMENDED_SKILLS = 10;  // goal shown in the progress bar

// Quick-add suggestions
const POPULAR_SKILLS = [
    'Python', 'SQL', 'JavaScript', 'Java', 'C++', 'HTML', 'CSS',
    'React', 'Node.js', 'Git', 'FastAPI', 'Django', 'Flask', 'Docker',
    'AWS', 'Machine Learning', 'Data Analysis', 'Excel', 'Power BI',
    'Tableau', 'TypeScript', 'MongoDB', 'PostgreSQL', 'REST API',
    'Automation', 'Communication', 'Problem Solving'
];

let mySkills = [];        // skill names shown as chips
let savedKey = '';        // snapshot of the last saved list
let masterSkills = [];    // every skill name in the database
let masterSet = new Set();
let dropdownItems = [];   // current autocomplete items
let activeIndex = -1;     // highlighted dropdown item
let isSaving = false;


document.addEventListener('DOMContentLoaded', async () => {
    
    if (!isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }
    
    bindEvents();
    await loadUserInfo();
    await loadSkills();
});


// ============================================
// LOAD DATA
// ============================================
async function loadUserInfo() {
    try {
        const user = await getCurrentUser();
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    } catch (error) {
        console.error('User load error:', error);
        redirectIfSessionExpired(error);
    }
}

async function loadSkills() {
    try {
        const [mine, all] = await Promise.all([
            apiCall('/skills/me'),
            apiCall('/skills/').catch(() => [])
        ]);
        
        mySkills = (mine || []).map(skill => skill.name);
        masterSkills = (all || []).map(skill => skill.name);
        masterSet = new Set(masterSkills);
        savedKey = skillKey(mySkills);
        
        render();
        
    } catch (error) {
        redirectIfSessionExpired(error);
        document.getElementById('skillChips').innerHTML = '';
        showToast(error.message, 'error');
        render();
    }
}

function redirectIfSessionExpired(error) {
    if (error && error.message && error.message.includes('Session expired')) {
        window.location.href = '../index.html';
    }
}


// ============================================
// EVENTS
// ============================================
function bindEvents() {
    const input = document.getElementById('skillInput');
    
    document.getElementById('addBtn').addEventListener('click', () => {
        addFromInput();
    });
    
    input.addEventListener('input', renderDropdown);
    input.addEventListener('keydown', handleInputKeys);
    input.addEventListener('blur', () => setTimeout(hideDropdown, 120));
    
    document.getElementById('saveBtn').addEventListener('click', saveSkills);
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (mySkills.length && confirm('Remove all skills from your list?')) {
            mySkills = [];
            render();
        }
    });
    
    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (isDirty()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function handleInputKeys(e) {
    const dropdown = document.getElementById('skillDropdown');
    const open = !dropdown.hidden && dropdownItems.length > 0;
    
    if (e.key === 'ArrowDown' && open) {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % dropdownItems.length;
        highlightDropdown();
    } else if (e.key === 'ArrowUp' && open) {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + dropdownItems.length) % dropdownItems.length;
        highlightDropdown();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open && activeIndex >= 0) {
            pickDropdownItem(dropdownItems[activeIndex]);
        } else {
            addFromInput();
        }
    } else if (e.key === 'Escape') {
        hideDropdown();
    }
}


// ============================================
// ADD / REMOVE SKILLS
// ============================================
function addFromInput() {
    const input = document.getElementById('skillInput');
    const value = input.value;
    
    if (!value.trim()) {
        input.focus();
        return;
    }
    
    addSkills(value);
    input.value = '';
    hideDropdown();
    input.focus();
}

// Accepts one skill or several separated by commas
function addSkills(rawText) {
    const parts = rawText.split(/[,;\n]+/);
    let added = 0;
    let duplicates = 0;
    
    for (const part of parts) {
        const name = part.replace(/\s+/g, ' ').trim();
        if (!name) continue;
        
        if (name.length > MAX_SKILL_LENGTH) {
            showToast(`"${name.slice(0, 20)}..." is too long (max ${MAX_SKILL_LENGTH} characters)`, 'error');
            continue;
        }
        
        if (mySkills.length >= MAX_SKILLS) {
            showToast(`You can add up to ${MAX_SKILLS} skills`, 'warning');
            break;
        }
        
        const skill = canonicalName(name);
        
        if (hasSkill(skill)) {
            duplicates++;
            continue;
        }
        
        mySkills.push(skill);
        added++;
    }
    
    if (added === 0 && duplicates > 0) {
        showToast('Already in your list', 'info');
    }
    
    render();
}

function removeSkill(name) {
    mySkills = mySkills.filter(skill => skill !== name);
    render();
}

// If the skill already exists in the database, reuse its exact spelling
function canonicalName(name) {
    if (masterSet.has(name)) return name;
    
    const lower = name.toLowerCase();
    const found = masterSkills.find(skill => skill.toLowerCase() === lower);
    return found || name;
}

function hasSkill(name) {
    const lower = name.toLowerCase();
    return mySkills.some(skill => skill.toLowerCase() === lower);
}


// ============================================
// AUTOCOMPLETE
// ============================================
function renderDropdown() {
    const input = document.getElementById('skillInput');
    const dropdown = document.getElementById('skillDropdown');
    const query = input.value.replace(/\s+/g, ' ').trim().toLowerCase();
    
    dropdownItems = [];
    activeIndex = -1;
    
    // Do not suggest while the user is typing a comma list
    if (!query || /[,;]/.test(query)) {
        hideDropdown();
        return;
    }
    
    const seen = new Set();
    const matches = [];
    
    for (const name of masterSkills) {
        const lower = name.toLowerCase();
        if (!lower.includes(query) || seen.has(lower) || hasSkill(name)) continue;
        seen.add(lower);
        matches.push(name);
    }
    
    // Names that start with the query first, then shorter names
    matches.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(query) ? 0 : 1;
        return aStarts - bStarts || a.length - b.length;
    });
    
    dropdownItems = matches.slice(0, 6).map(name => ({ name, isNew: false }));
    
    // Offer to add what was typed if it is not in the database yet
    const typed = input.value.replace(/\s+/g, ' ').trim();
    const typedLower = typed.toLowerCase();
    const exists = masterSkills.some(name => name.toLowerCase() === typedLower);
    
    if (!exists && !hasSkill(typed) && typed.length <= MAX_SKILL_LENGTH) {
        dropdownItems.push({ name: typed, isNew: true });
    }
    
    if (dropdownItems.length === 0) {
        hideDropdown();
        return;
    }
    
    dropdown.innerHTML = '';
    
    dropdownItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sk-dropdown-item' + (item.isNew ? ' new' : '');
        
        const icon = document.createElement('i');
        icon.className = item.isNew ? 'fa-solid fa-plus' : 'fa-solid fa-graduation-cap';
        
        const label = document.createElement('span');
        label.textContent = item.isNew ? `Add "${item.name}" as a new skill` : item.name;
        
        button.appendChild(icon);
        button.appendChild(label);
        
        // mousedown runs before the input loses focus
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            pickDropdownItem(dropdownItems[index]);
        });
        
        dropdown.appendChild(button);
    });
    
    dropdown.hidden = false;
}

function highlightDropdown() {
    const buttons = document.querySelectorAll('#skillDropdown .sk-dropdown-item');
    buttons.forEach((button, index) => {
        button.classList.toggle('active', index === activeIndex);
    });
}

function pickDropdownItem(item) {
    addSkills(item.name);
    const input = document.getElementById('skillInput');
    input.value = '';
    hideDropdown();
    input.focus();
}

function hideDropdown() {
    const dropdown = document.getElementById('skillDropdown');
    dropdown.hidden = true;
    dropdown.innerHTML = '';
    dropdownItems = [];
    activeIndex = -1;
}


// ============================================
// RENDER
// ============================================
function render() {
    renderChips();
    renderPopular();
    updateSummary();
    updateSaveState();
}

function renderChips() {
    const container = document.getElementById('skillChips');
    container.innerHTML = '';
    
    const isEmpty = mySkills.length === 0;
    document.getElementById('emptyState').hidden = !isEmpty;
    document.getElementById('skillFooter').hidden = isEmpty;
    
    mySkills.forEach(name => {
        const chip = document.createElement('span');
        chip.className = 'sk-chip';
        
        const label = document.createElement('span');
        label.textContent = name;
        
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'sk-chip-remove';
        remove.title = `Remove ${name}`;
        remove.setAttribute('aria-label', `Remove ${name}`);
        remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        remove.addEventListener('click', () => removeSkill(name));
        
        chip.appendChild(label);
        chip.appendChild(remove);
        container.appendChild(chip);
    });
}

function renderPopular() {
    const list = document.getElementById('popularList');
    list.innerHTML = '';
    
    const remaining = POPULAR_SKILLS.filter(name => !hasSkill(name));
    document.getElementById('popularDone').hidden = remaining.length > 0;
    
    remaining.forEach(name => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sk-suggest';
        button.innerHTML = '<i class="fa-solid fa-plus"></i>';
        button.appendChild(document.createTextNode(name));
        button.addEventListener('click', () => addSkills(name));
        list.appendChild(button);
    });
}

function updateSummary() {
    const count = mySkills.length;
    document.getElementById('skillCount').textContent =
        `${count} ${count === 1 ? 'skill' : 'skills'}`;
    
    const percent = Math.min(100, Math.round((count / RECOMMENDED_SKILLS) * 100));
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressLabel').textContent =
        `${Math.min(count, RECOMMENDED_SKILLS)} of ${RECOMMENDED_SKILLS} recommended`;
}


// ============================================
// SAVE
// ============================================
function skillKey(list) {
    return list.map(skill => skill.toLowerCase()).sort().join('|');
}

function isDirty() {
    return skillKey(mySkills) !== savedKey;
}

function updateSaveState() {
    const dirty = isDirty();
    document.getElementById('unsavedBadge').hidden = !dirty;
    document.getElementById('saveBtn').disabled = !dirty || isSaving;
}

async function saveSkills() {
    if (!isDirty() || isSaving) return;
    
    const button = document.getElementById('saveBtn');
    isSaving = true;
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    
    try {
        const saved = await apiCall('/skills/me', 'POST', { skill_names: mySkills });
        const savedNames = (saved || []).map(skill => skill.name);
        
        // Keep the user's order unless the server returned something different
        if (skillKey(savedNames) !== skillKey(mySkills)) {
            mySkills = savedNames;
        }
        
        // Remember any brand-new skills for autocomplete
        savedNames.forEach(name => {
            if (!masterSet.has(name)) {
                masterSet.add(name);
                masterSkills.push(name);
            }
        });
        
        savedKey = skillKey(mySkills);
        showToast('Skills saved. Your job matches are updated.', 'success');
        
    } catch (error) {
        redirectIfSessionExpired(error);
        showToast(error.message || 'Could not save skills', 'error');
    } finally {
        isSaving = false;
        button.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        render();
    }
}


// ============================================
// TOAST
// ============================================
function showToast(message, type = 'info') {
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    
    const toast = document.createElement('div');
    toast.className = `sk-toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = `fa-solid ${icons[type] || icons.info}`;
    
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(message));
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}