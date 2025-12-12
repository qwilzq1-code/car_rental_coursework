const API = "http://localhost:3000";

// Получение параметров из URL
const params = new URLSearchParams(window.location.search);
const bookingId = params.get("booking");
const amount = params.get("amount");

// Вывод на страницу
document.getElementById("bookingId").textContent = bookingId;
document.getElementById("amount").textContent = amount;

// Обработка оплаты
document.getElementById("payBtn").addEventListener("click", async () => {
    try {
        const res = await fetch(`${API}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bookingId: Number(bookingId),
                amount: Number(amount),
                status: "paid"
            })
        });

        if (!res.ok) {
            throw new Error("Ошибка при оплате");
        }

        document.getElementById("status").textContent = "Оплата успешно проведена!";
    } catch (err) {
        console.error(err);
        document.getElementById("status").textContent = "Ошибка при оплате.";
    }
});