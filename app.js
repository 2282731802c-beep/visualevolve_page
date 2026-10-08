"use strict";
// Paper Table 1. Keep reported macro-averages, rather than recomputing rounded entries.
const results = {
  "Qwen3.5-Plus": {
    single: [83.8,84.4,80.0,66.7,37.7,35.8,64.7],
    initial: [86.4,87.0,83.3,68.1,48.1,39.6,68.8],
    evolved: [92.1,91.0,90.0,77.3,60.4,54.7,77.6]
  },
  "Qwen3.6-Plus": {
    single: [88.0,87.8,84.1,58.9,34.7,31.1,64.1],
    initial: [90.6,88.5,87.4,66.7,53.4,36.8,70.6],
    evolved: [91.1,92.0,90.9,73.8,58.2,50.0,76.0]
  },
  "Kimi-K2.5": {
    single: [82.7,79.8,75.8,50.4,32.1,24.5,57.6],
    initial: [85.3,88.5,81.5,70.9,54.1,35.8,69.4],
    evolved: [89.0,89.5,85.5,70.9,60.1,49.1,74.0]
  },
  "Doubao-Seed-2.0-Pro": {
    single: [88.5,83.3,76.5,60.3,36.2,29.2,62.3],
    initial: [89.5,86.8,86.0,75.9,59.0,42.5,73.3],
    evolved: [90.6,89.4,89.0,79.4,63.8,50.9,77.2]
  }
};
const benchmarks = ["V*Bench","HRBench 4K","HRBench 8K","VisualProbe Easy","VisualProbe Medium","VisualProbe Hard"];
const $ = id => document.getElementById(id);
const text = (id,value) => { $(id).textContent = value; };
const formatGain = value => value === 0 ? "No change" : "+" + value.toFixed(1) + " pp";
function renderResults(model) {
  const data = results[model];
  $("results-chart").replaceChildren(...benchmarks.map((name,i) => {
    const item = document.createElement("div");
    item.className = "benchmark";
    const gain = +(data.evolved[i] - data.initial[i]).toFixed(1);
    item.innerHTML = '<div class="benchmark-head"><span>' + name + '</span><span class="benchmark-gain">' + formatGain(gain) + '</span></div>';
    for (const [kind,label] of [["initial","Initial Skill Library"],["evolved","VisualEvolve"]]) {
      const line = document.createElement("div");
      line.className = "bar-line";
      line.setAttribute("aria-label",label + ": " + data[kind][i].toFixed(1) + "%");
      line.innerHTML = '<div class="bar-track" aria-hidden="true"><div class="bar '+kind+'" style="width:'+data[kind][i]+'%"></div></div><span class="bar-value">'+data[kind][i].toFixed(1)+'</span>';
      item.append(line);
    }
    return item;
  }));
  $("results-chart").setAttribute("aria-label",model + " benchmark comparison; each bar uses a 0 to 100% scale.");
  text("macro-before",data.initial[6].toFixed(1));
  text("macro-after",data.evolved[6].toFixed(1));
  text("macro-gain",formatGain(+(data.evolved[6]-data.initial[6]).toFixed(1)));
}
renderResults($("backbone").value);
$("backbone").addEventListener("change",e => renderResults(e.target.value));
// Verbatim Introduction stage descriptions; list separators are rendered as sentence endings.
const stages = {
  "select": "To limit the propagation of performance regressions, <strong>Skill-Library Snapshot Selection</strong> guides the agent to choose a starting library from archived snapshots based on <strong>validation performance</strong>.",
  "execute": "The selected library is applied to visual reasoning tasks, producing <strong>execution trajectories, correctness labels, and Trajectory Summaries</strong> for capability-gap diagnosis.",
  "evolve": "To address evolution evidence overload, we introduce <strong>Progressive Evidence Access (PEA)</strong>, which guides capability-gap diagnosis through <strong>coarse-to-fine access</strong> to skill evolution history and current execution evidence. These diagnoses guide revisions to the skill library.",
  "evaluate": "The revised library is assessed on a <strong>fixed validation set disjoint from the execution tasks</strong> and archived as a new snapshot. The resulting <strong>validation feedback and updated evolution records</strong> support subsequent snapshot selection and capability-gap diagnosis."
};
const cases = {
  composition: {title:"Recover a readable chart.",description:"The CodeVision-evolved library handles a chart that is both upside down and mirrored by composing newly discovered visual operations.",steps:[["Inspect","Load the measure skill and recognize the transformations."],["Transform","Compose rotate and flip operations to recover a readable chart."],["Answer","Extract the corrected values and compute the requested result."]],image:"assets/case-composition.webp",width:1303,height:2100,page:28,caption:"Figure 8. Visual-operation expansion and composition, from the paper's Case Studies appendix."},
  inspection: {title:"Find the right book, one crop at a time.",description:"The evolved library combines read_text guidance with progressively tighter crops to locate and verify a book title in a crowded bookshelf image.",steps:[["Locate","Use the read_text skill to guide the search toward the relevant bookshelf region."],["Refine","Crop progressively tighter regions to gather readable visual evidence."],["Verify","Check the target book spine before returning the answer."]],image:"assets/case-inspection.webp",width:1346,height:1828,page:29,caption:"Figure 9. Iterative local inspection and verification, from the paper's Case Studies appendix."}
};
// Examples use only configuration fields and the entry point in the released repository.
const integrationScenarios = {
  "model": {
    "title": "Same domain, a different model.",
    "description": "Switch the task-solving model through configuration.",
    "steps": [
      [
        "Choose the task-solving model",
        "Set <code>worker_model</code> to the model ID supplied by your API provider. Choose a model that supports the target task’s inputs and tool use."
      ],
      [
        "Connect the API",
        "For a new provider, update <code>base_url</code> and <code>api_key_env</code>, set compatible model IDs for the agent roles, and add the required API keys to <code>.env</code>."
      ],
      [
        "Run skill evolution",
        "Create a configuration from the released defaults, then run the same evolution entry point with the new configuration."
      ]
    ],
    "code": "import json\nfrom pathlib import Path\n\ncfg = json.loads(Path(\"configs/default.json\").read_text())\ncfg[\"worker_model\"] = \"qwen3.6-plus\"\n\n# If changing API providers, also configure:\n# cfg[\"base_url\"] = \"https://<provider>/v1\"\n# cfg[\"api_key_env\"] = \"MODEL_API_KEY\"\n\nPath(\"configs/model.json\").write_text(\n    json.dumps(cfg, indent=2) + \"\\n\"\n)",
    "language": "PYTHON · CREATE MODEL CONFIG",
    "footnote": "Example model ID: qwen3.6-plus. Replace it with a model available at your endpoint. The other role settings are inherited from configs/default.json.",
    "command": "python run_evolution.py --config configs/model.json"
  },
  "task": {
    "title": "A new domain, a tailored skill library.",
    "description": "Adapt the skill-evolution cycle to different domains, such as mathematical reasoning and coding, by providing domain-specific data, initial skills, and task instructions.",
    "steps": [
      [
        "Prepare domain-specific data",
        "Prepare task inputs, reference answers, and source labels."
      ],
      [
        "Define the initial skills",
        "Add domain-specific <code>SKILL.md</code> files and optional scripts under <code>initial_skills/</code>."
      ],
      [
        "Align task instructions",
        "Match the Worker’s task instructions to the target domain."
      ]
    ],
    "code": "import json\nfrom pathlib import Path\n\ncfg = json.loads(Path(\"configs/default.json\").read_text())\ncfg.update({\n    \"execution_dataset_file\": \"datasets/my_task_train.json\",\n    \"execution_dataset_root\": \".\",\n    \"execution_active_sources\": [\"my_task\"],\n    \"validation_dataset_file\": \"datasets/my_task_valid.json\",\n    \"validation_dataset_root\": \".\",\n    \"validation_active_sources\": [\"my_task\"],\n    \"execute_num_samples\": 32,\n    \"benchmark_total_samples\": 200,\n})\nPath(\"configs/my_task.json\").write_text(\n    json.dumps(cfg, indent=2) + \"\\n\"\n)",
    "language": "PYTHON · CREATE TASK CONFIG",
    "footnote": "The example selects 32 execution tasks per round and a fixed validation set of 200. Adjust these counts to the available data; validation IDs are excluded from execution.",
    "command": "python run_evolution.py --config configs/my_task.json"
  }
};
function bindTabs(selector,attribute,panelId,update) {
  const list=document.querySelector(selector);
  const buttons=[...list.querySelectorAll('[role="tab"]')];
  function activate(button,focus=false) {
    for(const other of buttons) {
      const active=other===button;
      other.classList.toggle("active",active);
      other.setAttribute("aria-selected",String(active));
      other.tabIndex=active?0:-1;
    }
    $(panelId).setAttribute("aria-labelledby",button.id);
    update(button.dataset[attribute]);
    if(focus) button.focus();
  }
  for(const button of buttons) button.addEventListener("click",()=>activate(button));
  list.addEventListener("keydown",e=>{
    let i=buttons.indexOf(document.activeElement);
    if(i<0) return;
    if(e.key==="ArrowRight") i=(i+1)%buttons.length;
    else if(e.key==="ArrowLeft") i=(i-1+buttons.length)%buttons.length;
    else if(e.key==="Home") i=0;
    else if(e.key==="End") i=buttons.length-1;
    else return;
    e.preventDefault();activate(buttons[i],true);
  });
}
bindTabs(".cycle-tabs","stage","stage-panel",key=>{
  $("stage-description").innerHTML=stages[key];
  $("stage-panel").dataset.stage=key;
});
bindTabs(".case-tabs","case","case-panel",key=>{
  const c=cases[key];
  text("case-title",c.title);text("case-description",c.description);
  $("case-steps").innerHTML=c.steps.map(([title,description],i)=>'<li><span>0'+(i+1)+'</span><div><strong>'+title+'</strong><p>'+description+'</p></div></li>').join("");
  $("case-image").src=c.image;$("case-image").alt=c.caption;
  $("case-image").width=c.width;$("case-image").height=c.height;
  $("case-figure-zoom").dataset.zoom=c.image;$("case-figure-zoom").dataset.caption=c.caption;
  $("case-paper").href="assets/paper.pdf?v=ceed38a8e94a#page="+c.page;
});
bindTabs(".code-tabs","code","code-panel",key=>{
  const scenario=integrationScenarios[key];
  text("integration-scenario",scenario.title);
  text("integration-summary",scenario.description);
  $("integration-steps").innerHTML=scenario.steps.map(([title,description],i)=>'<li><span class="integration-step-number">0'+(i+1)+'</span><div><h4>'+title+'</h4><p>'+description+'</p></div></li>').join("");
  text("integration-code",scenario.code);
  text("code-language",scenario.language);
  text("code-footnote",scenario.footnote);
  text("integration-command",scenario.command);
  $("code-panel").dataset.scenario=key;
});
const menu=document.querySelector(".menu-toggle"),nav=$("nav-links");
menu.addEventListener("click",()=>{
  const opened=menu.getAttribute("aria-expanded")==="true";
  menu.setAttribute("aria-expanded",String(!opened));nav.classList.toggle("open",!opened);
});
for(const link of nav.querySelectorAll("a")) link.addEventListener("click",()=>{menu.setAttribute("aria-expanded","false");nav.classList.remove("open");});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){menu.setAttribute("aria-expanded","false");nav.classList.remove("open");}});
const observer=new IntersectionObserver(entries=>{
  for(const entry of entries) if(entry.isIntersecting) {
    for(const a of nav.querySelectorAll('a[href^="#"]')) {
      const active=a.dataset.sections ? a.dataset.sections.split(" ").includes(entry.target.id) : a.hash==="#"+entry.target.id;
      a.classList.toggle("current",active);
      if(active) a.setAttribute("aria-current","location");else a.removeAttribute("aria-current");
    }
  }
},{rootMargin:"-15% 0px -55% 0px",threshold:0});
document.querySelectorAll("main section[id]").forEach(section=>observer.observe(section));
const dialog=$("image-dialog");
let opener=null;
for(const button of document.querySelectorAll("[data-zoom]")) button.addEventListener("click",()=>{
  opener=button;dialog.classList.remove("full-size");
  $("dialog-image").src=button.dataset.zoom;$("dialog-image").alt=button.dataset.caption;
  text("dialog-caption",button.dataset.caption);
  dialog.showModal();document.body.classList.add("dialog-open");$("dialog-close").focus();
});
$("dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener("close",()=>{document.body.classList.remove("dialog-open");opener?.focus({preventScroll:true});});
$("dialog-image").addEventListener("click",()=>dialog.classList.toggle("full-size"));
let toastTimer;
function toast(message){text("toast",message);$("toast").classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("visible"),2400);}
async function copyText(value) {
  if(navigator.clipboard&&window.isSecureContext) {
    try{await navigator.clipboard.writeText(value);return true;}catch(_){/* Use selection fallback for local-file previews. */}
  }
  const area=document.createElement("textarea");area.value=value;area.style.position="fixed";area.style.left="-9999px";document.body.append(area);area.select();
  const ok=document.execCommand("copy");area.remove();return ok;
}
for(const button of document.querySelectorAll("[data-copy]")) button.addEventListener("click",async()=>{
  const content=$(button.dataset.copy).textContent;
  try{
    const ok=await copyText(content);
    toast(ok?"Copied to clipboard.":"Copy unavailable. Select the text and copy manually.");
    button.focus({preventScroll:true});
  }catch(_){toast("Select the text and copy manually.");}
});

const header=document.querySelector('.site-header');
function updateHeader(){header.classList.toggle('scrolled',window.scrollY>60);}
window.addEventListener('scroll',updateHeader,{passive:true});updateHeader();

