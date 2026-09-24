# dsh-signal 🚦

Intelligent DeepSeek API Peak / Off-Peak Hours Tariff Monitor for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI.  
*Интеллектуальный монитор тарифов DeepSeek (пиковые часы / скидка 50%) для веб-интерфейса DeepSeek Harness (RU / EN).*

Bespoke, zero-dependency header status chip with dual-timezone intelligence, live phase countdown, dynamic progress bar, and silent visual transition alerts.

---

## ⚡ Features / Возможности

- 🕒 **Dual Timezone Intelligence (Моё время ⇄ Пекин):**
  - Instant toggle between your local browser time (e.g. UTC+3 Moscow/Minsk) and Beijing time (`UTC+8`).
  - Automatically calculates and converts peak intervals into your local time zone (e.g., in UTC+3: `04:00–07:00` and `09:00–13:00`).
  - *Мгновенный выбор между местным временем браузера и Пекином. Автоматический пересчёт интервалов расписания под ваш город.*
- 🟢 **Off-Peak Hours (50% Discount) / Льготный режим (скидка 50%):**
  - Displays dynamic green badge with live countdown to the next peak window.
  - Automatically handles weekends (**Saturday & Sunday are 24/7 all-day 50% discount**).
  - *Зелёный индикатор с обратным отсчетом до следующего пика. В выходные (Сб и Вс) скидка 50% действует круглосуточно.*
- 🔴 **Peak Hours (100% Rate) / Пиковые часы (стандартный тариф 100%):**
  - Displays pulsing red badge with countdown until off-peak discount hours resume.
  - *Пульсирующий красный индикатор с таймером до перехода на режим 50% скидки.*
- 🔔 **Silent Visual Alerts / Тихие визуальные уведомления:**
  - Non-intrusive floating toast notification when the tariff changes (peak ⇄ off-peak).
  - Auto-dismisses after 6 seconds with smooth animation. Completely silent (no audio).
  - *Всплывающее уведомление в углу экрана при смене тарифа без навязчивого звука.*
- 🌐 **Bilingual (English / Russian) / Двуязычный интерфейс:**
  - One-click language switch (`[RU]` / `[EN]`) right inside the popover card.
  - Remembers both language and timezone preferences in `localStorage`.
- 📊 **Interactive Popover / Интерактивная карточка:**
  - Click the badge to open full schedule breakdown, live seconds countdown, and phase progress bar.
- 🎨 **DeepSeek Harness Design Token Integration:**
  - Seamlessly blends into DeepSeek Harness light and dark themes using official `--dsw-alias-*` tokens.
- 🛡️ **Clean Cordis Architecture:**
  - Zero external npm dependencies. Native client slot injection (`conversation.session.header.utilities`).

---

## 🕒 Official DeepSeek API Schedule (Beijing Time, UTC+8) / Расписание

| Status | Beijing Time (UTC+8) | Local Time (UTC+3 Minsk/Moscow) | Pricing / Тариф |
| :--- | :--- | :--- | :--- |
| 🔴 **Peak 1 / Пик 1** | **09:00–12:00** | **04:00–07:00** | Стандартный тариф (100%) |
| 🔴 **Peak 2 / Пик 2** | **14:00–18:00** | **09:00–13:00** | Стандартный тариф (100%) |
| 🟢 **Off-Peak / Эконом** | Ночь, утро и **12:00–14:00** | День, вечер и **07:00–09:00** | **Скидка 50% (50% OFF)** |
| 🟢 **Weekends / Выходные** | **Сб и Вс круглосуточно** | **Сб и Вс круглосуточно** | **Скидка 50% (24/7 All-Day Half Price)** |

---

## 📦 Installation / Установка

In your DeepSeek Harness profile directory (e.g. `~/.dsh/profiles/web`):

```bash
dsh plugin --profile web add github:sawickiy-commits/dsh-signal
```

Then restart DeepSeek Harness:

```bash
pm2 restart deepseek-harness
```

---

## 📄 License

MIT © [sawickiy-commits](https://github.com/sawickiy-commits)
