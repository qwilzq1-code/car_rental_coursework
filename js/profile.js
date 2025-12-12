const API = "http://localhost:3000";

function escapeHtml(unsafe) {
  if (unsafe === null || typeof unsafe === "undefined") return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseImages(imageUrlField) {
  if (!imageUrlField) return [];
  
  if (imageUrlField.startsWith('[')) {
    try {
      return JSON.parse(imageUrlField);
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e);
      return [];
    }
  }
  
  return imageUrlField.split(',').map(url => url.trim()).filter(url => url);
}

let userId = localStorage.getItem('clientId');
let cars = []; // cache

if (!userId) {
  document.body.innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2>Требуется вход</h2>
      <p>Для доступа к личному кабинету необходимо войти.</p>
      <a href="login.html" class="btn btn-primary" style="display:inline-block; margin-top:14px;">Перейти на вход</a>
    </div>
  `;
} else {
  userId = Number(userId);
  initializeProfile();
}

async function initializeProfile() {
  await loadCars();
  loadBookings();
  loadUserInfo();
}

function loadUserInfo() {
  const clientName = localStorage.getItem('clientName');
  const header = document.querySelector('.site-header');
  
  if (header && clientName) {
    const nav = header.querySelector('.nav');
    nav.innerHTML = `
      <a href="index.html">Главная</a>
      <a href="catalog.html">Каталог</a>
      <a href="profile.html">Личный кабинет</a>
      <span style="color:#6c757d; padding:8px 12px; border-radius:8px; background:#f1f5f9; display:flex; align-items:center; gap:6px; margin-left:auto;">
        👤 ${escapeHtml(clientName)}
      </span>
      <a href="javascript:logout()" style="color:#dc3545;">Выход</a>
    `;
  }
}

function logout() {
  localStorage.removeItem('clientId');
  localStorage.removeItem('clientName');
  localStorage.removeItem('clientPhone');
  localStorage.removeItem('clientPassport');
  window.location.href = 'login.html';
}

async function loadCars() {
  try {
    const res = await fetch(`${API}/cars`);
    if (!res.ok) throw new Error('Failed to load cars');
    cars = await res.json();
  } catch (err) {
    console.error('Error loading cars:', err);
  }
}

function getCarInfo(carId) {
  return cars.find(c => {
    const cId = c.ID || c.CarID;
    return String(cId) === String(carId);
  }) || {};
}

function calculateBookingDetails(startDate, endDate, pricePerDay) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  let days = Math.ceil((end - start) / msPerDay);
  if (days <= 0) days = 1;
  const totalPrice = (days * Number(pricePerDay || 0)).toFixed(2);
  return { days, totalPrice };
}

async function loadBookings() {
  try {
    const res = await fetch(`${API}/bookings`);
    if (!res.ok) throw new Error("Failed to load bookings: " + res.status);
    const allBookings = await res.json();

    const bookings = allBookings.filter(b => {
      const bid = b.UserId || b.UserID || b.ClientID || b.userId;
      return String(bid) === String(userId);
    });

    const container = document.getElementById("bookings");
    if (!bookings.length) {
      container.innerHTML = "<p>У вас пока нет бронирований.</p>";
      return;
    }

    container.innerHTML = bookings.map(b => renderBookingCard(b)).join('');
  } catch (err) {
    console.error(err);
    const container = document.getElementById("bookings");
    if (container) container.innerText = "Ошибка загрузки бронирований.";
  }
}

function renderBookingCard(b) {
  const id = b.ID || b.Id || b.id;
  const carId = b.CarId || b.CarID;
  const car = getCarInfo(carId);
  const startDateIso = b.StartDate || b.startDate;
  const endDateIso = b.EndDate || b.endDate;

  const startDate = startDateIso ? new Date(startDateIso).toLocaleDateString('ru-RU') : "—";
  const endDate = endDateIso ? new Date(endDateIso).toLocaleDateString('ru-RU') : "—";

  const rawStatus = b.Status || "pending";
  const statusLower = String(rawStatus).trim().toLowerCase();
  const isPaid = statusLower !== 'pending' && statusLower !== '';

  let totalPrice = b.TotalPrice;
  if (!totalPrice && startDateIso && endDateIso && car.PricePerDay) {
    const { totalPrice: calculated } = calculateBookingDetails(startDateIso, endDateIso, car.PricePerDay);
    totalPrice = calculated;
  }
  const price = totalPrice || "—";
  const pricePerDay = car.PricePerDay ? `${escapeHtml(String(car.PricePerDay))}$` : '—';

  const statusClass = isPaid ? 'status-paid' : 'status-waiting';
  const cardStateClass = isPaid ? 'paid' : 'pending';
  const badgeText = isPaid ? '✓ Оплачено' : '⏳ Ожидание оплаты';
  const badgeIcon = isPaid ? '🎉' : '⚠️';

  const carName = `${escapeHtml(car.Brand || "—")} ${escapeHtml(car.Model || "—")}`;
  const carYear = escapeHtml(car.Year || "—");

  const images = parseImages(car.ImageURL);
  const imgUrl = escapeHtml(images[0] || 'https://via.placeholder.com/300x200?text=No+Image');

  return `
  <div class="booking-card ${cardStateClass}">
    <div class="thumb">
      <img src="${imgUrl}" alt="${carName}" onerror="this.src='https://via.placeholder.com/300x200?text=Error'"/>
    </div>
    <div class="body">
      <div>
        <div class="title">🚗 ${carName} <span style="color:var(--muted); font-weight:600; font-size:0.95rem;">(${carYear})</span></div>
        <div class="meta">
          <div>📅 ${escapeHtml(startDate)} — ${escapeHtml(endDate)}</div>
          <div class="price-per-day">💰 ${pricePerDay} / день</div>
        </div>
      </div>

      <div class="footer">
        <div class="left-pills">
          <div class="status-badge ${statusClass}">${badgeIcon} ${escapeHtml(badgeText)}</div>
          <div class="booking-pill">Бронь #${escapeHtml(String(id))}</div>
        </div>

        <div class="booking-price">
          <div style="font-size:0.85rem; color:var(--muted);">Итого</div>
          <div class="total">${escapeHtml(String(price))}$</div>
          <div class="booking-actions" style="margin-top:8px;">
            ${!isPaid ? `<button class="btn btn-primary" onclick="payBooking(${Number(id)}, ${price || 0})">Оплатить</button>` : `<div style="padding:8px 12px; border-radius:10px; background:linear-gradient(180deg,#198754,#157347); color:#fff; font-weight:700;">✓ ОПЛАЧЕНО</div>`}
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

async function payBooking(bookingId, amount) {
  try {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, amount })
    });

    const text = await res.text();
    if (!res.ok) {
      console.error("Payment failed:", res.status, text);
      alert("Ошибка при оплате: " + (text || res.statusText));
      return;
    }

    showPaymentSuccess();
    setTimeout(loadBookings, 800);
  } catch (err) {
    console.error(err);
    alert("Сетевая ошибка при оплате. Проверьте сервер.");
  }
}

function showPaymentSuccess() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #198754, #157347);
    color: white;
    padding: 14px 18px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: 0 8px 24px rgba(25, 135, 84, 0.25);
    z-index: 9999;
  `;
  notification.innerHTML = '🎉 Оплата успешно проведена!';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2600);
}