(function applyRoomProTheme() {
    const originalBuildSpectrum = window.buildSpectrum;
    const eventPositions = new Map();

    window.buildSpectrum = function buildThemedSpectrum() {
        const rows = {
            noise: { id: "row-noise", colors: ["#13c8ff", "#113fd8", "#ffd6d6"], value: (d) => (d.n ?? d.noise ?? 0) / 72 },
            temp: { id: "row-temp", colors: ["#ffc400", "#ff7a00", "#ff1515"], value: (d) => ((d.t ?? d.temp ?? 21) - 20.4) / 3.4 },
            humidity: { id: "row-humidity", colors: ["#06472b", "#00a878", "#ffd6d6"], value: (d) => ((d.h ?? d.humidity ?? 45) - 38) / 24 },
            pressure: { id: "row-pressure", colors: ["#210006", "#ffb8c5", "#ffd6d6"], value: (d) => ((d.p ?? d.pressure ?? 1013) - 1005) / 18 },
            lux: { id: "row-lux", colors: ["#ffb8c5", "#ff40b6", "#2a4dff"], value: (d) => (d.l ?? d.lux ?? 0) / 3 },
            move: { id: "row-move", colors: ["#06472b", "#00a878", "#ff3b30"], value: (d) => (d.m || d.move ? 1 : 0.05) }
        };

        const data = window.mockData || [];

        Object.values(rows).forEach((row) => {
            const el = document.getElementById(row.id);

            if (!el) {
                return;
            }

            el.textContent = "";

            data.forEach((d, index) => {
                const intensity = clamp(row.value(d), 0.04, 1);
                const pixel = document.createElement("div");
                pixel.className = "spec-pixel";
                pixel.style.opacity = String(0.58 + intensity * 0.42);
                pixel.style.background = spectrumGradient(row.colors, intensity, index);
                el.appendChild(pixel);
            });
        });

        if (!data.length && typeof originalBuildSpectrum === "function") {
            originalBuildSpectrum();
        }
    };

    const originalRenderEvents = window.renderEvents;

    if (typeof originalRenderEvents === "function") {
        window.renderEvents = function renderThemedEvents() {
            originalRenderEvents();
            alignEventTags();
        };

        try {
            renderEvents = window.renderEvents;
        } catch (error) {
            window.renderEvents = window.renderEvents;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        requestAnimationFrame(() => {
            if (!window.Chart) {
                return;
            }

            const chart = findChart();
            if (!chart) {
                return;
            }

            chart.options.animation = false;
            chart.options.scales.x.grid.color = "rgba(184, 201, 176, 0.14)";
            chart.options.scales.y.grid.color = "rgba(184, 201, 176, 0.18)";
            chart.options.scales.x.ticks.color = "#7c867f";
            chart.options.scales.y.ticks.color = "#7c867f";
            chart.data.datasets[0].borderColor = "#e7ece8";
            chart.data.datasets[0].borderWidth = 1.5;
            chart.data.datasets[0].tension = 0.18;
            chart.update();
        });

        const form = document.getElementById("event-form");
        if (form) {
            form.addEventListener("submit", () => {
                const input = document.getElementById("event-input");
                const text = input?.value?.trim();

                if (!text) {
                    return;
                }

                eventPositions.set(text, getPlayheadX());
                requestAnimationFrame(alignEventTags);
                setTimeout(alignEventTags, 0);
            }, true);
        }
    });

    function findChart() {
        const canvas = document.getElementById("mainChart");

        if (!canvas || !window.Chart || typeof Chart.getChart !== "function") {
            return null;
        }

        return Chart.getChart(canvas);
    }

    function spectrumGradient(colors, intensity, index) {
        const [low, mid, hot] = colors;
        const band = index % 17 === 0 ? hot : mid;
        const stop = 44 + intensity * 20;

        return `linear-gradient(180deg, #000 0%, ${low} 28%, ${band} ${stop}%, ${mid} 76%, #000 100%)`;
    }

    function alignEventTags() {
        document.querySelectorAll(".event-tag").forEach((tag) => {
            const x = eventPositions.get(tag.textContent);

            if (typeof x === "number") {
                tag.style.left = `${x}px`;
            }
        });
    }

    function getPlayheadX() {
        const viewport = document.getElementById("viewport");

        if (!viewport) {
            return 0;
        }

        return viewport.scrollLeft + (viewport.clientWidth / 2);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}());
