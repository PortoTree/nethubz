const fs = require('fs');

function addKeys(file, keys) {
  const content = fs.readFileSync(file, 'utf8');
  const json = JSON.parse(content);
  
  if (!json.project) json.project = {};
  
  for (const [k, v] of Object.entries(keys)) {
    if (!json.project[k]) {
      json.project[k] = v;
    }
  }
  
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
}

addKeys("c:\\mencari-online\\apps\\web\\messages\\id.json", {
  backToProjects: "Kembali ke Project {name}",
  aboutProject: "Tentang Project ini",
  technologies: "Teknologi"
});

addKeys("c:\\mencari-online\\apps\\web\\messages\\en.json", {
  backToProjects: "Back to {name}'s Projects",
  aboutProject: "About this Project",
  technologies: "Technologies"
});
