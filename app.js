const CHART_WIDTH = 3000;

const state = {
    events: [],
    viewMode: "chart",
    currentIdx: 0,
    activeEventId: null,
    mockData: [],
    chart: null
};

const elements = {};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    cacheElements();
    state.mockData = generateData();
    window.currentIdx = 0;
    window.mockData = state.mockData;

    setHeaderDate();
    bindEvents();
    createChart();
    updateFromIndex(state.mockData.length - 1);
    registerServiceWorker();

    requestAnimationFrame(() => {
        elements.viewport.scrollLeft = elements.viewport.scrollWidth;
        updateFromScroll();
    });
}

function cacheElements() {
    elements.viewport = document.getElementById("viewport");
    elements.timeDisplay = document.getElementById("center-time");
    elements.statsDisplay = document.getElementById("center-stats");
    elements.headerDate = document.getElementById("header-date");
    elements.viewToggle = document.getElementById("view-toggle");
    elements.addEventBtn = document.getElementById("add-event-btn");
    elements.chartHolder = document.getElementById("chart-holder");
    elements.mainChart = document.getElementById("mainChart");
    elements.spectrum = document.getElementById("spectrum-container");
    elements.modal = document.getElementById("event-modal");
    elements.modalBackdrop = document.getElementById("modal-backdrop");
    elements.eventForm = document.getElementById("event-form");
    elements.eventInput = document.getElementById("event-input");
    elements.modalTimeLabel = document.getElementById("modal-time-label");
    elements.deleteEventBtn = document.getElementById("delete-event-btn");
    elements.cancelEventBtn = document.getElementById("cancel-event-btn");
    elements.liveNoise = document.getElementById("live-noise");
    elements.liveTemp = document.getElementById("live-temp");
    elements.liveHumidity = document.getElementById("live-humidity");
    elements.liveMove = document.getElementById("live-move");
    elements.liveLux = document.getElementById("live-lux");
}

function bindEvents() {
    elements.viewport.addEventListener("scroll", updateFromScroll);
    elements.viewToggle.addEventListener("click", toggleViewMode);
    elements.addEventBtn.addEventListener("click", () => openEventModal());
    elements.eventForm.addEventListener("submit", saveEvent);
    elements.deleteEventBtn.addEventListener("click", deleteEvent);
    elements.cancelEventBtn.addEventListener("click", closeModal);
    elements.modalBackdrop.addEventListener("click", closeModal);

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => toggleDataset(Number(card.dataset.idx)));
    });
}

function setHeaderDate() {
    const formatter = new Intl.DateTimeFormat("hu-HU", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    });

    elements.headerDate.textContent = formatter.format(new Date());
}

function generateData() {
    const data = [];
    const now = new Date();

    for (let i = 240; i >= 0; i -= 1) {
        const time = new Date(now.getTime() - i * 6 * 60000);
        const circadian = Math.sin((i / 240) * Math.PI * 2);
        const noiseSpike = Math.random() > 0.955 ? Math.random() * 38 : 0;
        const movement = Math.random() > 0.98;

        data.push({
            ts: time.getTime(),
            label: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            n: Math.round(Math.random() * 18 + 6 + noiseSpike),
            t: Number((21.4 + circadian * 0.45 + Math.random() * 1.1).toFixed(1)),
            h: Number((45 + Math.random() * 8).toFixed(1)),
            l: Number((Math.random() * 3).toFixed(1)),
            m: movement
        });
    }

    return data;
}

function createChart() {
    state.chart = new Chart(elements.mainChart, {
        type: "line",
        data: {
            labels: state.mockData.map((d) => d.label),
            datasets: [
                {
                    label: "Zaj",
                    data: state.mockData.map((d) => d.n),
                    borderColor: "#e7ece8",
                    fill: true,
                    backgroundColor: "rgba(0, 210, 255, 0.06)",
                    tension: 0.18,
                    pointRadius: 0,
                    borderWidth: 1.5
                },
                {
                    label: "Mozgas",
                    data: state.mockData.map((d) => (d.m ? 68 : 0)),
                    backgroundColor: "#ff3b30",
                    type: "bar",
                    barThickness: 3
                },
                {
                    label: "Ho",
                    data: state.mockData.map((d) => (d.t - 15) * 5),
                    borderColor: "#ffcc00",
                    hidden: true,
                    tension: 0.24,
                    pointRadius: 0,
                    borderWidth: 1.5
                },
                {
                    label: "Feny",
                    data: state.mockData.map((d) => d.l * 14),
                    borderColor: "#af52de",
                    hidden: true,
                    tension: 0.24,
                    pointRadius: 0,
                    borderWidth: 1.5
                },
                {
                    label: "Para",
                    data: state.mockData.map((d) => d.h),
                    borderColor: "#00a878",
                    hidden: true,
                    tension: 0.22,
                    pointRadius: 0,
                    borderWidth: 1.5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: {
                        color: "rgba(184, 201, 176, 0.14)",
                        borderDash: [2, 6]
                    },
                    ticks: {
                        color: "#7c867f",
                        font: { family: "monospace", size: 10 },
                        maxRotation: 0
                    }
                },
                y: {
                    position: "right",
                    min: 0,
                    max: 100,
                    grid: { color: "rgba(184, 201, 176, 0.18)" },
                    ticks: {
                        color: "#7c867f",
                        font: { family: "monospace", size: 10 }
                    }
                }
            }
        }
    });
}

function updateFromScroll() {
    const maxScroll = elements.viewport.scrollWidth - elements.viewport.clientWidth;
    const scrollPercent = maxScroll <= 0 ? 0 : elements.viewport.scrollLeft / maxScroll;
    const index = Math.min(
        Math.max(Math.round(scrollPercent * (state.mockData.length - 1)), 0),
        state.mockData.length - 1
    );

    updateFromIndex(index);
}

function updateFromIndex(index) {
    const d = state.mockData[index];

    if (!d) {
        return;
    }

    state.currentIdx = index;
    window.currentIdx = index;

    elements.timeDisplay.textContent = d.label;
    elements.statsDisplay.innerHTML = `<span style="color:var(--primary)">N ${d.n}%</span> | <span style="color:var(--temp)">T ${d.t.toFixed(1)} °C</span> | <span style="color:var(--humidity)">H ${d.h.toFixed(0)}%</span> | <span style="color:var(--lux)">L ${Math.round(d.l)} lx</span>`;

    elements.liveNoise.textContent = `${d.n} %`;
    elements.liveTemp.textContent = `${d.t.toFixed(1)} °C`;
    elements.liveHumidity.textContent = `${d.h.toFixed(0)} %`;
    elements.liveMove.textContent = d.m ? "Mozgás" : "Stab.";
    elements.liveLux.textContent = `${d.l.toFixed(1)} lx`;
}

function toggleViewMode() {
    if (state.viewMode === "chart") {
        state.viewMode = "spectrum";
        elements.viewToggle.textContent = "Váltás: Grafikon";
        elements.mainChart.style.display = "none";
        elements.spectrum.classList.add("active");
        elements.spectrum.setAttribute("aria-hidden", "false");
        buildSpectrum();
    } else {
        state.viewMode = "chart";
        elements.viewToggle.textContent = "Váltás: Spektrum";
        elements.mainChart.style.display = "block";
        elements.spectrum.classList.remove("active");
        elements.spectrum.setAttribute("aria-hidden", "true");
    }

    requestAnimationFrame(renderEvents);
}

function buildSpectrum() {
    const rows = {
        noise: { id: "row-noise", hue: "190", hot: "#fff8b7", value: (d) => d.n / 72 },
        temp: { id: "row-temp", hue: "42", hot: "#ff3b30", value: (d) => (d.t - 20.4) / 3.4 },
        humidity: { id: "row-humidity", hue: "154", hot: "#ffd6d6", value: (d) => (d.h - 38) / 24 },
        lux: { id: "row-lux", hue: "278", hot: "#ff7edb", value: (d) => d.l / 3 },
        move: { id: "row-move", hue: "4", hot: "#ff3b30", value: (d) => (d.m ? 1 : 0.05) }
    };

    Object.values(rows).forEach((row) => {
        const el = document.getElementById(row.id);
        el.textContent = "";

        state.mockData.forEach((d, index) => {
            const intensity = clamp(row.value(d), 0.04, 1);
            const pixel = document.createElement("div");
            pixel.className = "spec-pixel";
            pixel.style.opacity = String(0.58 + intensity * 0.42);
            pixel.style.background = spectrumGradient(row.hue, row.hot, intensity, index);
            el.appendChild(pixel);
        });
    });
}

function spectrumGradient(hue, hotColor, intensity, index) {
    const base = `hsl(${hue} 96% ${18 + intensity * 28}%)`;
    const glow = `hsl(${hue} 100% ${42 + intensity * 30}%)`;
    const band = index % 17 === 0 ? hotColor : glow;

    return `linear-gradient(180deg, #020303 0%, ${base} 30%, ${band} ${48 + intensity * 18}%, ${base} 78%, #020303 100%)`;
}

function openEventModal(id = null) {
    state.activeEventId = id;
    const event = id === null ? null : state.events.find((item) => item.id === id);
    const index = event ? event.idx : state.currentIdx;

    elements.eventInput.value = event ? event.text : "";
    elements.modalTimeLabel.textContent = state.mockData[index]?.label ?? "00:00";
    elements.deleteEventBtn.hidden = !event;
    elements.modalBackdrop.hidden = false;

    if (typeof elements.modal.showModal === "function") {
        elements.modal.showModal();
    } else {
        elements.modal.setAttribute("open", "");
    }

    elements.eventInput.focus();
}

function saveEvent(event) {
    event.preventDefault();

    const text = elements.eventInput.value.trim();

    if (!text) {
        return;
    }

    if (state.activeEventId !== null) {
        const existing = state.events.find((item) => item.id === state.activeEventId);
        if (existing) {
            existing.text = text;
        }
    } else {
        state.events.push({
            id: Date.now(),
            idx: state.currentIdx,
            x: getPlayheadX(),
            readingTs: state.mockData[state.currentIdx]?.ts ?? null,
            text
        });
    }

    renderEvents();
    closeModal();
}

function renderEvents() {
    document.querySelectorAll(".event-tag").forEach((tag) => tag.remove());

    state.events.forEach((event) => {
        const x = typeof event.x === "number" ? event.x : (event.idx / (state.mockData.length - 1)) * CHART_WIDTH;
        const tag = document.createElement("button");
        tag.className = "event-tag";
        tag.type = "button";
        tag.textContent = event.text;
        tag.style.left = `${x}px`;
        tag.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            openEventModal(event.id);
        });

        elements.chartHolder.appendChild(tag);
    });
}

function getPlayheadX() {
    return elements.viewport.scrollLeft + (elements.viewport.clientWidth / 2);
}

function toggleDataset(index) {
    const card = document.querySelector(`.card[data-idx="${index}"]`);

    if (state.chart.isDatasetVisible(index)) {
        state.chart.hide(index);
        card?.classList.remove("active");
    } else {
        state.chart.show(index);
        card?.classList.add("active");
    }

    state.chart.update();
}

function deleteEvent() {
    state.events = state.events.filter((event) => event.id !== state.activeEventId);
    renderEvents();
    closeModal();
}

function closeModal() {
    elements.modalBackdrop.hidden = true;

    if (typeof elements.modal.close === "function") {
        elements.modal.close();
    } else {
        elements.modal.removeAttribute("open");
    }
}

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch((error) => {
            console.warn("Service worker registration failed", error);
        });
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
