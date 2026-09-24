# dsh-signal 🚦

DeepSeek API Peak / Off-Peak Hours Status Banner for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI.  
*Индикатор пиковых и льготных часов DeepSeek API для веб-интерфейса DeepSeek Harness (RU / EN).*

Real-time, zero-dependency header status chip showing whether the current Beijing time falls inside DeepSeek's official API peak window, with a live clock, countdown to the next tariff transition, and interactive pricing details.

---

## ⚡ Features / Возможности

- 🟢 **Off-Peak Hours (50% Discount) / Льготные часы (скидка 50%):**
  - Displays green badge with live Beijing time (`UTC+8`) and countdown to the next peak window.
  - Automatically handles weekends (**Saturday & Sunday are 24/7 all-day 50% discount**).
  - *Отображает зелёный бейдж с точным пекинским временем и таймером до следующего пика. В выходные (Сб и Вс) скидка 50% действует круглосуточно.*
- 🔴 **Peak Hours (2× Standard Rate) / Пиковые часы (стандартный тариф):**
  - Displays red badge with countdown until off-peak hours resume.
  - *Красный бейдж с обратным отсчетом до перехода на льготный тариф со скидкой.*
- 🌐 **Bilingual (English / Russian) / Двуязычный интерфейс:**
  - One-click language switch (`[RU]` / `[EN]`) right inside the popover card.
  - Remembers your language preference in `localStorage`.
- 🕒 **Live Beijing Clock / Пекинские часы:**
  - Accurate to the second, independent of your server or browser timezone.
- 📊 **Interactive Popover / Интерактивная карточка:**
  - Click the badge to open full schedule breakdown, live seconds countdown, and progress bar.
- 🎨 **Native Theme Integration:**
  - Blends seamlessly into DeepSeek Harness light and dark themes using `--dsw-alias-*` design tokens.
- 🛡️ **Clean Architecture:**
  - Zero external dependencies. Built natively for DSH 0.1.7+ with standard `slots` injection.

---

## 🕒 Official DeepSeek API Schedule (Beijing Time, UTC+8) / Расписание

| Status | When (Пекинское время) | Pricing / Тариф |
| :--- | :--- | :--- |
| 🔴 **Peak / Пик** | Weekdays **09:00–12:00** & **14:00–18:00** | Стандартный тариф (в 2 раза дороже льготного) |
| 🟢 **Off-Peak / Эконом** | Будни: ночь, утро и перерыв **12:00–14:00** | **Скидка 50% (50% OFF)** |
| 🟢 **Weekends / Выходные** | **Суббота и Воскресенье круглосуточно** | **Скидка 50% (24/7 All-Day Half Price)** |

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
