// Адрес веб-приложения Google Apps Script (когда подключим таблицу заказчика)
const CONFIG = { FORM_URL: "", PHONE: "8 (800) 000-00-00" };

// Памятка: пункты отмечаются по очереди
(function(){
  const items = document.querySelectorAll("#sheetList li");
  if (!items.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(li => li.classList.add("done"));
    return;
  }
  function run(){
    items.forEach(li => li.classList.remove("done"));
    items.forEach((li, i) => setTimeout(() => li.classList.add("done"), 900 + i * 900));
    setTimeout(run, 900 + items.length * 900 + 4500);
  }
  run();
})();

// Маска телефона +7 (XXX) XXX-XX-XX
const phone = document.querySelector('input[name="phone"]');
phone.addEventListener("input", () => {
  let d = phone.value.replace(/\D/g, "");
  if (d[0] === "8" || d[0] === "7") d = d.slice(1);
  d = d.slice(0, 10);
  let s = d ? "+7 (" + d.slice(0, 3) : "";
  if (d.length >= 3) s += ") " + d.slice(3, 6);
  if (d.length >= 6) s += "-" + d.slice(6, 8);
  if (d.length >= 8) s += "-" + d.slice(8, 10);
  phone.value = s;
});

// Отправка заявки
const form = document.getElementById("leadForm");
const msg = document.getElementById("formMsg");
form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.className = "form__msg";
  msg.textContent = "";
  const f = form.elements;
  let bad = false;
  ["name", "phone", "region"].forEach(n => {
    const ok = n === "phone" ? f[n].value.replace(/\D/g, "").length === 11 : f[n].value.trim().length > 1;
    f[n].classList.toggle("bad", !ok);
    if (!ok) bad = true;
  });
  if (bad || !f.agree.checked) {
    msg.className = "form__msg err";
    msg.textContent = bad ? "Проверьте имя, телефон и регион." : "Нужно согласие на обработку данных.";
    return;
  }
  if (f.site.value) return; // ловушка для роботов
  if (!CONFIG.FORM_URL) {
    msg.className = "form__msg err";
    msg.textContent = "Позвоните нам: " + CONFIG.PHONE + ".";
    return;
  }
  try {
    const r = await fetch(CONFIG.FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ name: f.name.value.trim(), phone: f.phone.value, region: f.region.value.trim(), time: f.time.value })
    });
    const j = await r.json();
    if (!j.ok) throw 0;
    form.reset();
    msg.className = "form__msg ok";
    msg.textContent = "Заявка принята. Мы перезвоним в рабочее время.";
  } catch (_) {
    msg.className = "form__msg err";
    msg.textContent = "Не получилось отправить. Позвоните нам: " + CONFIG.PHONE + ".";
  }
});
