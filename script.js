const DATA_URL = "data/live.json";
let allMatches = [];
let currentFilter = "all";

function statusType(m) {
  const s = (m.status || "").toUpperCase();
  if (["1H","2H","HT","ET","P","LIVE","INT"].includes(s)) return "live";
  if (["FT","AET","PEN"].includes(s)) return "finished";
  return "scheduled";
}
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function render() {
  const live = allMatches.filter(m => statusType(m) === "live").length;
  const finished = allMatches.filter(m => statusType(m) === "finished").length;
  document.getElementById("total").textContent = allMatches.length;
  document.getElementById("live-count").textContent = live;
  document.getElementById("finished-count").textContent = finished;
  const shown = allMatches.filter(m => currentFilter === "all" || statusType(m) === currentFilter);
  const container = document.getElementById("matches");
  if (!shown.length) {
    container.innerHTML = '<div class="empty">Aucun match dans cette catégorie pour le moment.</div>';
    return;
  }
  container.innerHTML = shown.map(m => {
    const type = statusType(m);
    const badge = type === "live" ? "EN DIRECT" : type === "finished" ? "TERMINÉ" : "À VENIR";
    const score = m.home_goals === null || m.away_goals === null ? "— : —" : `${m.home_goals} : ${m.away_goals}`;
    return `<article class="match">
      <div class="match-top"><span class="league">${safe(m.league)}</span><span>${safe(m.country || "")}</span></div>
      <div class="teams"><div class="team">${safe(m.home)}</div><div class="score">${score}</div><div class="team away">${safe(m.away)}</div></div>
      <div class="meta"><span>${safe(m.kickoff || "")}</span><span class="badge ${type}">${badge}${m.elapsed ? " · "+safe(m.elapsed)+"′" : ""}</span></div>
    </article>`;
  }).join("");
}
async function loadData() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {cache:"no-store"});
    if (!response.ok) throw new Error("Fichier de données indisponible");
    const data = await response.json();
    allMatches = data.matches || [];
    document.getElementById("updated").textContent = data.updated_at ? `Dernière mise à jour : ${new Date(data.updated_at).toLocaleString("fr-FR")}` : "";
    render();
  } catch (error) {
    document.getElementById("matches").innerHTML = '<div class="empty">Les données seront disponibles après la première exécution automatique du robot.</div>';
  }
}
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  currentFilter = button.dataset.filter;
  render();
}));
loadData();
setInterval(loadData, 5 * 60 * 1000);
