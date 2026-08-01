// =============================================================================
// Persian (Jalali/Shamsi) Calendar Picker - Negar Web App  v2
// =============================================================================

const PersianCal = (() => {

  const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                  'مهر','آبان','آذر','دی','بهمن','اسفند'];

  let state = {
    year: 1403,
    month: 1,
    targetInputId: null
  };

  // ── Gregorian → Jalali ──────────────────────────────────────────────────
  function gregorianToJalali(gy, gm, gd) {
    const g_d_no = [31,28,31,30,31,30,31,31,30,31,30,31];
    const j_d_no = [31,31,31,31,31,31,30,30,30,30,30,29];
    let jy, jm, jd;
    const gy2 = (gm > 2) ? (gy + 1) : gy;
    let g_day_no = 365 * gy
      + Math.floor((gy2 + 3) / 4)
      - Math.floor((gy2 + 99) / 100)
      + Math.floor((gy2 + 399) / 400);
    for (let i = 0; i < gm - 1; i++) g_day_no += g_d_no[i];
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
    for (i = 0; i < 11 && j_day_no >= j_d_no[i]; i++) j_day_no -= j_d_no[i];
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
    const sal_a = [0,31,((gy%4===0&&gy%100!==0)||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
    let gm = 0;
    for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
    return [gy, gm, gd];
  }

  // ── Days in Jalali month ─────────────────────────────────────────────────
  function daysInMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // Esfand: is it a leap year?
    const [gy1, gm1, gd1] = jalaliToGregorian(jy, 12, 1);
    const [gy2, gm2, gd2] = jalaliToGregorian(jy + 1, 1, 1);
    const diff = Math.round(
      (new Date(gy2, gm2 - 1, gd2) - new Date(gy1, gm1 - 1, gd1)) / 86400000
    );
    return diff; // 29 or 30
  }

  // ── Day-of-week of first day of Jalali month (0=Sat … 6=Fri) ──────────
  function firstDayOfMonth(jy, jm) {
    const [gy, gm, gd] = jalaliToGregorian(jy, jm, 1);
    const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun
    return (jsDay + 1) % 7;  // 0=Sat, 6=Fri
  }

  // ── Today in Jalali ─────────────────────────────────────────────────────
  function todayJalali() {
    const n = new Date();
    return gregorianToJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }

  // ── Render day grid ──────────────────────────────────────────────────────
  function render() {
    const titleEl = document.getElementById('persianCalTitle');
    const daysEl  = document.getElementById('persianCalDays');
    if (!titleEl || !daysEl) return;

    titleEl.textContent = `${MONTHS[state.month - 1]}  ${state.year}`;

    const count    = daysInMonth(state.year, state.month);
    const firstDay = firstDayOfMonth(state.year, state.month);
    const [ty, tm, td] = todayJalali();

    // Detect already selected day
    let selDay = 0;
    if (state.targetInputId) {
      const inp = document.getElementById(state.targetInputId);
      if (inp && inp.value.length === 10) {
        const p = inp.value.split('/');
        if (p.length === 3 &&
            parseInt(p[0]) === state.year &&
            parseInt(p[1]) === state.month) {
          selDay = parseInt(p[2]);
        }
      }
    }

    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="pcal-empty"></div>';

    for (let d = 1; d <= count; d++) {
      const col = (firstDay + d - 1) % 7; // 6 = Friday
      let cls = 'pcal-day';
      if (d === selDay)                                          cls += ' pcal-selected';
      else if (state.year===ty && state.month===tm && d===td)   cls += ' pcal-today';
      if (col === 6) cls += ' pcal-holiday';
      html += `<div class="${cls}" onclick="PersianCal.selectDay(${d})">${d}</div>`;
    }
    daysEl.innerHTML = html;
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {

    open(inputId, btnEl) {
      state.targetInputId = inputId;

      // Determine which month to show
      const inp = document.getElementById(inputId);
      if (inp && inp.value.length === 10) {
        const p = inp.value.split('/');
        if (p.length === 3) {
          const y = parseInt(p[0]), m = parseInt(p[1]);
          if (y > 1300 && y < 1500 && m >= 1 && m <= 12) {
            state.year = y; state.month = m;
          }
        }
      } else {
        [state.year, state.month] = todayJalali();
      }

      const popup = document.getElementById('persianCalendarPopup');
      if (!popup) { console.error('Popup not found'); return; }

      // ── Position: use viewport-relative coords (no scrollX/Y for fixed) ─
      const rect = btnEl.getBoundingClientRect();
      const popW = 298;

      let top  = rect.bottom + 6;
      let left = rect.left;

      // Don't go off right edge
      if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
      if (left < 4) left = 4;

      // Don't go off bottom edge
      const popH = 280;
      if (top + popH > window.innerHeight - 8) top = rect.top - popH - 4;
      if (top < 4) top = 4;

      popup.style.top  = top  + 'px';
      popup.style.left = left + 'px';
      popup.style.display = 'block';

      render();
    },

    close() {
      const p = document.getElementById('persianCalendarPopup');
      if (p) p.style.display = 'none';
      state.targetInputId = null;
    },

    selectDay(day) {
      if (!state.targetInputId) return;
      const inp = document.getElementById(state.targetInputId);
      if (!inp) return;
      const m = String(state.month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      inp.value = `${state.year}/${m}/${d}`;
      inp.dispatchEvent(new Event('input'));
      this.close();
    },

    prevMonth() { if (--state.month < 1)  { state.month = 12; state.year--; } render(); },
    nextMonth() { if (++state.month > 12) { state.month = 1;  state.year++; } render(); },
    prevYear()  { state.year--;  render(); },
    nextYear()  { state.year++;  render(); }
  };
})();

// ── Close when clicking outside ──────────────────────────────────────────
document.addEventListener('mousedown', (e) => {
  const popup = document.getElementById('persianCalendarPopup');
  if (!popup || popup.style.display === 'none') return;
  // Keep open if clicked inside popup or on any date-picker-btn
  if (!popup.contains(e.target) && !e.target.classList.contains('date-picker-btn')) {
    PersianCal.close();
  }
});

// ── Auto-format date input: YYYY/MM/DD ───────────────────────────────────
function autoFormatDate(input) {
  // 1. Strip every non-digit character
  let digits = input.value.replace(/\D/g, '');

  // 2. Clamp to 8 digits (YYYYMMDD)
  if (digits.length > 8) digits = digits.slice(0, 8);

  // 3. Rebuild with "/" separators
  let formatted = digits;
  if (digits.length > 4) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4);
  }
  if (digits.length > 6) {
    formatted = digits.slice(0, 4) + '/' + digits.slice(4, 6) + '/' + digits.slice(6);
  }

  // 4. Set value only if it changed (avoids re-triggering events)
  if (input.value !== formatted) {
    input.value = formatted;
  }

  // 5. Always move cursor to end — most natural for sequential typing
  const len = formatted.length;
  setTimeout(() => {
    try { input.setSelectionRange(len, len); } catch(e) {}
  }, 0);
}
