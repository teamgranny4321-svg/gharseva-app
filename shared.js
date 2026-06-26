// ===================================================================
// GHARSEVA - SHARED CONFIG & HELPERS
// ===================================================================

const firebaseConfig = {
    apiKey: "AIzaSyAl3ehdXAHRhDbz7PqdrVYoBFgfK2RFwNE",
    authDomain: "vivek-raj-f209c.firebaseapp.com",
    databaseURL: "https://vivek-raj-f209c-default-rtdb.firebaseio.com",
    projectId: "vivek-raj-f209c",
    storageBucket: "vivek-raj-f209c.firebasestorage.app",
    messagingSenderId: "158789238550",
    appId: "1:158789238550:web:7a825ae490d2548f811a37"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const SERVICES = [
    { id: "rajmistri", name: "Rajmistri (Mason)", emoji: "🧱", desc: "Deewar, plaster, tile, lentre casting" },
    { id: "beldar", name: "Beldar / Labor", emoji: "👷", desc: "Mortar milana, eint dhona, khudai" },
    { id: "ghar_helper", name: "Ghar Ka Helper", emoji: "🏠", desc: "Shifting, saaman, gardening" },
    { id: "painter", name: "Painter", emoji: "🎨", desc: "Wall/wood painting, putty, polish" },
    { id: "carpenter", name: "Carpenter (Badhai)", emoji: "🪚", desc: "Darwaze, furniture, cabinet repair" },
    { id: "welder", name: "Welder / Fabrication", emoji: "🔧", desc: "Gate, grill, railing welding" },
    { id: "tile_layer", name: "Tile & Marble Layer", emoji: "🟫", desc: "Tiles, granite, marble fitting" },
    { id: "bike_mechanic", name: "Bike / Car Mechanic", emoji: "🏍️", desc: "Service, engine repair, puncture" },
    { id: "electrician", name: "Electrician", emoji: "⚡", desc: "Wiring, switchboard, fan/cooler repair" },
    { id: "ro_technician", name: "RO / Water Purifier Tech", emoji: "💧", desc: "Filter change, leakage, servicing" },
    { id: "ac_mechanic", name: "AC & Fridge Mechanic", emoji: "❄️", desc: "Gas refill, cooling issue, servicing" },
    { id: "plumber", name: "Plumber", emoji: "🚰", desc: "Pipe leakage, tap, tanki overflow" },
    { id: "kabaadwala", name: "Kabaad Wala", emoji: "♻️", desc: "Purana kabaad, akhbar, plastic" },
    { id: "appliance_repair", name: "Appliance Repairer", emoji: "🔌", desc: "Washing machine, mixer, microwave" },
    { id: "locksmith", name: "Locksmith (Chabi Wala)", emoji: "🔑", desc: "Lock kholna, nayi chabi banana" }
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

function generateJobId() {
    return "job_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

function getCurrentUser() {
    const data = localStorage.getItem('gharseva_user');
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(uid, email, userType, name, phone) {
    localStorage.setItem('gharseva_user', JSON.stringify({ uid, email, userType, name, phone }));
}

// FIXED LOGOUT: Pehle localStorage clear hoga, phir firebase signOut, phir redirect
function logoutUser() {
    localStorage.removeItem('gharseva_user'); 
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth()) {
        firebase.auth().signOut().then(() => {
            window.location.replace('index.html');
        }).catch((err) => {
            window.location.replace('index.html');
        });
    } else {
        window.location.replace('index.html');
    }
}

function getMyLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation supported nahi hai is browser me");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err.message),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

function watchMyLocation(callback) {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(
        (pos) => callback(pos.coords.latitude, pos.coords.longitude),
        (err) => console.error("Location watch error:", err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
}
