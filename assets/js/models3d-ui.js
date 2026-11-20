// 3D viewer UI — anatomy (real GLB) + procedural scenes
import { Viewer, loadAnatomy, getCatalog, THREE } from './models3d.js';
import * as SC from './scenes3d.js';

const CAT = window.MODELS3D || { biology: [], physics: [] };

function partInfo(item, key) {
  const p = item.parts && item.parts[key];
  if (p) return { hi: p.hi, desc: p.desc };
  const c = (window.__catMap || {})[key];
  if (c) return { hi: c.label, desc: c.system };
  return { hi: key, desc: '' };
}

function ensureCatalog() {
  if (window.__catMap) return Promise.resolve(window.__catMap);
  return getCatalog().then(function (c) {
    window.__catMap = c.map;
    return c.map;
  });
}

function buildScene(item) {
  const s = item.scene;
  const p = item.param;
  if (s === 'mirror') return SC.optics((p === 'convex' ? 'convex' : 'concave') + '-mirror', item.caseIdx || 0);
  if (s === 'lens') return SC.optics((p === 'concave' ? 'concave' : 'convex') + '-lens', item.caseIdx || 0);
  if (s === 'glassSlab') return SC.glassSlab();
  if (s === 'prism') return SC.prism(p === 'true');
  if (s === 'eyeDefect') return SC.eyeDefect(p || 'myopia');
  if (s === 'circuit') return SC.circuit(p || 'symbols');
  if (s === 'field') return SC.field(p || 'bar');
  return SC.bio(s);
}

function collectKeys(list) {
  const keys = {};
  list.forEach(function (m) {
    const k = m.userData && m.userData.key;
    if (!k) return;
    (keys[k] = keys[k] || []).push(m);
  });
  return keys;
}

const REAL = {
  skin: 0xd9a066, skull: 0xf3ead7, brain: 0xd99a92, cerebellum: 0xc97f7f, brainstem: 0xd9b48f, pituitary: 0xb03a2e,
  heart: 0x9e2b25, lung_l: 0xe8a2ab, lung_r: 0xe8a2ab, liver: 0x7a3b3b, gallbladder: 0x4f7a3a, stomach: 0xd98c7a,
  pancreas: 0xe0c080, small_intestine: 0xe0a890, colon: 0xc98f7a, appendix: 0xd97a6a, esophagus: 0xd9a08f,
  spleen: 0x6b2d3b, thymus: 0xe0b0a0, adrenal_l: 0xd9b04a, adrenal_r: 0xd9b04a,
  kidney_l: 0x8e3b3b, kidney_r: 0x8e3b3b, ureter_l: 0xd9c48f, ureter_r: 0xd9c48f, bladder: 0xe6d3a3,
  eye_l: 0xf2f2f2, eye_r: 0xf2f2f2, reproductive: 0xc05a7a, prostate: 0xd9a0a0,
  uterus: 0xd9778b, ovary_l: 0xe0a0b0, ovary_r: 0xe0a0b0, fallopian_tubes: 0xe0909a, vagina: 0xc98a94,
  breast_l: 0xe8c39e, breast_r: 0xe8c39e, trachea: 0xd9c9a0, bronchi: 0xc9b48f, larynx: 0xd9b48f,
  tongue: 0xc96a6a, salivary_glands: 0xe0c080, pharynx: 0xd9a08f, aorta: 0xc0392b,
  vena_cava_superior: 0x3b6ea5, vena_cava_inferior: 0x3b6ea5, pulmonary_vessels: 0x7a4b8f,
  coronary_arteries: 0xd94f3d, arteries_head: 0xc0392b, veins_head: 0x3b6ea5,
  femur_l: 0xf3ead7, humerus_l: 0xf3ead7, ribs_l: 0xf3ead7, sternum: 0xf3ead7, pelvis: 0xf3ead7,
  spinal_cord: 0xf0d9a0, cranial_nerves: 0xf0d9a0, diaphragm: 0xa83a3a
};
const SYS_COLOR = {
  skeleton: 0xf3ead7, muscles: 0xb03a3a, nerves: 0xf0d9a0, vessels: 0xc0392b,
  skin: 0xd9a066, joints: 0xd9c48f, organs: 0xd98c7a
};

function realColor(key, cat) {
  if (REAL[key] != null) return new THREE.Color(REAL[key]);
  if (cat && cat.color) return new THREE.Color(cat.color);
  const sys = (cat && cat.system) || 'organs';
  return new THREE.Color(SYS_COLOR[sys] || 0xd98c7a);
}

export async function renderInto(container, item) {
  await ensureCatalog();
  if (item.cases && item.cases.length) {
    const crow = document.createElement('div');
    crow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px';
    item.cases.forEach(function (c, i) {
      const b = document.createElement('button');
      b.className = 'fchip' + (i === (item.caseIdx || 0) ? ' on' : '');
      b.textContent = c.t;
      b.title = c.d;
      b.addEventListener('click', function () {
        if (item.caseIdx === i) return;
        item.caseIdx = i;
        window.Models3DUI.unmount();
        container.innerHTML = '';
        renderInto(container, item);
      });
      crow.appendChild(b);
    });
    container.insertBefore(crow, container.firstChild);
    const cnote = document.createElement('div');
    cnote.id = 'caseNote';
    cnote.style.cssText = 'font-size:13px;opacity:.85;margin-bottom:8px;line-height:1.5';
    cnote.textContent = item.cases[item.caseIdx || 0].d;
    container.insertBefore(cnote, container.firstChild);
    crow.addEventListener('click', function () {
      const on = crow.querySelector('.fchip.on');
      if (on) cnote.textContent = item.cases[Array.prototype.indexOf.call(crow.children, on)].d;
    });
  }
  const holder = document.createElement('div');
  holder.style.cssText = 'position:relative;width:100%;height:min(58vh,460px);border-radius:18px;overflow:hidden;background:#0b1220';
  container.appendChild(holder);

  const info = document.createElement('div');
  info.id = 'modelInfo';
  info.style.cssText = 'margin-top:12px;padding:14px 16px;border-radius:14px;background:var(--card);border:1px solid var(--line);display:none';
  container.appendChild(info);

  let state;
  try {
    state = Viewer.mount(holder, {
      highlight: '#38bdf8',
      onSelect: function (key, point, meshes) {
        const d = partInfo(item, key);
        info.style.display = 'block';
        info.innerHTML = '<div style="font-size:16px;font-weight:800;color:var(--accent)">' + esc(d.hi) + '</div>' +
          (d.desc ? '<div style="font-size:14px;margin-top:4px;line-height:1.6">' + esc(d.desc) + '</div>' : '');
        if (navigator.vibrate) navigator.vibrate(8);
      }
    });
  } catch (err) {
    holder.innerHTML = '<div class="empty" style="padding:28px 16px">' +
      '<b>3D इस ब्राउज़र में नहीं चल सका।</b><br>' +
      'WebGL ज़रूरी है — Chrome को WebGL flags के साथ खोलें।</div>';
    return;
  }

  let result;
  if (item.type === 'anatomy') {
    const loaded = await loadAnatomy(item.model);
    result = { scene: null, meshes: [], keys: {} };
    // hide everything, show only listed keys
    const root = loaded.root;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 0.7));
    const k = new THREE.DirectionalLight(0xffffff, 1.3);
    k.position.set(3, 6, 5);
    scene.add(k);
    const rim = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    const show = {};
    (item.keys || []).forEach(function (key) { show[key] = true; });
    root.traverse(function (o) {
      if (o.isMesh) {
        const key = o.userData.key;
        const on = !!show[key];
        o.visible = on;
        if (on) {
          if (o.material) {
            const cat = (window.__catMap || {})[key] || {};
            o.material = o.material.clone();
            if ('vertexColors' in o.material) o.material.vertexColors = false;
            o.material.color = realColor(key, cat);
            o.material.needsUpdate = true;
            const sys = cat.system || 'organs';
            if (sys === 'skeleton') { o.material.roughness = 0.55; o.material.metalness = 0.05; }
            else if (sys === 'muscles') { o.material.roughness = 0.45; o.material.metalness = 0.0; }
            else if (sys === 'vessels') { o.material.roughness = 0.28; o.material.metalness = 0.05; }
            else if (sys === 'nerves') { o.material.roughness = 0.35; o.material.metalness = 0.0; }
            else if (sys === 'skin') { o.material.roughness = 0.62; o.material.metalness = 0.0; }
            else { o.material.roughness = 0.4; o.material.metalness = 0.06; }
            o.material.emissive = new THREE.Color(0x000000);
          }
        }
      }
    });
    // attach the whole root (only visible meshes matter for raycast since we intersect only visible? raycaster hits invisible too)
    const meshes = [];
    root.traverse(function (o) { if (o.isMesh && o.visible) meshes.push(o); });
    const keys = {};
    meshes.forEach(function (m) { (keys[m.userData.key] = keys[m.userData.key] || []).push(m); });
    scene.add(root);
    Viewer.setScene(scene, meshes, keys);
    if (item.focus && keys[item.focus] && item.scene !== 'mirror' && item.scene !== 'lens') Viewer.focusKey(item.focus);
  } else {
    const built = buildScene(item);
    const keys = collectKeys(built.meshes);
    Viewer.setScene(built.scene, built.meshes, keys);
    if (item.scene === 'mirror' || item.scene === 'lens') {
      const bb = new THREE.Box3().setFromObject(built.scene);
      const cc = bb.getCenter(new THREE.Vector3());
      const sz = bb.getSize(new THREE.Vector3()).length() || 1;
      Viewer.frameFlat(cc, sz);
    } else if (item.focus && keys[item.focus]) {
      Viewer.focusKey(item.focus);
    }
  }

  // part chips
  const chips = document.createElement('div');
  chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-top:12px';
  const list = Object.keys(state.keys).filter(function (k) { return k !== 'label'; });
  list.forEach(function (key) {
    const d = partInfo(item, key);
    const b = document.createElement('button');
    b.className = 'fchip';
    b.textContent = d.hi;
    b.dataset.key = key;
    b.addEventListener('click', function () {
      Viewer.focusKey(key);
      chips.querySelectorAll('.fchip').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
    chips.appendChild(b);
  });
  container.appendChild(chips);

  await ensureCatalog();
  // refresh labels now that catalog is ready
  chips.querySelectorAll('.fchip').forEach(function (b) {
    const d = partInfo(item, b.dataset.key);
    b.textContent = d.hi;
  });

  cleanup = function () { Viewer.dispose(); };
  return cleanup;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let cleanup = null;
window.Models3DUI = {
  renderInto: renderInto,
  unmount: function () { if (cleanup) { cleanup(); cleanup = null; } }
};
if (window.BP) BP.render();
window.__viewer = Viewer;
