// =============================================================================
// Persian (Jalali/Shamsi) Calendar Picker - Negar Web App
// Self-contained, no external dependencies
// =============================================================================

const PersianCal = (() => {

  const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                  'مهر','آبان','آذر','دی','بهمن','اسفند'];
  // Iranian week starts Saturday
  const WEEK_DAYS = ['ش','ی','د','س','چ','پ','ج'];

  let state = {
    year: 1403,
    month: 1,
    targetInputId: null,
    triggerBtn: null
  };

  // ── Gregorian → Jalali ──────────────────────────────────────────────────
  function gregorianToJalali(gy, gm, gd) {
    const g_days_in_month = [31,28,31,30,31,30,31,31,30,31,30,31];
    const j_days_in_month = [31,31,31,31,31,31,30,30,30,30,30,29];

    let jy, jm, jd;
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let g_day_no = 365 * gy
      + Math.floor((gy2 + 3) / 4)
      - Math.floor((gy2 + 99) / 100)
      + Math.floor((gy2 + 399) / 400);

    for (let i = 0; i < gm - 1; i++) g_day_no += g_days_in_month[i];
    if (gm > 2 && gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) g_day_no++;
    g_day_no += gd;

    let j_day_no = g_day_no - 79;
    let j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;

    jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
    j_day_no %= 1461;

    if (j_day_no >= 366) {
      jy += Math.floor((j_day_no - 1) / 365);
      j_day_no = (j_day_no - 1) % 365;
    }

    let i;
    for (i = 0; i < 11 && j_day_no >= j_days_in_month[i]; i++) {
      j_day_no -= j_days_in_month[i];
    }
    jm = i + 1;
    jd = j_day_no + 1;
    return [jy, jm, jd];
  }

  // ── Jalali → Gregorian ──────────────────────────────────────────────────
  function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;
    let days = -355779
      + (365 * jy)
      + (Math.floor(jy / 33) * 8)
      + Math.floor(((jy % 33) + 3) / 4)
      + jd
      + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

    let gd = days + 1;
    const sal_a = [0,31,
      ((gy%4===0&&gy%100!==0)||gy%400===0) ? 29 : 28,
      31,30,31,30,31,31,30,31,30,31];
    let gm = 0;
    for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
    return [gy, gm, gd];
  }

  // ── Days in Jalali month ─────────────────────────────────────────────────
  function daysInMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // Esfand: check leap by comparing adjacent year starts
    const [gy1, gm1, gd1] = jalaliToGregorian(jy, 12, 1);
    const [gy2, gm2, gd2] = jalaliToGregorian(jy + 1, 1, 1);
    const d1 = new Date(gy1, gm1 - 1, gd1);
    const d2 = new Date(gy2, gm2 - 1, gd2);
    return Math.round((d2 - d1) / 86400000); // 29 or 30
  }

  // ── Day of week for Jalali month's first day (0=Sat … 6=Fri) ───────────
  function firstDayOfMonth(jy, jm) {
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
    const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun … 6=Sat
    return (jsDay + 1) % 7;  // convert → 0=Sat, 6=Fri
  }

  // ── Today in Jalali ─────────────────────────────────────────────────────
  function todayJalali() {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  // ── Render grid ─────────────────────────────────────────────────────────
  function render() {
    const titleEl = document.getElementById('persianCalTitle');
    const daysEl  = document.getElementById('persianCalDays');
    if (!titleEl || !daysEl) return;

    titleEl.textContent = `${MONTHS[state.month - 1]}  ${state.year}`;

    const count    = daysInMonth(state.year, state.month);
    const firstDay = firstDayOfMonth(state.year, state.month);
    const [ty, tm, td] = todayJalali();

    // Parse currently selected value to highlight it
    let selDay = 0;
    if (state.targetInputId) {
      const input = document.getElementById(state.targetInputId);
      if (input && input.value.length === 10) {
        const parts = input.value.split('/');
        if (parts.length === 3 &&
            parseInt(parts[0]) === state.year &&
            parseInt(parts[1]) === state.month) {
          selDay = parseInt(parts[2]);
        }
      }
    }

    let html = '';
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="pcal-empty"></div>';
    }
    for (let d = 1; d <= count; d++) {
      let cls = 'pcal-day';
      if (d === selDay) cls += ' pcal-selected';
      else if (state.year === ty && state.month === tm && d === td) cls += ' pcal-today';
      // Friday = column 7 → Jomeh highlight
      const col = (firstDay + d - 1) % 7;
      if (col === 6) cls += ' pcal-holiday';
      html += `<div class="${cls}" onclick="PersianCal.selectDay(${d})">${d}</div>`;
    }
    daysEl.innerHTML = html;
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {

    open(inputId, btnEl) {
      state.targetInputId = inputId;
      state.triggerBtn    = btnEl;

      const input = document.getElementById(inputId);
      if (input && input.value.length === 10) {
        const p = input.value.split('/');
        if (p.length === 3) {
          const y = parseInt(p[0]), m = parseInt(p[1]);
          if (y > 1300 && y < 1500 && m >= 1 && m <= 12) {
            state.year  = y;
            state.month = m;
          }
        }
      } else {
        const [ty, tm] = todayJalali();
        state.year  = ty;
        state.month = tm;
      }

      const popup = document.getElementById('persianCalendarPopup');
      if (!popup) return;

      // Position near button
      const rect = btnEl.getBoundingClientRect();
      popup.style.display = 'block';
      const popW = 298;
      let left = rect.left + window.scrollX;
      if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
      if (left < 4) left = 4;
      popup.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
      popup.style.left = left + 'px';

      render();
    },

    close() {
      const p = document.getElementById('persianCalendarPopup');
      if (p) p.style.display = 'none';
      state.targetInputId = null;
      state.triggerBtn    = null;
    },

    selectDay(day) {
      if (!state.targetInputId) return;
      const input = document.getElementById(state.targetInputId);
      if (!input) return;
      const m = String(state.month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      input.value = `${state.year}/${m}/${d}`;
      input.dispatchEvent(new Event('input'));
      this.close();
    },

    prevMonth() {
      if (--state.month < 1)  { state.month = 12; state.year--; }
      render();
    },
    nextMonth() {
      if (++state.month > 12) { state.month = 1;  state.year++; }
      render();
    },
    prevYear()  { state.year--;  render(); },
    nextYear()  { state.year++;  render(); }
  };
})();

// Close popup when clicking outside
document.addEventListener('mousedown', (e) => {
  const popup = document.getElementById('persianCalendarPopup');
  if (!popup || popup.style.display === 'none') return;
  if (!popup.contains(e.target) && !e.target.classList.contains('date-picker-btn')) {
    PersianCal.close();
  }
});

// ── Auto-format date input (adds "/" automatically) ──────────────────────
function autoFormatDate(input) {
  // Save cursor position relative to digits
  const selStart = input.selectionStart;

  // Strip everything that is not a digit
  let digits = input.value.replace(/\D/g, '');

  // Limit to 8 digits (YYYYMMDD)
  if (digits.length > 8) digits = digits.slice(0, 8);

  // Re-build formatted string: YYYY/MM/DD
  let formatted = '';
  if (digits.length <= 4) {
    formatted = digits;
  } else if (digits.length <= 6) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4);
  } else {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4, 6) + '/' + digits.slice(6);
  }

  input.value = formatted;

  // Restore cursor: count how many "/" appear before original selStart
  let rawPos = 0, fmtPos = 0;
  let digitCount = 0;
  for (let i = 0; i < selStart && i < input.value.length + 1; i++) {
    const ch = (input.value + '')[i];
    if (ch && ch !== '/') digitCount++;
    fmtPos = i + 1;
  }
  // Move cursor to end of typed digits in formatted string
  let dc = 0, newCursor = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] !== '/') dc++;
    if (dc === digitCount) { newCursor = i + 1; break; }
    newCursor = i + 1;
  }
  // After a slash, advance cursor by 1
  if (formatted[newCursor - 1] === '/') newCursor++;
  try { input.setSelectionRange(newCursor, newCursor); } catch(e) {}
}
