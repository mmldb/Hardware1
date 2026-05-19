(function applyRoomProTheme() {
    const originalBuildSpectrum = window.buildSpectrum;

    window.buildSpectrum = function buildThemedSpectrum() {
        const rows = {
            noise: { id: "row-noise", hue: "190", hot: "#fff8b7", value: (d) => (d.n ?? d.noise ?? 0) / 72 },
            temp: { id: "row-temp", hue: "42", hot: "#ff3b30", value: (d) => ((d.t ?? d.temp ?? 21) - 20.4) / 3.4 },
            lux: { id: "row-lux", hue: "278", hot: "#ff7edb", value: (d) => (d.l ?? d.lux ?? 0) / 3 },
            move: { id: "row-move", hue: "4", hot: "#ff3b30", value: (d) => (d.m || d.move ? 1 : 0.05) }
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
                pixel.style.background = spectrumGradient(row.hue, row.hot, intensity, index);
                el.appendChild(pixel);
            });
        });

        if (!data.length && typeof originalBuildSpectrum === "function") {
            originalBuildSpectrum();
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        requestAnimationFrame(() => {
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
    });

    function findChart() {
        const canvas = document.getElementById("mainChart");

        if (!canvas || !window.Chart || typeof Chart.getChart !== "function") {
            return null;
        }

        return Chart.getChart(canvas);
    }

    function spectrumGradient(hue, hotColor, intensity, index) {
        const base = `hsl(${hue} 96% ${18 + intensity * 28}%)`;
        const glow = `hsl(${hue} 100% ${42 + intensity * 30}%)`;
        const band = index % 17 === 0 ? hotColor : glow;

        return `linear-gradient(180deg, #020303 0%, ${base} 30%, ${band} ${48 + intensity * 18}%, ${base} 78%, #020303 100%)`;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}());
