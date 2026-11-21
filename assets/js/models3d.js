// 3D model viewer — real downloaded GLB anatomy + procedural 3D scenes
import * as THREE from 'three';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '../vendor/three/meshopt_decoder.module.js';
import { RoomEnvironment } from '../vendor/three/environments/RoomEnvironment.js';

const DIR = 'assets/vendor/three/';
const CATALOG = DIR + 'catalog.json';

let loader = null;
const glbCache = {};
const catalogCache = {};

function getLoader() {
  if (!loader) {
    loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  return loader;
}

export async function getCatalog() {
  if (!catalogCache.list) {
    const r = await fetch(CATALOG);
    const list = await r.json();
    catalogCache.list = list;
    catalogCache.map = {};
    list.forEach(function (x) { catalogCache.map[x.key] = x; });
  }
  return catalogCache;
}

export async function loadAnatomy(which) {
  if (glbCache[which]) return glbCache[which];
  const res = await new Promise(function (resolve, reject) {
    getLoader().load(DIR + 'models/anatomy-' + which + '.glb', resolve, undefined, reject);
  });
  const root = res.scene;
  const map = {};
  root.traverse(function (o) {
    if (o.isMesh) {
      const k = String(o.name).replace(/[._]\d+$/, '');
      map[k] = map[k] || [];
      map[k].push(o);
      o.userData.key = k;
    }
  });
  glbCache[which] = { root: root, map: map };
  return glbCache[which];
}

function applyEnv(renderer, scene) {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
    scene.environment = env;
    pmrem.dispose();
  } catch (e) { /* env optional */ }
}

function baseScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 1.15);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x93c5fd, 0.7);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  return scene;
}

function frameCamera(camera, controls, obj, dist) {
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length() || 1;
  const d = dist || size * 1.5;
  camera.position.set(c.x + d * 0.6, c.y + d * 0.35, c.z + d);
  camera.near = size / 100;
  camera.far = size * 40;
  camera.updateProjectionMatrix();
  controls.target.copy(c);
  controls.update();
}

// ---------- viewer ----------
export const Viewer = {
  active: null,

  mount: function (container, opts) {
    this.dispose();
    // Low-end phone? — antialias band + pixel ratio 1 (battery + memory bache)
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var lowEnd = (cores <= 4 && mem <= 4) || mem <= 2;
    var state = {
      container: container,
      renderer: new THREE.WebGLRenderer({ antialias: !lowEnd, alpha: true, powerPreference: lowEnd ? 'low-power' : 'default' }),
      scene: null,
      camera: new THREE.PerspectiveCamera(45, 1, 0.01, 4000),
      controls: null,
      raf: 0,
      meshes: [],
      keys: {},
      opts: opts || {},
      pick: opts.pick || function (key) { return null; },
      labels: opts.labels || {},
      highlight: opts.highlight == null ? '#38bdf8' : opts.highlight,
      isScene: false,
      lowEnd: lowEnd
    };
    state.renderer.setPixelRatio(lowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    state.renderer.toneMappingExposure = 0.85;
    state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    state.renderer.domElement.style.width = '100%';
    state.renderer.domElement.style.height = '100%';
    state.renderer.domElement.style.display = 'block';
    state.renderer.domElement.style.touchAction = 'none';
    container.appendChild(state.renderer.domElement);

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0b1220);

    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.08;
    state.controls.rotateSpeed = 0.8;

    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    let down = null;
    const el = state.renderer.domElement;
    el.addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', function (e) {
      if (!down) return;
      const dx = e.clientX - down[0], dy = e.clientY - down[1];
      down = null;
      if (dx * dx + dy * dy > 49) return;
      const r = el.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, state.camera);
      const hits = ray.intersectObjects(state.meshes, false);
      if (!hits.length) return;
      const key = hits[0].object.userData.key;
      if (key) select(key, hits[0].point);
    });

    function select(key, point) {
      state.meshes.forEach(function (m) {
        if (!m.material || !m.material.emissive) return;
        const on = m.userData.key === key;
        if (on) {
          m.material.emissive.set(m.material.color);
          m.material.emissiveIntensity = 0.3;
        } else {
          m.material.emissive.set(0x000000);
          m.material.emissiveIntensity = 0;
        }
      });
      if (opts.onSelect) opts.onSelect(key, point, state.keys[key]);
    }
    state.select = select;

    function resize() {
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      state.renderer.setSize(w, h, false);
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
    }
    state.resize = resize;
    resize();
    window.addEventListener('resize', resize);

    const loop = function () {
      state.raf = requestAnimationFrame(loop);
      state.controls.update();
      state.renderer.render(state.scene, state.camera);
    };
    loop();

    this.active = state;
    return state;
  },

  setScene: function (scene, meshes, keys) {
    const s = this.active;
    if (!s) return;
    s.scene = scene;
    s.meshes = meshes || [];
    s.keys = keys || {};
    applyEnv(s.renderer, scene);
    if (opts_frame(s)) opts_frame(s);
    function opts_frame(st) { frameCamera(st.camera, st.controls, scene, st.opts.dist); return true; }
    s.resize();
  },

  frameFlat: function (c, size) {
    const s = this.active;
    if (!s) return;
    const d = size * 0.75;
    s.camera.position.set(c.x, 0, d);
    s.camera.near = 0.01;
    s.camera.far = size * 40;
    s.camera.updateProjectionMatrix();
    s.controls.target.set(c.x, 0, 0);
    s.controls.update();
  },

  focusKey: function (key) {
    const s = this.active;
    if (!s) return;
    const list = s.keys[key] || [];
    if (!list.length) return;
    const box = new THREE.Box3();
    list.forEach(function (m) { box.expandByObject(m); });
    const c = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length() || 1;
    s.camera.position.set(c.x + size * 0.9, c.y + size * 0.5, c.z + size * 1.2);
    s.controls.target.copy(c);
    s.controls.update();
    s.select(key);
  },

  setVisible: function (key, on) {
    const s = this.active;
    if (!s) return;
    (s.keys[key] || []).forEach(function (m) { m.visible = on; });
  },

  dispose: function () {
    const s = this.active;
    if (!s) return;
    cancelAnimationFrame(s.raf);
    window.removeEventListener('resize', s.resize);
    // poori memory free karo — geometries, materials, textures
    if (s.scene) {
      s.scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        var mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        mats.forEach(function (m) {
          if (!m) return;
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'envMap'].forEach(function (k) {
            if (m[k]) { try { m[k].dispose(); } catch (e) {} }
          });
          try { m.dispose(); } catch (e) {}
        });
      });
    }
    s.controls.dispose();
    s.renderer.dispose();
    if (s.renderer.domElement.parentNode) s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
    this.active = null;
  },

  // Loading indicator — GLB load ke dauran dikhta hai
  setLoading: function (on, label) {
    const s = this.active;
    if (!s) return;
    var el = s.container && s.container.querySelector('.glb-load');
    if (!el) {
      el = document.createElement('div');
      el.className = 'glb-load';
      el.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(11,18,32,.72);color:#e2e8f0;font:600 14px/1.4 system-ui;z-index:5;text-align:center;padding:12px';
      s.container.style.position = 'relative';
      s.container.appendChild(el);
    }
    el.textContent = label || '3D model load ho रहा है…';
    el.style.display = on ? 'flex' : 'none';
  }
};

export { THREE };
