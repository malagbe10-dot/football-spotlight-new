const matches = [
  {competition:"Ligue des champions", gender:"men", home:"Real Madrid", away:"Manchester City", score:"— : —", status:"À VENIR", date:"Exemple • 20:00"},
  {competition:"UWCL", gender:"women", home:"FC Barcelona", away:"Chelsea", score:"— : —", status:"À VENIR", date:"Exemple • 18:45"},
  {competition:"Premier League", gender:"men", home:"Arsenal", away:"Liverpool", score:"2 : 1", status:"TERMINÉ", date:"Exemple • Résultat fictif"},
  {competition:"D1 Arkema", gender:"women", home:"OL Lyonnes", away:"PSG", score:"1 : 1", status:"TERMINÉ", date:"Exemple • Résultat fictif"},
  {competition:"Serie A", gender:"men", home:"Inter", away:"Juventus", score:"— : —", status:"À VENIR", date:"Exemple • 20:45"},
  {competition:"NWSL", gender:"women", home:"Orlando Pride", away:"Gotham FC", score:"— : —", status:"À VENIR", date:"Exemple • 19:00"}
];
const news = [
  {category:"FOOTBALL MONDIAL",title:"Toute l'actualité du ballon rond au même endroit",body:"Retrouvez les informations importantes des clubs, sélections et compétitions du monde entier."},
  {category:"FOOTBALL FÉMININ",title:"Le football féminin au premier plan",body:"Suivez les équipes, joueuses, résultats et grandes affiches des compétitions féminines."},
  {category:"ANALYSE",title:"Comprendre ce qui se passe sur le terrain",body:"Tactique, statistiques et moments décisifs : le score ne raconte pas toujours toute l'histoire."}
];
const competitions = [
  ["UEFA","Ligue des champions"],["UEFA","Europa League"],["UEFA","Conference League"],["UEFA","UWCL"],
  ["AFRIQUE","CAN & compétitions CAF"],["MONDE","Coupe du monde"],["NATIONAL","Championnats nationaux"],["FÉMININ","Ligues féminines"]
];
const matchGrid = document.querySelector("#matchGrid");
function renderMatches(filter="all"){
  matchGrid.innerHTML = matches.filter(m=>filter==="all"||m.gender===filter).map(m=>`
    <article class="match-card">
      <div class="match-meta"><span>${m.competition}</span><span class="match-status">${m.status}</span></div>
      <div class="teams"><div class="team">${m.home}<small>${m.gender==="women"?"Féminin":"Masculin"}</small></div><div class="score">${m.score}</div><div class="team">${m.away}<small>${m.date}</small></div></div>
    </article>`).join("");
}
renderMatches();
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");renderMatches(btn.dataset.filter);
}));
document.querySelector("#newsGrid").innerHTML = news.map(n=>`
  <article class="news-card"><div><span class="news-category">${n.category}</span><h3>${n.title}</h3><p>${n.body}</p></div><a href="#analyses">EN SAVOIR PLUS ↗</a></article>`).join("");
document.querySelector("#competitionGrid").innerHTML = competitions.map(c=>`
  <article class="competition"><span>${c[0]}</span><h3>${c[1]}</h3></article>`).join("");
document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#menuToggle").addEventListener("click",()=>document.querySelector("#mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>document.querySelector("#mainNav").classList.remove("open")));
