/* DawDZ — Données des villes (10 wilayas de lancement, extensible à toute l'Algérie)
   Partagé entre le frontend (global) et le serveur (require). */
var CITIES = {
  "tizi-ouzou": {
    name:"Tizi Ouzou",
    center:[36.69,4.09],
    bounds:[[36.53,3.84],[36.82,4.38]],
    zones:[
      {z:1,label:"Centre",poly:[[36.745,4.015],[36.74,4.095],[36.685,4.095],[36.675,4.02]],c:["Tizi Ouzou-Centre","Lalla Sais","Tizi Rouif"]},
      {z:2,label:"Nord",poly:[[36.742,3.90],[36.795,3.92],[36.80,4.10],[36.765,4.115],[36.745,4.03],[36.738,3.96]],c:["Azazga","Draâ El Mizan","Aïn El Hammam","Ouled Rahmoun","Tahar"]},
      {z:3,label:"Est",poly:[[36.735,4.125],[36.775,4.24],[36.76,4.36],[36.56,4.30],[36.555,4.115],[36.675,4.09]],c:["Bougaâ","Aïn El Hadjar","Tizgzaï","Akid Abbou","Ouaguenoun","Oued Fali","Akbou"]},
      {z:4,label:"Ouest & Sud",poly:[[36.715,3.925],[36.72,3.995],[36.635,4.035],[36.55,3.985],[36.545,3.855],[36.64,3.86]],c:["Aït Châfaa","Lardjeoun","Azeffoun","Tigheniff"]}
    ],
    comm:{
      "Tizi Ouzou-Centre":[36.713,4.057],"Lalla Sais":[36.695,4.085],"Tizi Rouif":[36.734,4.041],
      "Azazga":[36.755,4.043],"Draâ El Mizan":[36.794,4.090],"Aïn El Hammam":[36.744,3.988],"Ouled Rahmoun":[36.762,4.079],"Tahar":[36.749,3.930],
      "Bougaâ":[36.672,4.105],"Aïn El Hadjar":[36.721,4.134],"Tizgzaï":[36.717,4.254],"Akid Abbou":[36.656,4.205],"Ouaguenoun":[36.597,4.135],"Oued Fali":[36.595,4.164],"Akbou":[36.741,4.333],
      "Aït Châfaa":[36.690,3.952],"Lardjeoun":[36.646,3.989],"Azeffoun":[36.586,3.895],"Tigheniff":[36.630,4.009]
    }
  },
  "alger": {
    name:"Alger",
    center:[36.76,3.06],
    bounds:[[36.69,2.92],[36.82,3.25]],
    zones:[
      {z:1,label:"Centre",poly:[[36.77,3.03],[36.77,3.14],[36.72,3.14],[36.72,3.04]],c:["Alger-Centre","Bab El Oued","El Harrach","Kouba"]},
      {z:2,label:"Nord",poly:[[36.77,2.93],[36.81,2.95],[36.81,3.06],[36.77,3.06]],c:["Hydra","El Biar","Birkhadem","Hussein Dey","Zéralda"]},
      {z:3,label:"Est",poly:[[36.76,3.14],[36.81,3.16],[36.81,3.24],[36.76,3.24]],c:["Rouiba","Réghaia","Dar El Beïda","Bologhine"]},
      {z:4,label:"Sud & Ouest",poly:[[36.74,2.96],[36.74,3.07],[36.70,3.07],[36.70,2.97]],c:["Sidi Moussa","Ouled Yaïch","Birtouta","Birkine","Chéraga"]}
    ],
    comm:{
      "Alger-Centre":[36.756,3.066],"Bab El Oued":[36.764,3.048],"El Harrach":[36.755,3.105],"Kouba":[36.726,3.121],
      "Hydra":[36.773,3.009],"El Biar":[36.776,3.028],"Birkhadem":[36.770,2.983],"Hussein Dey":[36.775,3.013],"Zéralda":[36.803,2.950],
      "Rouiba":[36.774,3.199],"Réghaia":[36.790,3.225],"Dar El Beïda":[36.800,3.210],"Bologhine":[36.783,3.155],
      "Sidi Moussa":[36.720,3.030],"Ouled Yaïch":[36.715,3.055],"Birtouta":[36.735,2.995],"Birkine":[36.740,2.990],"Chéraga":[36.710,3.010]
    }
  },
  "oran": {
    name:"Oran",
    center:[35.70,-0.65],
    bounds:[[35.62,-0.80],[35.77,-0.48]],
    zones:[
      {z:1,label:"Centre",poly:[[35.72,-0.67],[35.72,-0.61],[35.68,-0.61],[35.68,-0.67]],c:["Oran-Centre","Bir El Djir","Delly Brahim"]},
      {z:2,label:"Ouest",poly:[[35.72,-0.79],[35.76,-0.79],[35.76,-0.67],[35.72,-0.67]],c:["Aïn El Turk","Arzew","Oued Tlelat"]},
      {z:3,label:"Sud",poly:[[35.70,-0.68],[35.70,-0.60],[35.63,-0.60],[35.63,-0.69]],c:["Bethioua","Oued El Barah"]},
      {z:4,label:"Est",poly:[[35.68,-0.61],[35.68,-0.49],[35.62,-0.49],[35.62,-0.62]],c:["Es Senia","Mers El Kébir","Oued Ziten"]}
    ],
    comm:{
      "Oran-Centre":[35.700,-0.640],"Bir El Djir":[35.709,-0.633],"Delly Brahim":[35.700,-0.660],
      "Aïn El Turk":[35.722,-0.720],"Arzew":[35.749,-0.770],"Oued Tlelat":[35.739,-0.680],
      "Bethioua":[35.677,-0.655],"Oued El Barah":[35.655,-0.630],
      "Es Senia":[35.650,-0.620],"Mers El Kébir":[35.663,-0.545],"Oued Ziten":[35.632,-0.505]
    }
  },
  "constantine": {
    name:"Constantine",
    center:[36.36,6.62],
    bounds:[[36.29,6.54],[36.45,6.71]],
    zones:[
      {z:1,label:"Centre",poly:[[36.38,6.59],[36.38,6.64],[36.34,6.64],[36.34,6.60]],c:["Constantine-Centre","El Khroub"]},
      {z:2,label:"Nord",poly:[[36.38,6.55],[36.38,6.67],[36.44,6.62],[36.44,6.57]],c:["Zighoud Youcef","Hamam El Watane"]},
      {z:3,label:"Est",poly:[[36.38,6.64],[36.38,6.70],[36.33,6.70],[36.33,6.65]],c:["Aïn Smara","Zaccar"]},
      {z:4,label:"Sud",poly:[[36.34,6.58],[36.34,6.63],[36.29,6.63],[36.29,6.58]],c:["El Btaha","Aïn Roua"]}
    ],
    comm:{
      "Constantine-Centre":[36.365,6.615],"El Khroub":[36.375,6.630],
      "Zighoud Youcef":[36.420,6.570],"Hamam El Watane":[36.370,6.655],
      "Aïn Smara":[36.345,6.655],"Zaccar":[36.352,6.668],
      "El Btaha":[36.330,6.600],"Aïn Roua":[36.320,6.620]
    }
  },
  "annaba": {
    name:"Annaba",
    center:[36.89,7.77],
    bounds:[[36.84,7.65],[36.93,7.86]],
    zones:[
      {z:1,label:"Centre",poly:[[36.91,7.75],[36.91,7.78],[36.87,7.78],[36.87,7.75]],c:["Annaba-Centre","Chetaïbi"]},
      {z:2,label:"Est",poly:[[36.91,7.78],[36.91,7.85],[36.87,7.85],[36.87,7.78]],c:["El Hadjar","Oued El Aneb"]},
      {z:3,label:"Sud",poly:[[36.89,7.72],[36.89,7.77],[36.85,7.77],[36.85,7.72]],c:["El Bouni","Bou Ghibla"]},
      {z:4,label:"Ouest",poly:[[36.92,7.66],[36.92,7.74],[36.87,7.74],[36.87,7.66]],c:["Azzaba","El Aoudjathia"]}
    ],
    comm:{
      "Annaba-Centre":[36.900,7.768],"Chetaïbi":[36.885,7.760],
      "El Hadjar":[36.885,7.815],"Oued El Aneb":[36.890,7.800],
      "El Bouni":[36.870,7.755],"Bou Ghibla":[36.870,7.730],
      "Azzaba":[36.900,7.690],"El Aoudjathia":[36.890,7.700]
    }
  },
  "setif": {
    name:"Sétif",
    center:[36.17,5.42],
    bounds:[[36.10,5.30],[36.24,5.56]],
    zones:[
      {z:1,label:"Centre",poly:[[36.22,5.36],[36.22,5.43],[36.17,5.43],[36.17,5.37]],c:["Sétif-Centre","Sidi Aïssa"]},
      {z:2,label:"Nord",poly:[[36.19,5.43],[36.22,5.44],[36.22,5.55],[36.14,5.55]],c:["El Eulma","Aïn Oulmène"]},
      {z:3,label:"Est",poly:[[36.18,5.43],[36.18,5.50],[36.12,5.50],[36.12,5.44]],c:["Aïn Azel","Bougaâ"]},
      {z:4,label:"Sud & Ouest",poly:[[36.17,5.32],[36.17,5.40],[36.11,5.40],[36.11,5.32]],c:["M'Chedla","Fena"]}
    ],
    comm:{
      "Sétif-Centre":[36.190,5.410],"Sidi Aïssa":[36.205,5.395],
      "El Eulma":[36.160,5.510],"Aïn Oulmène":[36.210,5.500],
      "Aïn Azel":[36.150,5.450],"Bougaâ":[36.130,5.480],
      "M'Chedla":[36.140,5.350],"Fena":[36.130,5.380]
    }
  },
  "blida": {
    name:"Blida",
    center:[36.47,2.83],
    bounds:[[36.40,2.73],[36.54,2.91]],
    zones:[
      {z:1,label:"Centre",poly:[[36.51,2.79],[36.51,2.86],[36.45,2.86],[36.45,2.80]],c:["Blida-Centre","Boufarik"]},
      {z:2,label:"Nord",poly:[[36.51,2.83],[36.51,2.89],[36.46,2.89],[36.46,2.84]],c:["Lardjem","Sidi M'Hamed"]},
      {z:3,label:"Sud",poly:[[36.46,2.80],[36.46,2.86],[36.41,2.86],[36.41,2.80]],c:["Bouinan","Chréa"]},
      {z:4,label:"Ouest",poly:[[36.52,2.74],[36.52,2.80],[36.47,2.80],[36.47,2.74]],c:["Boukandoura","Merouana"]}
    ],
    comm:{
      "Blida-Centre":[36.470,2.830],"Boufarik":[36.490,2.840],
      "Lardjem":[36.510,2.840],"Sidi M'Hamed":[36.490,2.870],
      "Bouinan":[36.430,2.840],"Chréa":[36.440,2.820],
      "Boukandoura":[36.500,2.780],"Merouana":[36.520,2.760]
    }
  },
  "bejaia": {
    name:"Béjaïa",
    center:[36.74,5.06],
    bounds:[[36.64,4.98],[36.83,5.12]],
    zones:[
      {z:1,label:"Centre",poly:[[36.78,5.02],[36.78,5.07],[36.73,5.07],[36.73,5.03]],c:["Béjaïa-Centre","Oued El Ma"]},
      {z:2,label:"Nord",poly:[[36.80,5.00],[36.81,5.02],[36.80,5.11],[36.77,5.11]],c:["Amizour","Tichy","Chekfa"]},
      {z:3,label:"Ouest",poly:[[36.74,5.05],[36.74,5.11],[36.67,5.11],[36.67,5.06]],c:["Kherrata","Aokas"]},
      {z:4,label:"Sud",poly:[[36.72,5.04],[36.72,5.08],[36.65,5.08],[36.65,5.03]],c:["El Khemis"]}
    ],
    comm:{
      "Béjaïa-Centre":[36.750,5.055],"Oued El Ma":[36.765,5.030],
      "Amizour":[36.800,5.020],"Tichy":[36.800,5.055],"Chekfa":[36.775,5.100],
      "Kherrata":[36.700,5.080],"Aokas":[36.720,5.090],
      "El Khemis":[36.680,5.060]
    }
  },
  "batna": {
    name:"Batna",
    center:[35.55,6.17],
    bounds:[[35.41,6.01],[35.67,6.30]],
    zones:[
      {z:1,label:"Centre",poly:[[35.58,6.14],[35.58,6.20],[35.52,6.20],[35.52,6.14]],c:["Batna-Centre"]},
      {z:2,label:"Nord",poly:[[35.58,6.12],[35.58,6.28],[35.66,6.28],[35.66,6.13]],c:["Barika","Tazoult"]},
      {z:3,label:"Est",poly:[[35.50,6.20],[35.50,6.27],[35.42,6.27],[35.42,6.20]],c:["Aïn Touta","Merouana"]},
      {z:4,label:"Ouest",poly:[[35.58,6.02],[35.58,6.13],[35.48,6.13],[35.48,6.03]],c:["N'Gaous","Maghra"]}
    ],
    comm:{
      "Batna-Centre":[35.550,6.170],
      "Barika":[35.620,6.260],"Tazoult":[35.600,6.150],
      "Aïn Touta":[35.480,6.240],"Merouana":[35.430,6.210],
      "N'Gaous":[35.520,6.060],"Maghra":[35.620,6.030]
    }
  },
  "ouargla": {
    name:"Ouargla",
    center:[31.95,5.33],
    bounds:[[31.83,5.08],[32.10,5.76]],
    zones:[
      {z:1,label:"Centre",poly:[[31.98,5.29],[31.98,5.37],[31.92,5.37],[31.92,5.29]],c:["Ouargla-Centre"]},
      {z:2,label:"Est",poly:[[32.00,5.36],[32.06,5.42],[32.06,5.73],[32.00,5.70]],c:["Ghoufi","In Guelma","Berriane"]},
      {z:3,label:"Ouest",poly:[[31.97,5.10],[31.97,5.18],[31.90,5.18],[31.90,5.10]],c:["Aflou"]},
      {z:4,label:"Sud",poly:[[31.90,5.18],[31.90,5.26],[31.85,5.26],[31.85,5.19]],c:["Megarine"]}
    ],
    comm:{
      "Ouargla-Centre":[31.950,5.330],
      "Ghoufi":[32.020,5.700],"In Guelma":[32.030,5.550],"Berriane":[32.040,5.390],
      "Aflou":[31.940,5.150],
      "Megarine":[31.890,5.220]
    }
  }
};
if (typeof module !== "undefined" && module.exports) module.exports = CITIES;
