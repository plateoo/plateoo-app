// Chargement Firebase dynamique (fonctionne local + en ligne)
window.chefsData = [];
window.firebaseReady = false;

window.loadChefs = function() {
  if(window.renderPanelCards) renderPanelCards([]);
  if(window.updateBadge) updateBadge(0);
};
window.addChef = function(data) {
  showToast('⚠️ Firebase non disponible en local — uploadez sur plateoo.com');
};

function loadFirebase() {
  return new Promise((resolve) => {
    if(window.firebase) { resolve(); return; }
    const s1 = document.createElement('script');
    s1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js';
      s2.onload = () => {
        const s3 = document.createElement('script');
        s3.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
        s3.onload = resolve;
        s3.onerror = resolve;
        document.head.appendChild(s3);
      };
      s2.onerror = resolve;
      document.head.appendChild(s2);
    };
    s1.onerror = resolve;
    document.head.appendChild(s1);
  });
}

async function initFirebase() {
  await loadFirebase();
  if(!window.firebase) {
    console.log('Firebase non disponible (mode local)');
    return;
  }
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyD0iIAlDS0AvrMBAL-CuU5rn5M4b3aQDiE",
      authDomain: "plateoo.firebaseapp.com",
      projectId: "plateoo",
      storageBucket: "plateoo.firebasestorage.app",
      messagingSenderId: "981220168306",
      appId: "1:981220168306:web:471a2608565c8d9fb028eb"
    };
    if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    window.googleProvider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().onAuthStateChanged((user) => {
      window.currentUser = user;
      if(user) {
        const modal = document.getElementById('authModal');
        if(modal) modal.classList.remove('show');
        const av = document.getElementById('userAvatar');
        if(av) av.textContent = user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase();
        window.loadChefs();
      }
    });

    window.loadChefs = async function() {
      try {
        const snap = await firebase.firestore().collection('chefs').get();
        const chefs = [];
        snap.forEach(d => chefs.push({id: d.id, ...d.data()}));
        window.chefsData = chefs;
        if(window.renderMapMarkers) renderMapMarkers(chefs);
        if(window.renderPanelCards) renderPanelCards(chefs);
        if(window.updateBadge) updateBadge(chefs.length);
      } catch(e) {
        window.chefsData = [];
        if(window.renderPanelCards) renderPanelCards([]);
        if(window.updateBadge) updateBadge(0);
      }
    };

    window.addChef = async function(chefData) {
      try {
        await firebase.firestore().collection('chefs').add({
          ...chefData,
          createdAt: new Date(),
          userId: firebase.auth().currentUser?.uid || 'admin',
          verified: false, rating: 5.0, orders: 0
        });
        showToast('✅ Chef ajouté sur la carte !');
        window.loadChefs();
      } catch(e) {
        showToast('❌ ' + e.message);
      }
    };

    window.firebaseReady = true;
    document.dispatchEvent(new Event('firebaseReady'));
  } catch(e) {
    console.log('Firebase error:', e.message);
  }
}

// Init Firebase après chargement page
document.addEventListener('DOMContentLoaded', initFirebase);

// ══ GLOBALS ══
let gmap, markers = [], infoWindow, panelUp = false;
let filters = { modes:[], cuisines:[], budget:30, rating:4.5, dist:99 };
let selChef = null;
let geocodeTimer = null;
window.chefsData = [];


// ══ SPLASH ANIMATION ══
function hideSplash() {
  document.getElementById('loading').classList.add('hide');
  setTimeout(() => {
    if(!window.currentUser) document.getElementById('authModal').classList.add('show');
  }, 180);
}

function runSplashAnimation() {
  const phase1 = document.getElementById('splashPhase1');
  const phase2 = document.getElementById('splashPhase2');
  const fullname = document.getElementById('splashFullname');
  const leftSetting = document.getElementById('placeSettingLeft');
  const rightSetting = document.getElementById('placeSettingRight');
  const forkEl = document.getElementById('forkEl');
  const knifeLeft = document.getElementById('knifeLeft');
  const forkRight = document.getElementById('forkRight');
  const knifeEl = document.getElementById('knifeEl');
  const tableLine = document.getElementById('tableLine');
  const tableRunner = document.getElementById('tableRunner');
  const tableStage = document.getElementById('tableStage');
  const tableTop = document.getElementById('tableTop');
  const glassLeft = document.getElementById('glassLeft');
  const glassRight = document.getElementById('glassRight');
  const splashTag = document.getElementById('splashTag');
  const splashDots = document.getElementById('splashDots');

  setTimeout(() => {
    fullname?.classList.add('focus-oo');
  }, 1050);

  setTimeout(() => {
    phase2?.classList.add('ready');
  }, 1500);

  setTimeout(() => {
    if(tableStage) {
      tableStage.style.opacity = '1';
      tableStage.style.transform = 'translateY(0) scale(1)';
    }
    if(tableTop) {
      tableTop.style.opacity = '1';
      tableTop.style.transform = 'translateY(0)';
    }
    if(tableLine) {
      tableLine.style.opacity = '1';
      tableLine.style.transform = 'scaleX(1)';
    }
    if(tableRunner) {
      tableRunner.style.opacity = '1';
      tableRunner.style.transform = 'translateX(-50%) translateY(0)';
    }
  }, 1600);

  setTimeout(() => {
    leftSetting?.classList.add('show');
    rightSetting?.classList.add('show');
  }, 1730);

  setTimeout(() => {
    [glassLeft, glassRight].forEach(el => el?.classList.add('show'));
  }, 1960);

  setTimeout(() => {
    [forkEl, knifeLeft, forkRight, knifeEl].forEach(el => el?.classList.add('show'));
  }, 2050);

  setTimeout(() => {
    if(splashTag) splashTag.style.opacity = '1';
  }, 2140);

  setTimeout(() => {
    if(splashDots) splashDots.style.opacity = '1';
  }, 2240);

  setTimeout(() => {
    if(phase1) phase1.style.opacity = '0';
  }, 2320);

  setTimeout(() => {
    hideSplash();
  }, 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  runSplashAnimation();
});

// ══ CLOCK ══
function tick(){
  const n=new Date();
  const el=document.getElementById('clock');
  if(el) el.textContent=n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
}
tick(); setInterval(tick,30000);

// ══ GOOGLE MAPS INIT ══
window.initMap = function() {
  clearTimeout(window._mapsT);
  // Centre sur Liège, Belgique
  const center = { lat: 50.6326, lng: 5.5797 };

  gmap = new google.maps.Map(document.getElementById('map'), {
    center,
    zoom: 14,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    styles: [
      { featureType:'poi', elementType:'labels', stylers:[{visibility:'off'}] },
      { featureType:'transit', stylers:[{visibility:'off'}] },
      { featureType:'water', elementType:'geometry', stylers:[{color:'#B8D4E8'}] },
      { featureType:'landscape', elementType:'geometry', stylers:[{color:'#F2F4EE'}] },
      { featureType:'road.highway', elementType:'geometry', stylers:[{color:'#FFFFFF'}] },
      { featureType:'road.arterial', elementType:'geometry', stylers:[{color:'#FFFFFF'}] },
      { featureType:'road.local', elementType:'geometry', stylers:[{color:'#F5F0E8'}] },
      { featureType:'administrative', elementType:'labels.text.fill', stylers:[{color:'#9A8A7A'}] },
    ]
  });

  window.gmap = gmap;
  infoWindow = new google.maps.InfoWindow();

  // Loading handled by splash animation
  clearTimeout(window._mapsT);

  // Load chefs once map ready
  document.addEventListener('firebaseReady', () => loadChefs());
  if(window.firebaseReady) loadChefs();
};

// ══ RENDER MARKERS ══
window.renderMapMarkers = function(chefs) {
  // Clear existing
  markers.forEach(m => m.setMap(null));
  markers = [];

  const cuisineEmojis = {
    maghreb:'🥘', africain:'🍲', asiatique:'🍜', europeen:'🥐',
    latino:'🌮', patisserie:'🧁', vegetarien:'🥗', oriental:'🌯'
  };

  chefs.forEach(chef => {
    if(!chef.lat || !chef.lng) return;

    // Custom marker SVG
    const emoji = chef.emoji || cuisineEmojis[chef.cuisine] || '🍽';
    const minPrice = chef.minPrice || 10;

    const markerEl = document.createElement('div');
    markerEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
    markerEl.innerHTML = `
      <div style="background:white;border-radius:22px;padding:7px 11px 7px 9px;display:flex;align-items:center;gap:5px;box-shadow:0 4px 16px rgba(44,24,16,0.2);border:2px solid rgba(44,24,16,0.06);">
        <span style="font-size:16px;">${emoji}</span>
        <span style="font-size:10px;font-weight:700;color:#2C1810;">${chef.name.split(' ')[0]}</span>
        <span style="font-size:10px;font-weight:600;color:#C0392B;">dès ${minPrice}€</span>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid white;margin-top:-1px;filter:drop-shadow(0 2px 2px rgba(44,24,16,0.1));"></div>
    `;

    const marker = new google.maps.Marker({
      position: { lat: parseFloat(chef.lat), lng: parseFloat(chef.lng) },
      map: gmap,
      title: chef.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="5" fill="transparent"/></svg>
        `),
        scaledSize: new google.maps.Size(1, 1)
      }
    });

    // Custom overlay for rich marker
    class CustomMarker extends google.maps.OverlayView {
      constructor(pos, chef) {
        super();
        this.pos = pos;
        this.chef = chef;
        this.div = null;
      }
      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = 'position:absolute;cursor:pointer;transform:translate(-50%,-100%);';
        const emoji = this.chef.emoji || cuisineEmojis[this.chef.cuisine] || '🍽';
        const mp = this.chef.minPrice || 10;
        this.div.innerHTML = `
          <div style="background:white;border-radius:22px;padding:7px 11px 7px 9px;display:flex;align-items:center;gap:5px;box-shadow:0 4px 16px rgba(44,24,16,0.2);border:1.5px solid rgba(44,24,16,0.06);transition:all .2s;">
            <span style="font-size:16px;">${emoji}</span>
            <span style="font-size:10px;font-weight:700;color:#2C1810;">${this.chef.name.split(' ')[0]}</span>
            <span style="font-size:10px;font-weight:600;color:#C0392B;">dès ${mp}€</span>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid white;margin:0 auto;"></div>
        `;
        this.div.addEventListener('click', () => selectChef(this.chef));
        this.getPanes().overlayMouseTarget.appendChild(this.div);
      }
      draw() {
        const p = this.getProjection().fromLatLngToDivPixel(this.pos);
        this.div.style.left = p.x + 'px';
        this.div.style.top = p.y + 'px';
      }
      onRemove() { this.div?.parentNode?.removeChild(this.div); this.div = null; }
    }

    marker.setMap(null); // remove invisible marker
    const overlay = new CustomMarker(
      new google.maps.LatLng(parseFloat(chef.lat), parseFloat(chef.lng)),
      chef
    );
    overlay.setMap(gmap);
    markers.push(overlay);
  });
};

// ══ PANEL CARDS ══
window.renderPanelCards = function(chefs) {
  const s = document.getElementById('panelScroll');
  if(!chefs.length) {
    s.innerHTML = `<div class="panel-empty"><div class="panel-empty-icon">😕</div><div class="panel-empty-title">Aucun chef trouvé</div><div class="panel-empty-sub">Modifiez vos filtres ou ajoutez le premier chef !</div></div>`;
    return;
  }
  const mIcons = {livraison:'🛵', emporter:'🏪', domicile:'👨‍🍳', table:'🍽'};
  s.innerHTML = chefs.map(c => {
    const mp = c.minPrice || 10;
    const isSel = selChef?.id === c.id;
    return `<div class="hcard ${isSel?'sel':''}" onclick="selectChef(${JSON.stringify(c).replace(/"/g,'&quot;')})">
      <div class="hcard-img" style="background:${c.bgColor||'#FFF3E0'};">
        ${c.photoUrl ? `<img src="${c.photoUrl}" alt="${c.name}">` : `<div class="hcard-img-fallback">${c.emoji||'🍽'}</div>`}
        <div class="hcard-badge">✅ Vérifié</div>
        <div class="hcard-mode">${(c.modes||[]).slice(0,2).map(m=>`<div class="hcard-mode-dot">${mIcons[m]||m}</div>`).join('')}</div>
      </div>
      <div class="hcard-body">
        <div class="hcard-name">${c.name}</div>
        <div class="hcard-cuisine">${c.description||c.cuisine}</div>
        <div class="hcard-row">
          <div class="hcard-meta">⭐ ${c.rating||'5.0'} · 📦 ${c.orders||0}</div>
          <div class="hcard-price">dès ${mp}€</div>
        </div>
      </div>
    </div>`;
  }).join('');
};

window.updateBadge = function(n) {
  document.getElementById('resultsBadge').textContent = n + ' chef' + (n>1?'s':'') + ' trouvé' + (n>1?'s':'');
};

// ══ SELECT CHEF ══
function selectChef(chef) {
  if(typeof chef === 'string') chef = JSON.parse(chef);
  selChef = chef;
  renderPanelCards(filtered());

  // Center map
  if(chef.lat && chef.lng && gmap) {
    gmap.panTo({ lat: parseFloat(chef.lat), lng: parseFloat(chef.lng) });
  }

  // Open sheet
  const mLabels = {livraison:'🛵 Livraison', emporter:'🏪 À emporter', domicile:'👨‍🍳 Chef domicile', table:'🍽 Table d\'hôte'};
  const allModes = ['livraison','emporter','domicile','table'];
  const dishes = parseDishes(chef.dishes || '');

  document.getElementById('sheetContent').innerHTML = `
    <div class="cs-hero-img" style="background:${chef.bgColor||'#FFF3E0'};">
      ${chef.photoUrl ? `<img src="${chef.photoUrl}">` : `<span style="font-size:64px;">${chef.emoji||'👨‍🍳'}</span>`}
    </div>
    <div class="cs-info">
      <div class="cs-name">${chef.name}</div>
      <div class="cs-cuisine">${chef.description || chef.cuisine}</div>
      <div class="cs-badges">
        <span class="badge bv">✅ Chef vérifié Plateoo</span>
        <span class="badge bf">🏆 Chef Fondateur</span>
        ${chef.address ? `<span class="badge bd">📍 ${chef.address.split(',')[1]?.trim()||'Belgique'}</span>` : ''}
      </div>
    </div>
    <div class="cs-stats">
      <div class="cs-stat"><div class="cs-stat-n">⭐ ${chef.rating||'5.0'}</div><div class="cs-stat-l">Note</div></div>
      <div class="cs-stat"><div class="cs-stat-n">${chef.orders||0}</div><div class="cs-stat-l">Commandes</div></div>
      <div class="cs-stat"><div class="cs-stat-n">${dishes.length||'?'}</div><div class="cs-stat-l">Plats</div></div>
    </div>
    <div class="cs-modes">
      ${allModes.map(m=>`<div class="mchip ${(chef.modes||[]).includes(m)?'on':''}">${mLabels[m]}</div>`).join('')}
    </div>
    <div class="cs-dishes">
      <div class="cs-dishes-title">🍽 Au menu</div>
      ${dishes.length ? dishes.map(d=>`
        <div class="drow">
          <div class="drow-img" style="background:#FFF3E0;">${d.emoji||chef.emoji||'🍽'}</div>
          <div style="flex:1;"><div class="drow-name">${d.name}</div><div class="drow-desc">${d.desc||''}</div></div>
          <div class="drow-price">${d.price}€</div>
          <button class="drow-add" onclick="addToCart('${d.name}',${d.price})">+</button>
        </div>`).join('') : `<div style="color:var(--gray);font-size:13px;padding:8px 0;">Menu en cours de configuration…</div>`}
    </div>
    <div class="cs-cta">
      <button class="cta-btn" onclick="showToast('🛒 Commander chez ${chef.name.split(' ')[0]} — bientôt disponible !')">🛒 Commander chez ${chef.name.split(' ')[0]} →</button>
    </div>
  `;

  document.getElementById('sheetOverlay').classList.add('show');
  document.getElementById('chefSheet').classList.add('show');
}

function parseDishes(str) {
  if(!str) return [];
  return str.split(',').map(s => {
    s = s.trim();
    const priceMatch = s.match(/(\d+)€?$/);
    const price = priceMatch ? parseInt(priceMatch[1]) : 10;
    const name = s.replace(/\s*\d+€?\s*$/, '').trim();
    return { name, price, emoji: '', desc: '' };
  }).filter(d => d.name);
}

function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('show');
  document.getElementById('chefSheet').classList.remove('show');
  selChef = null;
  renderPanelCards(filtered());
}

// ══ CART ══
function addToCart(name, price) {
  showToast('✅ ' + name + ' ajouté au panier !');
  closeSheet();
}

// ══ FILTERS ══
function filtered() {
  return (window.chefsData || []).filter(c => {
    if(filters.modes.length && !(c.modes||[]).some(m=>filters.modes.includes(m))) return false;
    if(filters.cuisines.length && !filters.cuisines.includes(c.cuisine)) return false;
    if(filters.budget < 60 && (c.minPrice||0) > filters.budget) return false;
    if(filters.rating > 0 && (c.rating||5) < filters.rating) return false;
    return true;
  });
}

function onSearch(inp) {
  const q = inp.value.toLowerCase();
  document.getElementById('clearBtn').classList.toggle('show', q.length > 0);
  const list = filtered().filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.cuisine?.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q)
  );
  renderMapMarkers(list);
  renderPanelCards(list);
  updateBadge(list.length);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearBtn').classList.remove('show');
  applyFilters();
}

function toggleChip(el, type, val) {
  el.classList.toggle('on');
  if(type === 'mode') {
    if(filters.modes.includes(val)) filters.modes = filters.modes.filter(x=>x!==val);
    else filters.modes.push(val);
    updatePill('pMode', 'pModeL', 'Mode', filters.modes);
  } else {
    if(filters.cuisines.includes(val)) filters.cuisines = filters.cuisines.filter(x=>x!==val);
    else filters.cuisines.push(val);
    updatePill('pCuis', 'pCuisL', 'Cuisine', filters.cuisines);
  }
}

function updatePill(pillId, lblId, def, arr) {
  const pill = document.getElementById(pillId);
  const lbl = document.getElementById(lblId);
  if(!arr.length) { lbl.textContent = def; pill.classList.remove('on'); }
  else { lbl.textContent = arr.length > 1 ? arr.length + ' sélectionnés' : arr[0]; pill.classList.add('on'); }
}

function onBudget(inp) {
  const v = parseInt(inp.value);
  filters.budget = v;
  document.getElementById('budgetDisp').textContent = v===60 ? 'Tout' : v+'€';
  document.getElementById('sliderFill').style.width = ((v-5)/55*100)+'%';
  const lbl = document.getElementById('pBudgL');
  const pill = document.getElementById('pBudg');
  if(v===60) { lbl.textContent='Budget'; pill.classList.remove('on'); }
  else { lbl.textContent='≤'+v+'€'; pill.classList.add('on'); }
}

function setBudget(v, el) {
  document.getElementById('budgetSlider').value = v;
  onBudget(document.getElementById('budgetSlider'));
  document.querySelectorAll('.bp').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

function setRating(v, el) {
  filters.rating = v;
  document.querySelectorAll('.ropt').forEach(r => r.classList.remove('on'));
  el.classList.add('on');
  const lbl = document.getElementById('pRateL');
  const pill = document.getElementById('pRate');
  if(v===0) { lbl.textContent='Note'; pill.classList.remove('on'); }
  else { lbl.textContent=v+'+⭐'; pill.classList.add('on'); }
}

function setDist(el, v) {
  filters.dist = v;
  document.querySelectorAll('#distChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
}

function applyFilters() {
  closeFilter();
  const list = filtered();
  renderMapMarkers(list);
  renderPanelCards(list);
  updateBadge(list.length);
  showToast('🔍 '+list.length+' chef'+(list.length>1?'s':'')+' trouvé'+(list.length>1?'s':''));
}

function resetFilters() {
  filters = { modes:[], cuisines:[], budget:30, rating:4.5, dist:99 };
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  document.querySelectorAll('.bp').forEach((b,i) => b.classList.toggle('on', i===2));
  document.querySelectorAll('.ropt').forEach((r,i) => r.classList.toggle('on', i===2));
  document.getElementById('budgetSlider').value = 30;
  onBudget(document.getElementById('budgetSlider'));
  ['pMode','pCuis','pRate'].forEach(id => document.getElementById(id).classList.remove('on'));
  ['pModeL','pCuisL','pRateL'].forEach((id,i) => document.getElementById(id).textContent = ['Mode','Cuisine','Note'][i]);
  showToast('🔄 Filtres réinitialisés');
  applyFilters();
}

// ══ FILTER DRAWER ══
let filterOpen = false;
function openFilter(section) {
  document.getElementById('filterOverlay').classList.add('show');
  document.getElementById('filterDrawer').classList.add('show');
  filterOpen = true;
  if(section) {
    setTimeout(() => {
      document.getElementById('fs-'+section)?.scrollIntoView({behavior:'smooth',block:'start'});
    }, 300);
  }
}
function closeFilter() {
  document.getElementById('filterOverlay').classList.remove('show');
  document.getElementById('filterDrawer').classList.remove('show');
  filterOpen = false;
}

// ══ PANEL TOGGLE ══
function togglePanel() {
  panelUp = !panelUp;
  document.getElementById('bottomPanel').style.transform = panelUp ? 'translateY(-140px)' : '';
}

// ══ LOCATE ══
function locateMe() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      gmap?.panTo(loc);
      gmap?.setZoom(15);
      showToast('📍 Position actualisée !');
    }, () => showToast('📍 Liège, Belgique'));
  } else {
    gmap?.panTo({ lat: 50.6326, lng: 5.5797 });
    showToast('📍 Liège, Belgique');
  }
}

// ══ AUTH ══
let authTab = 'login';
let selectedRole = 'client';

function toggleAuth() {
  const modal = document.getElementById('authModal');
  if(window.currentUser) {
    // Already logged in — show profile or logout option
    showToast('👤 Connecté : ' + (window.currentUser.displayName || window.currentUser.email));
    setTimeout(() => {
      if(confirm('Se déconnecter ?')) {
        firebase.auth().signOut().then(() => {
          showToast('👋 À bientôt !');
          document.getElementById('userAvatar').textContent = '?';
          window.currentUser = null;
        });
      }
    }, 300);
  } else {
    modal.classList.toggle('show');
  }
}

function skipAuth() {
  document.getElementById('authModal').classList.remove('show');
  showToast('🗺 Bienvenue sur Plateoo !');
  loadChefs();
}

function switchAuthTab(tab, el) {
  authTab = tab;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function selectRole(role) {
  selectedRole = role;
  document.getElementById('roleClient').classList.toggle('on', role === 'client');
  document.getElementById('roleChef').classList.toggle('on', role === 'chef');
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const pwd = document.getElementById('loginPwd').value;
  if(!email || !pwd) { showToast('⚠️ Remplissez tous les champs'); return; }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pwd);
    showToast('✅ Connecté avec succès !');
    document.getElementById('authModal').classList.remove('show');
  } catch(e) {
    showToast('❌ ' + (e.code === 'auth/invalid-credential' ? 'Email ou mot de passe incorrect' : e.message));
  }
}

async function doRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const pwd = document.getElementById('regPwd').value;
  if(!name || !email || !pwd) { showToast('⚠️ Remplissez tous les champs'); return; }
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pwd);
    await cred.user.updateProfile({ displayName: name });
    showToast('🎉 Compte créé ! Bienvenue ' + name + ' !');
    document.getElementById('authModal').classList.remove('show');
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

async function doGoogle() {
  try {
    await firebase.auth().signInWithPopup(window.googleProvider);
    showToast('✅ Connecté avec Google !');
    document.getElementById('authModal').classList.remove('show');
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

// ══ ADMIN ══
function openAdmin() {
  document.getElementById('adminPanel').classList.add('show');
  loadAdminChefs();
}
function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('show');
}

let selectedModes = ['livraison'];
function toggleMode(el, mode) {
  el.classList.toggle('on');
  if(selectedModes.includes(mode)) selectedModes = selectedModes.filter(m=>m!==mode);
  else selectedModes.push(mode);
}

let geocodedLat = null, geocodedLng = null;
function geocodeAddress(address) {
  clearTimeout(geocodeTimer);
  if(address.length < 8) return;
  geocodeTimer = setTimeout(() => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address + ', Belgique' }, (results, status) => {
      if(status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        geocodedLat = loc.lat();
        geocodedLng = loc.lng();
        document.getElementById('aLat').value = geocodedLat.toFixed(6);
        document.getElementById('aLng').value = geocodedLng.toFixed(6);
        document.getElementById('geocodeResult').textContent = '✅ ' + results[0].formatted_address;
        gmap?.panTo({ lat: geocodedLat, lng: geocodedLng });
      } else {
        document.getElementById('geocodeResult').textContent = '⚠️ Adresse non trouvée';
      }
    });
  }, 800);
}

async function submitChef() {
  const name = document.getElementById('aName').value.trim();
  const cuisine = document.getElementById('aCuisine').value;
  const address = document.getElementById('aAddress').value.trim();
  const lat = parseFloat(document.getElementById('aLat').value) || geocodedLat;
  const lng = parseFloat(document.getElementById('aLng').value) || geocodedLng;
  const desc = document.getElementById('aDesc').value.trim();
  const emoji = document.getElementById('aEmoji').value.trim() || '🍽';
  const price = parseInt(document.getElementById('aPrice').value) || 10;
  const dishes = document.getElementById('aDishes').value.trim();

  if(!name || !lat || !lng) {
    showToast('⚠️ Nom et adresse obligatoires !');
    return;
  }

  const cuisineBg = {
    maghreb:'#FFF3E0', africain:'#E8F5E9', asiatique:'#F3E5F5',
    europeen:'#FCE4EC', latino:'#E8EAF6', patisserie:'#FFF8E1',
    vegetarien:'#E8F5E9', oriental:'#E3F2FD'
  };

  await window.addChef({
    name, cuisine, address, lat, lng,
    description: desc, emoji,
    minPrice: price, dishes,
    modes: selectedModes,
    bgColor: cuisineBg[cuisine] || '#FFF3E0',
    rating: 5.0, orders: 0
  });

  // Reset form
  ['aName','aAddress','aDesc','aEmoji','aPrice','aDishes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('aLat').value = '';
  document.getElementById('aLng').value = '';
  document.getElementById('geocodeResult').textContent = '';
  geocodedLat = null; geocodedLng = null;
  selectedModes = ['livraison'];
  document.querySelectorAll('.mode-check').forEach((el,i) => el.classList.toggle('on', i===0));

  loadAdminChefs();
}

async function loadAdminChefs() {
  const list = document.getElementById('adminChefList');
  try {
    const snap = await firebase.firestore().collection('chefs').get();
    const chefs = [];
    snap.forEach(d => chefs.push({id: d.id, ...d.data()}));
    if(!chefs.length) {
      list.innerHTML = '<div style="color:var(--gray);font-size:13px;">Aucun chef ajouté pour l\'instant.</div>';
      return;
    }
    list.innerHTML = chefs.map(c => `
      <div class="chef-admin-card">
        <div class="chef-admin-emoji">${c.emoji||'🍽'}</div>
        <div class="chef-admin-info">
          <div class="chef-admin-name">${c.name}</div>
          <div class="chef-admin-cuisine">${c.cuisine} · 📍 ${c.address||'Sans adresse'}</div>
        </div>
        <button class="chef-admin-delete" onclick="deleteChef('${c.id}')">🗑</button>
      </div>
    `).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:var(--gray);font-size:13px;">Erreur chargement.</div>';
  }
}

async function deleteChef(id) {
  if(!confirm('Supprimer ce chef ?')) return;
  try {
    await firebase.firestore().collection('chefs').doc(id).delete();
    showToast('🗑 Chef supprimé');
    loadAdminChefs();
    loadChefs();
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}


// ══ HOME SCREEN ══
let currentTab = 'home';
let homeMode = 'livraison';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('homeScreen').classList.toggle('active', tab === 'home');
  document.getElementById('mapScreen').classList.toggle('active', tab === 'map');
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  const tabEl = document.getElementById('tab-' + tab);
  if(tabEl) tabEl.classList.add('active');
  if(tab === 'map' && !window.gmap) {
    // trigger map init if needed
  }
}

function selectHomeMode(el, mode) {
  homeMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  // Apply filter and refresh
  filters.modes = [mode];
  renderHomeChefs();
}

function filterByCuisine(cuisine) {
  filters.cuisines = [cuisine];
  switchTab('map');
  setTimeout(() => applyFilters(), 300);
}

function onHomeBudget(inp) {
  const v = parseInt(inp.value);
  filters.budget = v;
  document.getElementById('homeBudgetVal').textContent = v === 60 ? 'Tout' : v + '€';
  document.getElementById('homeFill').style.width = ((v-5)/55*100) + '%';
  document.querySelectorAll('.bph').forEach(b => b.classList.remove('on'));
}

function setHomeBudget(v, el) {
  document.getElementById('homeBudgetSlider').value = v;
  onHomeBudget(document.getElementById('homeBudgetSlider'));
  document.querySelectorAll('.bph').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

function renderHomeChefs() {
  const chefs = window.chefsData || [];
  const bgColors = {maghreb:'#FFF3E0',africain:'#E8F5E9',asiatique:'#F3E5F5',europeen:'#FCE4EC',latino:'#E8EAF6',patisserie:'#FFF8E1',vegetarien:'#E8F5E9',oriental:'#E3F2FD'};

  function chefCard(c, badge, badgeClass) {
    const bg = c.bgColor || bgColors[c.cuisine] || '#FFF3E0';
    return `<div class="chef-hcard" onclick='selectChef(${JSON.stringify(c).replace(/'/g,"&#39;")})'>
      <div class="chef-hcard-img" style="background:${bg};">
        ${badge ? `<div class="chef-hcard-badge ${badgeClass||''}">${badge}</div>` : ''}
        <span style="font-size:40px;">${c.emoji||'👨‍🍳'}</span>
      </div>
      <div class="chef-hcard-body">
        <div class="chef-hcard-name">${c.name}</div>
        <div class="chef-hcard-cuisine">${c.description||c.cuisine}</div>
        <div class="chef-hcard-row">
          <div class="chef-hcard-rating">⭐ ${c.rating||'5.0'}</div>
          <div class="chef-hcard-price">dès ${c.minPrice||10}€</div>
        </div>
      </div>
    </div>`;
  }

  const emptyCard = (msg) => `<div style="padding:8px 0 16px;color:var(--gray);font-size:13px;min-width:200px;">${msg}</div>`;

  // Featured = top rated
  const featured = [...chefs].sort((a,b) => (b.rating||5)-(a.rating||5)).slice(0,5);
  const featEl = document.getElementById('featuredChefs');
  if(featEl) featEl.innerHTML = featured.length ? featured.map(c => chefCard(c,'⭐ Coup de cœur','')).join('') : emptyCard('Les premiers chefs arrivent bientôt !');

  // New = most recent (last 5)
  const newC = [...chefs].slice(-5).reverse();
  const newEl = document.getElementById('newChefs');
  if(newEl) newEl.innerHTML = newC.length ? newC.map(c => chefCard(c,'🆕 Nouveau','chef-hcard-new')).join('') : emptyCard("Aucun nouveau chef pour l'instant.");

  // All chefs
  const allEl = document.getElementById('allChefs');
  if(allEl) allEl.innerHTML = chefs.length ? chefs.map(c => chefCard(c, c.verified ? '✅ Vérifié' : null)).join('') : emptyCard("Aucun chef à proximité pour l'instant. Invitez les premiers !");

  // Greeting
  const h = new Date().getHours();
  const greet = h < 12 ? 'Bonjour 👋' : h < 18 ? 'Bon après-midi 👋' : 'Bonsoir 👋';
  const greetEl = document.getElementById('homeGreeting');
  if(greetEl) greetEl.textContent = greet + (window.currentUser?.displayName ? ', ' + window.currentUser.displayName.split(' ')[0] + ' !' : '');
}

// Override loadChefs to also update home
const _origLoadChefs = window.loadChefs;
window.loadChefs = async function() {
  if(_origLoadChefs) await _origLoadChefs();
  renderHomeChefs();
};

// ══ TOAST ══
let toastT;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3000);
}

window.mapsError = function() {
  clearTimeout(window._mapsT);
  document.getElementById('loading').classList.add('hide');
  document.getElementById('map').innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(160deg,#EDF5E6 0%,#E8F0DC 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;"><div style="font-size:52px;">🗺</div><div style="font-family:Fraunces,serif;font-size:17px;font-weight:700;color:#2C1810;text-align:center;">Carte Google Maps</div><div style="font-size:12px;color:#9A6B5A;text-align:center;padding:0 36px;line-height:1.6;">La carte est disponible une fois l'app mise en ligne sur plateoo.com<br><br>En attendant, toutes les autres fonctionnalités sont actives !</div><div style="background:#C0392B;color:white;padding:10px 20px;border-radius:12px;font-size:12px;font-weight:700;margin-top:4px;">📍 Bientôt sur plateoo.com</div></div>`;
  if(!window.currentUser) document.getElementById('authModal').classList.add('show');
  if(window.firebaseReady) window.loadChefs();
};
window._mapsT = setTimeout(window.mapsError, 5000);
