"use strict";

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({attrs: {"stroke-width": 1.8}});
}

const figureDialog = document.getElementById("figure-dialog");
const dialogImage = document.getElementById("dialog-img");
let dialogZoom = 100;
let dialogImageWidth = 0;
function changeZoom(zoom) {
  dialogZoom = Math.max(50, Math.min(400, zoom));
  dialogImage.style.width = `${Math.round(dialogImageWidth * dialogZoom / 100)}px`;
  document.getElementById("zoom-level").textContent = `${dialogZoom}%`;
  document.getElementById("zoom-out").disabled = dialogZoom === 50;
  document.getElementById("zoom-in").disabled = dialogZoom === 400;
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-zoom]");
  if (!button) return;
  dialogImage.src = button.dataset.zoom;
  dialogImage.alt = button.dataset.title;
  document.getElementById("dialog-title").textContent = button.dataset.title;
  figureDialog.showModal();
  dialogImageWidth = figureDialog.clientWidth - 32;
  changeZoom(100);
});
document.getElementById("close-dialog").addEventListener("click", () => figureDialog.close());
document.getElementById("zoom-in").addEventListener("click", () => changeZoom(dialogZoom + 50));
document.getElementById("zoom-out").addEventListener("click", () => changeZoom(dialogZoom - 50));
figureDialog.addEventListener("click", (event) => {
  const rectangle = figureDialog.getBoundingClientRect();
  if (event.clientX < rectangle.left || event.clientX > rectangle.right ||
      event.clientY < rectangle.top || event.clientY > rectangle.bottom) figureDialog.close();
});
refreshIcons();

// Values are transcribed from Tables 1 and 2 of the supplied ACL manuscript.
const results = [
  {name:"Gemini 3 Flash", group:"Closed-source models", single:[12.81,88.55,4.40,1.11,7.81], dual:[15.47,88.23,4.50,2.71,8.28]},
  {name:"Gemini 3.1 Pro", group:"Closed-source models", single:[9.06,90.87,15.78,1.86,12.19], dual:[14.53,90.32,28.88,2.03,14.38]},
  {name:"Qwen2.5-Omni-7B", group:"Open-source models", single:[12.50,91.18,84.91,98.83,51.88], dual:[12.66,88.33,83.58,34.30,48.59], spatialsceneqa:[40.26,27.57], sls:[11.99,90.65,12.96,31.16]},
  {name:"InternOmni", group:"Open-source models", single:[12.81,93.72,22.65,40.58,8.13], dual:[12.34,92.90,32.51,43.16,5.94], spatialsceneqa:[69.09,27.55], sls:[12.98,89.23,53.73,7.88]},
  {name:"Phi-4-MM-5.6B", group:"Open-source models", single:[13.44,81.21,3.29,1.93,6.25], dual:[12.66,79.90,4.13,2.27,5.31], spatialsceneqa:[58.96,17.00], sls:[12.50,90.86,7.02,0.94]},
  {name:"Audio Flamingo 3", group:"Open-source models", single:[14.06,85.62,9.60,2.41,7.81], dual:[12.34,88.80,17.32,3.12,5.16], spatialsceneqa:[143.12,24.35], sls:[12.32,89.47,13.24,3.35]},
  {name:"Kimi-Audio-7B-Instruct", group:"Open-source models", single:[12.50,91.78,1.58,2.20,35.31], dual:[11.72,92.23,3.89,1.54,23.75], spatialsceneqa:[60.52,19.83], sls:[11.83,90.80,8.22,3.91]},
  {name:"BAT", group:"Spatial baselines", single:[8.75,87.51,0.94,0.68,51.25], dual:[11.09,90.34,0.95,0.64,52.66], spatialsceneqa:[136.97,14.42], sls:[12.65,90.32,7.07,0.84]},
  {name:"Classical-IV", group:"Spatial baselines", single:[29.38,47.92,1.14,0.58,51.56], dual:[20.94,66.06,1.08,0.62,52.66], spatialsceneqa:[71.72,16.22], sls:[13.72,74.59,8.24,1.35]},
  {name:"Neural-IV", group:"Spatial baselines", single:[10.63,84.00,0.99,0.59,50.31], dual:[11.88,87.83,1.21,0.67,52.34], spatialsceneqa:[117.88,14.60], sls:[12.66,89.95,8.40,1.35]},
  {name:"Spatial-Omni", group:"Spatial baselines", single:[43.75,46.87,1.57,1.36,49.06], dual:[26.09,62.40,1.12,3.08,50.94], spatialsceneqa:[84.03,30.63], sls:[9.36,94.22,8.67,5.02]},
  {name:"SonicWorld", group:"SonicWorld", single:[50.00,30.85,0.91,0.56,52.50], dual:[27.03,56.59,0.93,0.60,53.91], spatialsceneqa:[49.35,23.12], sls:[72.39,20.88,7.09,2.40]},
];

function renderResults(setting) {
  const rows = results.filter(row => row[setting]);
  const sonic = setting === "single" || setting === "dual";
  const angularOnly = setting === "spatialsceneqa";
  const labels = angularOnly ? ["Model", "Az. &darr;", "El. &darr;"] : ["Model", "Dir. &uarr;", "Az. &darr;", "El. &darr;", "Dist. &darr;"];
  if (sonic) labels.push("Mot. &uarr;");
  const columns = labels.length - 1;
  const best = Array.from({length:columns}, (_, col) =>
    (!angularOnly && (col === 0 || col === 4) ? Math.max : Math.min)(...rows.map(row => row[setting][col])));
  document.getElementById("results-head").innerHTML = "<tr>" + labels.map(label => `<th scope="col">${label}</th>`).join("") + "</tr>";
  let previousGroup = "";
  document.getElementById("results-body").innerHTML = rows.map(row => {
    let group = "";
    if (row.group !== previousGroup && row.name !== "SonicWorld") {
      group = `<tr class="group-row"><th colspan="${labels.length}" scope="colgroup">${row.group}</th></tr>`;
    }
    previousGroup = row.group;
    return group + `<tr class="${row.name === "SonicWorld" ? "ours" : ""}"><td>${row.name}</td>` +
      row[setting].map((value, col) => `<td class="${value === best[col] ? "best" : ""}">${value.toFixed(2)}</td>`).join("") + "</tr>";
  }).join("");
  document.getElementById("table-source").textContent = sonic ? "Sonic-Bench - Table 1" : `${angularOnly ? "SpatialSceneQA" : "SLS"} - Table 2`;
  document.getElementById("results-caption").textContent = sonic ? `${setting === "single" ? "Single" : "Dual"}-source results on Sonic-Bench` : `Zero-shot results on ${angularOnly ? "SpatialSceneQA" : "Spatial LibriSpeech"}`;
  document.getElementById("results-panel").setAttribute("aria-labelledby", `result-${sonic ? "sonic" : setting}`);
  document.getElementById("results-table").dataset.setting = setting;
  const descriptions = {
    single: "Sonic-Bench: 160 single-source test clips, covering localization and movement reasoning.",
    dual: "Sonic-Bench: 320 dual-source test clips, covering target-specific localization and movement reasoning.",
    spatialsceneqa: "Zero-shot angular localization on 622 selected static-source clips: 247 single-source and 375 dual-source recordings, with 1,244 questions.",
    sls: "Zero-shot localization on 8,512 selected single-source clips, with 34,048 questions about direction, azimuth, elevation, and distance."
  };
  document.getElementById("result-description").textContent = descriptions[setting];
  document.getElementById("metric-note").textContent = angularOnly
    ? "Az. and El. are mean absolute errors in degrees (lower is better). Bold indicates the best value in each metric."
    : `Dir.${sonic ? " and Mot. are accuracies" : " is accuracy"} (%); Az. and El. are MAE in degrees; Dist. is MAE (m). Bold indicates the best value in each metric.`;
}

function wireTabs(attribute, callback) {
  const tabs = Array.from(document.querySelectorAll(`[${attribute}]`));
  function select(tab, focus) {
    tabs.forEach(item => {
      item.setAttribute("aria-selected", String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    callback(tab.getAttribute(attribute));
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
    });
  });
}
let currentDataset = "sonic";
const resultSource = document.getElementById("result-source");
function selectResultDataset(dataset) {
  currentDataset = dataset;
  document.getElementById("result-source-wrap").hidden = dataset !== "sonic";
  renderResults(dataset === "sonic" ? resultSource.value : dataset);
}
wireTabs("data-result", selectResultDataset);
resultSource.addEventListener("change", () => {
  if (currentDataset === "sonic") renderResults(resultSource.value);
});
selectResultDataset("sonic");

const cases = {
  motion: [{image:"motion-cases", title:"Source-specific movement reasoning", width:2401, height:704,
    label:"Single- and dual-source examples", caption:"SonicWorld correctly predicts Front-Left for the male target and Back-Right for the female target in the queried intervals.",
    description:"Orange marks the queried intervals. Source identity and temporal context distinguish the target's movement from that of another speaker."}],
  decoded: [
    {image:"decoded-single", title:"Decoded states of a single moving source", width:2401, height:1503, label:"Single moving source", caption:"A single source's decoded trajectory and receiver-centered coordinates, compared with ground truth (Figure E.3).", description:"Solid lines show decoded trajectories; dashed lines show ground truth. Circles and triangles mark trajectory starts and ends."},
    {image:"decoded-dual", title:"Decoded states of two moving sources", width:2401, height:1503, label:"Two moving sources", caption:"Two simultaneously moving speakers represented in separate source slots (Figure E.4).", description:"Colors distinguish the sources. The front-coordinate plots preserve their different temporal trends."},
    {image:"decoded-mixed", title:"Decoded states of moving and stationary sources", width:2401, height:1503, label:"Moving + stationary sources", caption:"A moving source and a stationary source recovered from the same mixture (Figure E.5).", description:"The source-state trajectories distinguish a changing source position from the nearly constant position of the other speaker."},
  ],
  pauses: [
    {image:"pause-stationary", title:"Speech pause with a stationary interferer", width:2401, height:1359, label:"Stationary interferer", caption:"The target continues moving during a speech pause from 2.58 to 5.08 seconds (Figure E.6).", description:"Blue, gold, and green mark before, during, and after the pause. A and B mark pause onset and speech resumption; the right panels show speech activity, coordinates, and position error."},
    {image:"pause-moving", title:"Speech pause with a moving interferer", width:2401, height:1343, label:"Moving interferer", caption:"Both speakers continue moving during the target's 1.08-second pause, from 6.75 to 7.83 seconds (Figure E.7).", description:"The source-state model uses the complete clip with bidirectional refinement to connect the target's trajectory before and after the speech pause."},
  ],
};
let currentGroup = "motion";
const caseSelector = document.getElementById("case-selector");
function renderCase(index) {
  const scene = cases[currentGroup][index];
  const image = document.getElementById("case-image");
  image.src = `assets/${scene.image}.webp`;
  image.alt = scene.title;
  image.width = scene.width;
  image.height = scene.height;
  document.getElementById("case-caption").textContent = scene.caption;
  document.getElementById("case-description").textContent = scene.description;
  const zoom = document.getElementById("case-zoom");
  zoom.dataset.zoom = image.getAttribute("src");
  zoom.dataset.title = scene.title;
  zoom.setAttribute("aria-label", `Enlarge ${scene.title}`);
}
function selectCaseGroup(group) {
  currentGroup = group;
  document.getElementById("case-selector-wrap").hidden = cases[group].length === 1;
  caseSelector.replaceChildren(...cases[group].map((scene, index) => new Option(scene.label, String(index))));
  document.getElementById("case-panel").setAttribute("aria-labelledby", `case-${group}`);
  renderCase(0);
}
wireTabs("data-case", selectCaseGroup);
caseSelector.addEventListener("change", () => renderCase(Number(caseSelector.value)));
selectCaseGroup("motion");

document.getElementById("copy-citation").addEventListener("click", async () => {
  const text = document.getElementById("bibtex").textContent;
  let copied = false;
  try {
    if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch (_) {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    copied = document.execCommand("copy");
    temporary.remove();
  }
  const label = document.querySelector("#copy-citation span");
  label.textContent = copied ? "Copied" : "Select text";
  document.getElementById("copy-status").textContent = copied ? "Citation copied to clipboard." : "Select the citation text to copy it.";
  if (!copied) {
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("bibtex"));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  setTimeout(() => { label.textContent = "Copy"; }, 2000);
});

const navLinks = Array.from(document.querySelectorAll(".section-nav a"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio);
    if (!visible.length) return;
    navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${visible[0].target.id}`));
  }, {rootMargin:"-15% 0px -65% 0px", threshold:[0,0.1,0.5]});
  document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
}
refreshIcons();
