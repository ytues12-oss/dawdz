/* ============================================================
   DawDZ — Serveur zéro dépendance (renforcé)
   Lancer : node server.js   (port 8080 ou $PORT sur Glitch)
   - Sert l'application web (index.html + cities.js uniquement)
   - API REST : commandes, paramètres, actions
   - Notifications : Telegram (gérant) + WhatsApp Cloud API (client)
   - Persistance : data.json

   SÉCURITÉ :
   - Session gérant par jeton (24 h) requise sur settings/livreurs/envois
   - Codes livreurs hachés (SHA-256 + sel), jamais renvoyés en clair
   - Anti-forçage : 5 échecs → blocage 15 min (admin ET livreurs)
   - Anti-spam : 10 commandes max / minute / IP
   - En-têtes : CSP, X-Frame-Options DENY, nosniff, Referrer-Policy
   - Seuls index.html et cities.js sont servis (pas de data.json, server.js…)
   - /api/state masque mot de passe, tokens API et codes livreurs
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CITIES = require("./cities.js");

const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

const TYPES = {document:"📄 Document", colis:"📦 Colis", repas:"🍔 Repas", autre:"📎 Autre"};
const WLABEL = {leger:"Léger (<1kg)", moyen:"Moyen (1-3kg)", lourd:"Lourd (>3kg)"};

// Zones et communes par ville (source unique : cities.js)
function cityData(key){ return CITIES[key] || CITIES["tizi-ouzou"]; }
function zoneOf(cityKey, commune){
  var c = cityData(cityKey);
  for(var i=0;i<c.zones.length;i++){ if(c.zones[i].c.indexOf(commune)>=0) return c.zones[i].z; }
  return null;
}

const DEFAULTS = {
  brand:"DawDZ", waNumber:"", city:"tizi-ouzou",
  base:300, step:100, mid:100, heavy:200, urgentMult:1.5,
  zones:[true,true,true,true],
  waToken:"", waPhoneId:"", tgToken:"", tgChatId:"",
  // Mot de passe de secours (utilisé quand data.json est réinitialisé, ex. Render)
  adminPassword:"DzJxQMBzmPEJ!"
};

// ---------- Sécurité ----------
const ADMIN_TOKEN_TTL = 24*3600*1000;      // session gérant : 24 h
const MAX_LOGIN_FAILS = 5;                 // échecs avant blocage
const LOGIN_BLOCK_MS  = 15*60*1000;        // blocage : 15 min
const MAX_ORDERS_PER_MIN = 10;             // anti-spam commandes

const adminTokens = new Map();  // token -> exp (ms)
const adminFails  = new Map();  // ip  -> {count, until}
const driverFails = new Map();  // ip  -> {count, until}
const orderRate   = new Map();  // ip  -> {count, reset}

function ipOf(req){
  // Dernier IP de la chaîne X-Forwarded-For : le tunnel ajoute l'IP réelle du
  // client en fin de liste, les en-têtes forgés par un attaquant sont ignorés.
  var xf = req.headers["x-forwarded-for"];
  if(xf){
    var parts = xf.split(",");
    var last = parts[parts.length-1].trim();
    if(last) return last;
  }
  return req.socket.remoteAddress || "?";
}
function str(v, max){ return (typeof v==="string") ? v.slice(0,max) : ""; }
function num(v){ return (typeof v==="number" && isFinite(v) && v>=0 && v<=100000) ? v : null; }

function blocked(map, ip){
  var e = map.get(ip);
  return !!(e && e.until > Date.now());
}
function recordFail(map, ip){
  var e = map.get(ip) || {count:0, until:0};
  e.count++;
  if(e.count >= MAX_LOGIN_FAILS){ e.until = Date.now()+LOGIN_BLOCK_MS; e.count = 0; }
  map.set(ip, e);
}
function clearFails(map, ip){ map.delete(ip); }
function tooManyOrders(ip){
  var now = Date.now();
  var e = orderRate.get(ip);
  if(!e || now > e.reset){ e = {count:0, reset:now+60000}; orderRate.set(ip,e); }
  e.count++;
  return e.count > MAX_ORDERS_PER_MIN;
}
function tokenValid(t){
  if(!t) return false;
  var exp = adminTokens.get(t);
  if(!exp) return false;
  if(Date.now() > exp){ adminTokens.delete(t); return false; }
  return true;
}
function adminAuth(req){ return tokenValid(req.headers["x-admin-token"]); }
function hashPin(pin){
  return crypto.createHash("sha256").update(state.salt + ":" + pin).digest("hex");
}

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
function securityHeaders(res, p){
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", CSP);
  if(p.indexOf("/api/")===0) res.setHeader("Cache-Control","no-store");
  else res.setHeader("Cache-Control","no-cache");
}

// ---------- État ----------
let state;

function calcFee(cityKey, from, to, weight, urgent){
  var s = state.settings;
  var z1 = zoneOf(cityKey, from) || 1;
  var z2 = zoneOf(cityKey, to) || 1;
  var f = s.base + s.step*Math.abs(z1-z2);
  f += (weight==="moyen"?s.mid : weight==="lourd"?s.heavy : 0);
  if(urgent) f = Math.round(f*s.urgentMult/10)*10;
  return f;
}
function normPhone(num){
  var d = String(num||"").replace(/\D/g,"");
  if(!d) return null;
  if(d.length===10 && d.charAt(0)==="0") d = "213"+d.slice(1);
  else if(d.charAt(0)==="0") d = d.replace(/^0+/,"");
  return d;
}
function hashWithSalt(salt, pin){
  return crypto.createHash("sha256").update(salt + ":" + pin).digest("hex");
}
function seed(){
  var now = Date.now();
  var salt = crypto.randomBytes(16).toString("hex");
  var s = {
    counter: 1004,
    driverCounter: 3,
    salt: salt,
    settings: Object.assign({}, DEFAULTS),
    drivers: [
      {id:"d1", name:"Mehdaoui", moto:"Yamaha FZ", phone:"0661 23 45 67", pinHash:hashWithSalt(salt,"9376")},
      {id:"d2", name:"Riad", moto:"Suzuki GD 110", phone:"0550 87 65 43", pinHash:hashWithSalt(salt,"3740")}
    ],
    orders: [
      {id:"TZ-1001", city:"tizi-ouzou", from:"Azazga", to:"Tizi Ouzou-Centre", type:"colis", weight:"moyen", urgent:false,
       client:{name:"Nassima Aït Ahmed", phone:"0661 23 45 67"}, fee:400,
       status:"attente", driver:null, driverName:null, createdAt:now-4*60000, acceptedAt:null, deliveredAt:null},
      {id:"TZ-1002", city:"tizi-ouzou", from:"Aït Châfaa", to:"Bougaâ", type:"document", weight:"leger", urgent:false,
       client:{name:"Aïssa Meddah", phone:"0550 87 65 43"}, fee:500,
       status:"attente", driver:null, driverName:null, createdAt:now-9*60000, acceptedAt:null, deliveredAt:null},
      {id:"TZ-1003", city:"tizi-ouzou", from:"Tizi Ouzou-Centre", to:"Aïn El Hammam", type:"repas", weight:"leger", urgent:true,
       client:{name:"Mehdaoui Belkacem", phone:"0770 11 22 33"}, fee:680,
       status:"livree", driver:"d1", driverName:"Mehdaoui", createdAt:now-52*60000, acceptedAt:now-45*60000, deliveredAt:now-20*60000}
    ]
  };
  return s;
}
function load(){
  var fresh = false;
  try{
    state = JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));
  }catch(e){
    state = seed();
    fresh = true;
  }
  state.settings = Object.assign({}, DEFAULTS, state.settings);
  // Migration : anciennes données sans comptes livreurs
  if(!Array.isArray(state.drivers)){
    state.drivers = [
      {id:"d1", name:"Mehdaoui", moto:"Yamaha FZ", phone:"0661 23 45 67"},
      {id:"d2", name:"Riad", moto:"Suzuki GD 110", phone:"0550 87 65 43"}
    ];
    state.driverCounter = 3;
  }
  // Migration multi-villes : anciennes commandes rattachées à Tizi Ouzou
  state.orders.forEach(function(o){ if(!o.city) o.city = "tizi-ouzou"; });
  if(state.settings.city && !CITIES[state.settings.city]) state.settings.city = "tizi-ouzou";
  // Sécurité : sel + hachage des codes (migration des codes en clair)
  if(!state.salt){ state.salt = crypto.randomBytes(16).toString("hex"); fresh = true; }
  state.drivers.forEach(function(d){
    if(d.pin){ d.pinHash = hashPin(d.pin); delete d.pin; fresh = true; }
    if(!d.pinHash){ delete d.pin; }
  });
  if(!Array.isArray(state.orders)) state.orders = [];
  if(fresh) persist();
  console.log("✓ Données chargées (" + state.orders.length + " commandes, " + state.drivers.length + " livreurs, codes hachés: oui)");
}
function persist(){
  fs.writeFileSync(DATA_FILE, JSON.stringify(state,null,2));
}

// ---------- Messages ----------
function merchantMsg(o){
  return "🔔 *NOUVELLE COMMANDE* — " + state.settings.brand + "\n" +
    "ID : " + o.id + "\n" +
    "🏙️ " + cityData(o.city).name + "\n" +
    "👤 " + o.client.name + " · " + o.client.phone + "\n" +
    "📍 " + o.from + " → " + o.to + "\n" +
    TYPES[o.type] + " · " + WLABEL[o.weight] + (o.urgent?" · ⚡ Urgent":"") + "\n" +
    "💰 " + o.fee + " DZD";
}
function clientMsg(o){
  return "✅ *Commande " + o.id + " confirmée* — " + state.settings.brand + "\n" +
    TYPES[o.type] + " · " + WLABEL[o.weight] + (o.urgent?" · ⚡ Urgent":"") + "\n" +
    "🏙️ " + cityData(o.city).name + "\n" +
    "📍 Départ : " + o.from + "\n" +
    "🏁 Arrivée : " + o.to + "\n" +
    "💰 Tarif : " + o.fee + " DZD (paiement à la livraison)\n" +
    "Un livreur moto part vers vous très vite !";
}

// ---------- Envoi Telegram (alertes gérant, gratuit) ----------
function sendTelegram(text){
  var s = state.settings;
  if(!s.tgToken || !s.tgChatId) return Promise.resolve("skipped (Telegram non configuré)");
  return fetch("https://api.telegram.org/bot" + s.tgToken + "/sendMessage", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({chat_id:s.tgChatId, text:text})
  })
  .then(function(r){ return r.json(); })
  .then(function(j){ return j.ok ? "sent" : "error: " + (j.description||"inconnue"); })
  .catch(function(e){ return "error: " + e.message; });
}

// ---------- Envoi WhatsApp (Meta Cloud API) ----------
function sendWhatsApp(phone, text){
  var s = state.settings;
  if(!s.waToken || !s.waPhoneId) return Promise.resolve("skipped (WhatsApp non configuré)");
  var to = normPhone(phone);
  if(!to) return Promise.resolve("skipped (numéro invalide)");
  return fetch("https://graph.facebook.com/v20.0/" + s.waPhoneId + "/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json", "Authorization":"Bearer " + s.waToken},
    body:JSON.stringify({
      messaging_product:"whatsapp",
      to:to,
      type:"text",
      text:{preview_url:false, body:text}
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(j){ return j.messages ? "sent" : "error: " + ((j.error&&j.error.message)||"inconnue"); })
  .catch(function(e){ return "error: " + e.message; });
}

// ---------- Utilitaires HTTP ----------
function json(res, obj, code){
  res.writeHead(code||200, {"Content-Type":"application/json; charset=utf-8"});
  res.end(JSON.stringify(obj));
}
function readBody(req){
  return new Promise(function(resolve, reject){
    var chunks = [], size = 0;
    req.on("data", function(c){
      size += c.length;
      if(size > 100000){ reject(new Error("Body trop volumineux")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", function(){
      try{ resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch(e){ reject(new Error("JSON invalide")); }
    });
    req.on("error", reject);
  });
}
function serveStatic(p, res){
  if(p==="/") p="/index.html";
  // Autorisation stricte : seuls les fichiers publics sont servis
  if(p!=="/index.html" && p!=="/cities.js"){
    res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
    res.end("404 — introuvable");
    return;
  }
  var full = path.join(__dirname, path.basename(p));
  fs.readFile(full, function(err, data){
    if(err){ res.writeHead(404, {"Content-Type":"text/plain"}); res.end("404 — introuvable"); return; }
    var ct = p.indexOf(".js")>=0 ? "text/javascript; charset=utf-8" : "text/html; charset=utf-8";
    res.writeHead(200, {"Content-Type":ct});
    res.end(data);
  });
}
function publicSettings(){
  var s = state.settings;
  return {
    brand:s.brand, waNumber:s.waNumber, city:s.city,
    base:s.base, step:s.step, mid:s.mid, heavy:s.heavy, urgentMult:s.urgentMult,
    zones:s.zones,
    waToken:"", waPhoneId:"", tgToken:"", tgChatId:"", adminPassword:""
  };
}
function publicDrivers(){
  return state.drivers.map(function(d){
    return {id:d.id, name:d.name, moto:d.moto, phone:d.phone};
  });
}

// ---------- Routes ----------
const server = http.createServer(async function(req, res){
  var url = new URL(req.url, "http://localhost");
  var p = url.pathname;
  var ip = ipOf(req);
  securityHeaders(res, p);
  if(req.method==="OPTIONS"){ res.writeHead(204); res.end(); return; }

  try{
    if(p==="/api/health" && req.method==="GET"){
      return json(res, {ok:true, service:"dawdz", cities:Object.keys(CITIES), time:Date.now()});
    }
    if(p==="/api/state" && req.method==="GET"){
      // Données publiques : paramètres masqués, sans codes livreurs
      return json(res, {orders:state.orders, settings:publicSettings(), drivers:publicDrivers()});
    }
    if(p==="/api/admin" && req.method==="POST"){
      if(blocked(adminFails, ip)) return json(res,{error:"Trop de tentatives — réessayez dans 15 minutes"},429);
      var ba = await readBody(req);
      if(str(ba.password) && ba.password===state.settings.adminPassword){
        clearFails(adminFails, ip);
        var tok = crypto.randomBytes(24).toString("hex");
        adminTokens.set(tok, Date.now()+ADMIN_TOKEN_TTL);
        console.log("🔐 Session gérant ouverte (24 h) — IP " + ip);
        return json(res,{ok:true, token:tok});
      }
      recordFail(adminFails, ip);
      console.log("🚫 Tentative gérant échouée — IP " + ip);
      return json(res,{error:"Mot de passe incorrect"},401);
    }
    if(p==="/api/drivers/login" && req.method==="POST"){
      if(blocked(driverFails, ip)) return json(res,{error:"Trop de tentatives — réessayez dans 15 minutes"},429);
      var bl = await readBody(req);
      var d = state.drivers.find(function(x){ return x.id===str(bl.id,10); });
      if(d && typeof bl.pin==="string" && bl.pin.length<=8 && hashPin(bl.pin)===d.pinHash){
        clearFails(driverFails, ip);
        return json(res,{ok:true, driver:{id:d.id, name:d.name, moto:d.moto, phone:d.phone}});
      }
      recordFail(driverFails, ip);
      console.log("🚫 Tentative livreur échouée — IP " + ip);
      return json(res,{error:"Code incorrect"},401);
    }
    // ---------- Routes réservées au gérant (jeton 24 h) ----------
    if(!adminAuth(req)) {
      if(req.method==="POST" && (p==="/api/settings" || p==="/api/drivers" || p.indexOf("/api/drivers/")===0 || p==="/api/send/telegram" || p==="/api/send/whatsapp")){
        return json(res,{error:"Non autorisé — session gérant requise (24 h)"},401);
      }
    }
    if(p==="/api/drivers" && req.method==="POST"){
      var bd = await readBody(req);
      if(!str(bd.name,40) || !/^\d{4,8}$/.test(str(bd.pin,8)))
        return json(res,{error:"Nom et code secret obligatoires (4 à 8 chiffres)"},400);
      var nd = {
        id:"d"+(state.driverCounter++),
        name:str(bd.name,40),
        moto:str(bd.moto,40),
        phone:str(bd.phone,20),
        pinHash:hashPin(str(bd.pin,8))
      };
      state.drivers.push(nd);
      persist();
      console.log("🏍️ Nouveau compte livreur : " + nd.name + " (code haché)");
      return json(res,{driver:publicDrivers().find(function(x){return x.id===nd.id;})},201);
    }
    var md = p.match(/^\/api\/drivers\/(d\d+)\/delete$/);
    if(md && req.method==="POST"){
      var before = state.drivers.length;
      state.drivers = state.drivers.filter(function(x){ return x.id!==md[1]; });
      if(state.drivers.length===before) return json(res,{error:"Livreur introuvable"},404);
      persist();
      console.log("🗑️ Compte livreur supprimé : " + md[1]);
      return json(res,{ok:true});
    }
    if(p==="/api/settings" && req.method==="POST"){
      var s = await readBody(req);
      var allowed = ["brand","waNumber","city","base","step","mid","heavy","urgentMult","zones","waToken","waPhoneId","tgToken","tgChatId","adminPassword"];
      allowed.forEach(function(k){
        if(s[k]===undefined) return;
        if(k==="brand") state.settings.brand = str(s[k],60) || state.settings.brand;
        else if(k==="waNumber"||k==="waToken"||k==="waPhoneId"||k==="tgToken"||k==="tgChatId") state.settings[k] = str(s[k],200);
        else if(k==="adminPassword"){
          if(typeof s[k]!=="string" || s[k].length<8) return; // trop court : ignoré
          state.settings.adminPassword = s[k].slice(0,64);
        }
        else if(k==="city") state.settings.city = CITIES[s[k]] ? s[k] : state.settings.city;
        else if(k==="zones") state.settings.zones = Array.isArray(s[k]) ? s[k].slice(0,4).map(Boolean) : state.settings.zones;
        else { var n = num(s[k]); if(n!==null) state.settings[k] = n; }
      });
      if(typeof state.settings.urgentMult!=="number" || state.settings.urgentMult<1 || state.settings.urgentMult>5)
        state.settings.urgentMult = DEFAULTS.urgentMult;
      persist();
      console.log("⚙️ Paramètres mis à jour par le gérant");
      return json(res, publicSettings());
    }
    if(p==="/api/send/telegram" && req.method==="POST"){
      var t = await readBody(req);
      var r1 = await sendTelegram(str(t.text,1500)||("🔔 Test — " + state.settings.brand + " fonctionne !"));
      return json(res, {result:r1});
    }
    if(p==="/api/send/whatsapp" && req.method==="POST"){
      var w = await readBody(req);
      var r2 = await sendWhatsApp(w.phone, str(w.text,1500)||("🔔 Test — " + state.settings.brand));
      return json(res, {result:r2});
    }
    // ---------- Commandes (publiques) ----------
    if(p==="/api/orders" && req.method==="POST"){
      if(tooManyOrders(ip)) return json(res,{error:"Trop de commandes — patientez 1 minute"},429);
      var b = await readBody(req);
      var client = (b.client||{});
      var cname = str(client.name,80), cphone = str(client.phone,20);
      var city = CITIES[b.city] ? b.city : "tizi-ouzou";
      if(!b.from || !b.to || !cname || !cphone || !CITIES[city].comm[b.from] || !CITIES[city].comm[b.to]){
        return json(res, {error:"Champs manquants ou commune inconnue dans " + cityData(city).name}, 400);
      }
      var w = WLABEL[b.weight] ? b.weight : "leger";
      var order = {
        id:"TZ-" + (state.counter++),
        city:city,
        from:b.from, to:b.to,
        type:TYPES[b.type] ? b.type : "autre",
        weight:w,
        urgent:!!b.urgent,
        client:{name:cname, phone:cphone},
        fee:calcFee(city, b.from, b.to, w, !!b.urgent),
        status:"attente", driver:null, driverName:null,
        createdAt:Date.now(), acceptedAt:null, deliveredAt:null
      };
      state.orders.push(order);
      persist();
      console.log("🆕 Commande " + order.id + " (" + cityData(city).name + ") : " + order.from + " → " + order.to + " (" + order.fee + " DZD)");
      sendTelegram(merchantMsg(order)).then(function(r){ console.log("   [Telegram gérant] " + r); });
      sendWhatsApp(order.client.phone, clientMsg(order)).then(function(r){ console.log("   [WhatsApp client] " + r); });
      return json(res, order, 201);
    }
    var m = p.match(/^\/api\/orders\/(TZ-\d+)\/(accept|deliver|cancel)$/);
    if(m && req.method==="POST"){
      var b2 = await readBody(req);
      var o = state.orders.find(function(x){ return x.id===m[1]; });
      if(!o) return json(res, {error:"Commande introuvable"}, 404);
      var cityLbl = " (" + cityData(o.city).name + ")";
      if(m[2]==="accept"){
        if(o.status!=="attente") return json(res, {error:"Commande déjà " + o.status}, 409);
        // Le livreur doit exister réellement (pas de nom inventé)
        var drv = b2.driver ? state.drivers.find(function(x){ return x.id===b2.driver; }) : null;
        o.status="encours"; o.driver=drv?drv.id:null; o.driverName=drv?drv.name:o.driverName; o.acceptedAt=Date.now();
        persist();
        console.log("🏍️ " + o.id + " acceptée par " + (o.driverName||"?"));
        sendTelegram("🏍️ " + o.id + cityLbl + " acceptée par " + (o.driverName||"un livreur") + " (" + o.from + " → " + o.to + ")")
          .then(function(r){ console.log("   [Telegram] " + r); });
      } else if(m[2]==="deliver"){
        if(o.status!=="encours") return json(res, {error:"Commande pas en cours"}, 409);
        o.status="livree"; o.deliveredAt=Date.now();
        persist();
        console.log("✅ " + o.id + " livrée (+ " + o.fee + " DZD)");
        sendTelegram("✅ " + o.id + cityLbl + " livrée — +" + o.fee + " DZD (" + o.from + " → " + o.to + ")")
          .then(function(r){ console.log("   [Telegram] " + r); });
      } else {
        o.status="annulee";
        persist();
        console.log("❌ " + o.id + " annulée");
        sendTelegram("❌ " + o.id + cityLbl + " annulée (" + o.from + " → " + o.to + ")")
          .then(function(r){ console.log("   [Telegram] " + r); });
      }
      return json(res, o);
    }
    if(p.indexOf("/api/")===0){
      return json(res, {error:"Route API inconnue"}, 404);
    }
    return serveStatic(p, res);
  }catch(e){
    console.error("ERREUR:", e.message);
    return json(res, {error:e.message}, 500);
  }
});

load();
server.listen(PORT, "0.0.0.0", function(){
  console.log("🏍️  DawDZ démarré sur http://0.0.0.0:" + PORT + " — " + Object.keys(CITIES).length + " wilayas actives");
  console.log("🔒 Sécurité active : session gérant 24 h · codes hachés · anti-forçage · anti-spam · CSP");
  console.log("   API : /api/health · /api/state · /api/orders");
});
