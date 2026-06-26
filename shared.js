// ===================================================================
// GHARSEVA - SHARED CONFIG & HELPERS
// Ye file customer.html, worker.html, aur index.html sab use karte hain
// ===================================================================

// ⚠️ YAHAN APNA FIREBASE CONFIG DAALEIN (Firebase Console > Project Settings se copy karein)
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

// Force long-lived login persistence (survives app close/reopen)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((e) => console.error("Persistence error:", e));

// -------------------------------------------------------------------
// 15 SERVICES LIST (Construction + Home Repair)
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Distance calculation (Haversine formula) - km me return karta hai
// -------------------------------------------------------------------
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Generate random 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Generate unique job ID
function generateJobId() {
    return "job_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

// Get logged in user from localStorage (set after login)
function getCurrentUser() {
    const data = localStorage.getItem('gharseva_user');
    return data ? JSON.parse(data) : null;
}

// Restores localStorage user data from Firebase Auth + Database if localStorage was cleared
// but the Firebase Auth session is still alive. Calls callback(user) with the resolved user,
// or callback(null) if truly logged out. Always call this on page load instead of relying
// only on getCurrentUser() so closed/reopened apps don't get bounced to login.
function restoreSession(callback) {
    const cached = getCurrentUser();
    if (cached) {
        callback(cached);
        return;
    }
    firebase.auth().onAuthStateChanged((firebaseUser) => {
        if (!firebaseUser) {
            callback(null);
            return;
        }
        firebase.database().ref('users/' + firebaseUser.uid).once('value').then((snap) => {
            const data = snap.val();
            if (!data) { callback(null); return; }
            setCurrentUser(firebaseUser.uid, data.email, data.userType, data.name, data.phone);
            callback(getCurrentUser());
        }).catch(() => callback(null));
    });
}

// Play an attention sound + vibrate the phone (used for new job alerts)
function playAlertSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (startTime) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        };
        playBeep(ctx.currentTime);
        playBeep(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Sound error:", e);
    }
    if (navigator.vibrate) {
        navigator.vibrate([300, 150, 300, 150, 300]);
    }
}

function setCurrentUser(uid, email, userType, name, phone) {
    localStorage.setItem('gharseva_user', JSON.stringify({ uid, email, userType, name, phone }));
}

function logoutUser() {
    localStorage.removeItem('gharseva_user');
    window.location.href = 'index.html';
}

// Get one-time browser GPS location -> returns Promise{lat, lng}
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

// Watch location continuously -> calls callback(lat, lng) every update. Returns watchId to clear later.
function watchMyLocation(callback) {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(
        (pos) => callback(pos.coords.latitude, pos.coords.longitude),
        (err) => console.error("Location watch error:", err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
                                                                                }
