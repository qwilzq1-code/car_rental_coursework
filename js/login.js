const API = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  
  const phone = form.phone.value.trim();
  const passport = form.passport.value.trim();

  if (!phone || phone.length < 10) {
    showError("Пожалуйста, введите корректный номер телефона.");
    return;
  }

  if (!passport || passport.length < 8) {
    showError("Пожалуйста, введите корректный номер паспорта.");
    return;
  }

  try {
    const res = await fetch(`${API}/login/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, passport })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('clientId', data.clientId);
      localStorage.setItem('clientName', data.fullName);
      localStorage.setItem('clientPhone', data.phone);
      localStorage.setItem('clientPassport', data.passport);
      
      showSuccess();
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1500);
    } else {
      showError(data.message || "Клиент не найден. Проверьте данные или зарегистрируйтесь.");
    }
  } catch (err) {
    console.error(err);
    showError("Сетевая ошибка при входе. Проверьте, запущен ли сервер.");
  }
});

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  const successDiv = document.getElementById("successMessage");
  errorDiv.textContent = "⚠ Ошибка: " + message;
  errorDiv.style.display = "block";
  successDiv.style.display = "none";
}

function showSuccess() {
  const successDiv = document.getElementById("successMessage");
  const errorDiv = document.getElementById("errorMessage");
  successDiv.style.display = "block";
  errorDiv.style.display = "none";
}