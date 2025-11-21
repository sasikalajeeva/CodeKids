const state = {
    personal: {
        fullName: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        portfolio: ""
    },
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: []
};

const sectionConfigs = {
    experience: {
        templateId: "experience-template",
        listId: "experience-list",
        previewId: "preview-experience",
        emptyText: "Add internships or part-time roles with measurable impact.",
        defaults: { role: "", company: "", location: "", start: "", end: "", details: "" }
    },
    projects: {
        templateId: "projects-template",
        listId: "projects-list",
        previewId: "preview-projects",
        emptyText: "Highlight engineering builds, hackathons, or research.",
        defaults: { title: "", context: "", tech: "", details: "" }
    },
    education: {
        templateId: "education-template",
        listId: "education-list",
        previewId: "preview-education",
        emptyText: "Show degrees, certifications, and standout academics.",
        defaults: { degree: "", institution: "", start: "", end: "", details: "" }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    cachePreviewElements();
    bindStaticInputs();
    bindDynamicButtons();
    initializeDynamicSections();
    bindActions();
    renderPreview();
});

const previewRefs = {};

function cachePreviewElements() {
    previewRefs.name = document.getElementById("preview-name");
    previewRefs.headline = document.getElementById("preview-headline");
    previewRefs.contact = document.getElementById("preview-contact");
    previewRefs.links = document.getElementById("preview-links");
    previewRefs.summary = document.getElementById("preview-summary");
    previewRefs.skills = document.getElementById("preview-skills");
    previewRefs.experience = document.getElementById("preview-experience");
    previewRefs.projects = document.getElementById("preview-projects");
    previewRefs.education = document.getElementById("preview-education");
    const yearEl = document.getElementById("copyright-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

function bindStaticInputs() {
    const bindings = [
        { id: "full-name", handler: value => (state.personal.fullName = value) },
        { id: "headline", handler: value => (state.personal.headline = value) },
        { id: "email", handler: value => (state.personal.email = value) },
        { id: "phone", handler: value => (state.personal.phone = value) },
        { id: "location", handler: value => (state.personal.location = value) },
        { id: "linkedin", handler: value => (state.personal.linkedin = value) },
        { id: "portfolio", handler: value => (state.personal.portfolio = value) }
    ];

    bindings.forEach(({ id, handler }) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", event => {
                handler(event.target.value.trim());
                renderHeader();
            });
        }
    });

    const summaryInput = document.getElementById("summary");
    if (summaryInput) {
        summaryInput.addEventListener("input", event => {
            state.summary = event.target.value.trim();
            renderSummary();
        });
    }

    const skillsInput = document.getElementById("skills");
    if (skillsInput) {
        const updateSkills = event => {
            state.skills = parseSkills(event.target.value);
            renderSkills();
        };
        skillsInput.addEventListener("input", updateSkills);
        skillsInput.addEventListener("blur", updateSkills);
    }
}

function bindDynamicButtons() {
    document.querySelectorAll("[data-add]").forEach(button => {
        button.addEventListener("click", () => addDynamicEntry(button.dataset.add));
    });
}

function initializeDynamicSections() {
    Object.keys(sectionConfigs).forEach(section => {
        addDynamicEntry(section);
    });
}

function bindActions() {
    const form = document.getElementById("resume-form");
    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            flashPreview();
        });
        form.addEventListener("reset", () => {
            setTimeout(() => resetBuilderState(), 0);
        });
    }

    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => window.print());
    }

}

function addDynamicEntry(section) {
    const config = sectionConfigs[section];
    if (!config) return;

    const template = document.getElementById(config.templateId);
    const list = document.getElementById(config.listId);
    if (!template || !list) return;

    const clone = template.content.firstElementChild.cloneNode(true);
    const id = crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    clone.dataset.id = id;

    clone.querySelectorAll("[data-field]").forEach(input => {
        input.addEventListener("input", event => {
            updateDynamicState(section, id, input.dataset.field, event.target.value);
        });
    });

    const removeBtn = clone.querySelector("[data-remove]");
    if (removeBtn) {
        removeBtn.addEventListener("click", () => removeDynamicEntry(section, id, clone));
    }

    list.appendChild(clone);
    state[section].push({ id, ...config.defaults });
}

function removeDynamicEntry(section, id, element) {
    state[section] = state[section].filter(entry => entry.id !== id);
    element.remove();
    renderSection(section);

    if (!state[section].length) {
        addDynamicEntry(section);
    }
}

function updateDynamicState(section, id, field, value) {
    const entry = state[section].find(item => item.id === id);
    if (!entry) return;
    entry[field] = value.trim();
    renderSection(section);
}

function renderPreview() {
    renderHeader();
    renderSummary();
    renderSkills();
    Object.keys(sectionConfigs).forEach(renderSection);
}

function renderHeader() {
    previewRefs.name.textContent = state.personal.fullName || "Your Name";
    previewRefs.headline.textContent = state.personal.headline || "Target Role / Headline";

    const contacts = [
        state.personal.email,
        state.personal.phone,
        state.personal.location
    ].filter(Boolean);

    previewRefs.contact.textContent = contacts.length
        ? contacts.join(" | ")
        : "email@example.com | +00 00000 00000 | City, Country";

    const links = [
        state.personal.linkedin ? `LinkedIn: ${formatLink(state.personal.linkedin)}` : "",
        state.personal.portfolio ? `Portfolio: ${formatLink(state.personal.portfolio)}` : ""
    ].filter(Boolean);

    previewRefs.links.textContent = links.length ? links.join(" | ") : "LinkedIn | Portfolio";
}

function renderSummary() {
    previewRefs.summary.textContent = state.summary || "Concise overview of your skills, achievements, and tools.";
}

function renderSkills() {
    previewRefs.skills.innerHTML = "";
    if (!state.skills.length) {
        const placeholder = document.createElement("li");
        placeholder.textContent = "Add role-specific keywords";
        previewRefs.skills.appendChild(placeholder);
        return;
    }

    state.skills.forEach(skill => {
        const li = document.createElement("li");
        li.textContent = skill;
        previewRefs.skills.appendChild(li);
    });
}

function renderSection(section) {
    const config = sectionConfigs[section];
    if (!config) return;

    const container = previewRefs[section];
    container.innerHTML = "";

    const entries = state[section].filter(entry => hasContent(entry, config.defaults));

    if (!entries.length) {
        const empty = document.createElement("article");
        empty.className = "empty";
        empty.textContent = config.emptyText;
        container.appendChild(empty);
        return;
    }

    entries.forEach(entry => {
        const article = document.createElement("article");
        const title = document.createElement("h3");
        const meta = document.createElement("p");
        meta.className = "meta";

        if (section === "experience") {
            title.textContent = entry.role || "Role / Title";
            meta.textContent = buildMetaLine([entry.company, entry.location, formatDates(entry.start, entry.end)]);
        } else if (section === "projects") {
            title.textContent = entry.title || "Project Title";
            meta.textContent = buildMetaLine([entry.context, entry.tech]);
        } else if (section === "education") {
            title.textContent = entry.degree || "Degree";
            meta.textContent = buildMetaLine([entry.institution, formatDates(entry.start, entry.end)]);
        }

        article.appendChild(title);
        if (meta.textContent.trim()) {
            article.appendChild(meta);
        }

        const bullets = formatBullets(entry.details);
        if (bullets.length) {
            const list = document.createElement("ul");
            bullets.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                list.appendChild(li);
            });
            article.appendChild(list);
        }

        container.appendChild(article);
    });
}

function parseSkills(rawValue) {
    return rawValue
        .split(/[\n,]/)
        .map(entry => entry.replace(/[-•]/g, "").trim())
        .filter(Boolean);
}

function formatBullets(text = "") {
    return text
        .split(/\n+/)
        .map(line => line.replace(/^[•\-–]\s*/, "").trim())
        .filter(Boolean);
}

function buildMetaLine(parts) {
    return parts.filter(Boolean).join(" • ");
}

function formatDates(start = "", end = "") {
    if (!start && !end) return "";
    return [start, end || "Present"].filter(Boolean).join(" – ");
}

function hasContent(entry, defaults) {
    return Object.keys(defaults).some(key => entry[key] && entry[key].trim());
}

function resetBuilderState() {
    Object.keys(state.personal).forEach(key => (state.personal[key] = ""));
    state.summary = "";
    state.skills = [];
    Object.keys(sectionConfigs).forEach(section => {
        state[section] = [];
        const list = document.getElementById(sectionConfigs[section].listId);
        if (list) list.innerHTML = "";
        addDynamicEntry(section);
    });
    renderPreview();
}

function flashPreview() {
    const preview = document.getElementById("resume-preview");
    if (!preview) return;
    preview.classList.remove("pulse");
    void preview.offsetWidth; // restart animation
    preview.classList.add("pulse");
}

function bindAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes pulseBorder {
            0% { box-shadow: 0 0 0 rgba(37, 99, 235, 0); }
            50% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.25); }
            100% { box-shadow: 0 0 0 rgba(37, 99, 235, 0); }
        }
        #resume-preview.pulse {
            animation: pulseBorder 1s ease;
        }
    `;
    document.head.appendChild(style);
}

bindAnimationStyles();

function formatLink(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "") + parsed.pathname.replace(/\/$/, "");
    } catch {
        return url;
    }
}

