/**
 * DSH Signal — Intelligent DeepSeek Peak & Off-Peak Tariff Monitor
 * Bespoke implementation for DeepSeek Harness (0.1.7+)
 *
 * Features:
 * - Dual timezone conversion engine (Local Time ⇄ Beijing UTC+8)
 * - Live seconds clock & phase countdown timer
 * - Dynamic phase progress bar
 * - Silent visual toast notifications on tariff transition
 * - Light/Dark theme token integration (--dsw-alias-*)
 * - Bilingual support (RU / EN) with persistent settings
 *
 * Developed for sawickiy-commits
 */
(function () {
  var MODULE_ID = 'dsh-signal'

  var MODULE_FACTORY = function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')

    // Official DeepSeek peak windows in minutes from midnight (Beijing time UTC+8)
    // 09:00 = 540, 12:00 = 720, 14:00 = 840, 18:00 = 1080
    var PEAK_RANGES = [
      [540, 720],   // 09:00 - 12:00
      [840, 1080]   // 14:00 - 18:00
    ]

    var COLOR_PEAK = '#ef4444'
    var COLOR_PEAK_BG = 'rgba(239, 68, 68, 0.12)'
    var COLOR_PEAK_BORDER = 'rgba(239, 68, 68, 0.35)'

    var COLOR_OFF = '#10b981'
    var COLOR_OFF_BG = 'rgba(16, 185, 129, 0.12)'
    var COLOR_OFF_BORDER = 'rgba(16, 185, 129, 0.35)'

    var FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

    var T = {
      ru: {
        peak: 'Пик',
        offPeak: 'Эконом',
        weekend: 'Выходной',
        rate100: 'Тариф 100%',
        rate50: 'Скидка 50%',
        endsIn: 'До конца',
        toPeak: 'До пика',
        toOffPeak: 'До скидки',
        peakActiveTitle: 'Пиковые часы (Тариф 100%)',
        offPeakActiveTitle: 'Эконом-режим (Скидка 50%)',
        weekendActiveTitle: 'Выходной (Скидка 50% весь день)',
        tzLocal: 'Моё время',
        tzBeijing: 'Пекин (UTC+8)',
        currentTzTime: 'Текущее время:',
        bjTimeRef: 'Пекин (UTC+8):',
        schedTitle: 'Расписание тарифов DeepSeek:',
        schedPeak1: '• Пик 1 (100%): ',
        schedPeak2: '• Пик 2 (100%): ',
        schedOffNote: '• Эконом (50%): Ночь, утро и перерыв',
        schedWeekend: '• Выходные (Сб и Вс): Круглосуточно скидка 50%!',
        phaseProgress: 'Прогресс текущего периода:',
        langLabel: 'Язык:',
        toastPeakTitle: '🔴 Пиковые часы (Тариф 100%)',
        toastPeakDesc: 'Начался период повышенной нагрузки DeepSeek.',
        toastOffTitle: '🟢 Скидка 50% активирована!',
        toastOffDesc: 'Начался экономичный период (скидка 50% на все запросы).',
        credit: 'DSH Signal · Личный монитор тарифов',
        days: {
          Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс'
        }
      },
      en: {
        peak: 'Peak',
        offPeak: 'Off-Peak',
        weekend: 'Weekend',
        rate100: '100% Rate',
        rate50: '50% OFF',
        endsIn: 'Ends in',
        toPeak: 'Until peak',
        toOffPeak: 'Until discount',
        peakActiveTitle: 'Peak Hours (100% Rate)',
        offPeakActiveTitle: 'Off-Peak Discount (50% OFF)',
        weekendActiveTitle: 'Weekend Discount (50% OFF All Day)',
        tzLocal: 'My Time',
        tzBeijing: 'Beijing (UTC+8)',
        currentTzTime: 'Current Time:',
        bjTimeRef: 'Beijing (UTC+8):',
        schedTitle: 'DeepSeek Tariff Schedule:',
        schedPeak1: '• Peak 1 (100%): ',
        schedPeak2: '• Peak 2 (100%): ',
        schedOffNote: '• Off-Peak (50%): Night, morning & lunch break',
        schedWeekend: '• Weekends (Sat & Sun): 24/7 Half-Price All Day!',
        phaseProgress: 'Current phase progress:',
        langLabel: 'Language:',
        toastPeakTitle: '🔴 Peak Hours Active (100%)',
        toastPeakDesc: 'High-traffic period started. Standard tariff in effect.',
        toastOffTitle: '🟢 50% Discount Active!',
        toastOffDesc: 'Off-peak period started (50% discount on all requests).',
        credit: 'DSH Signal · Bespoke Tariff Monitor',
        days: {
          Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun'
        }
      }
    }

    // Inject breathing pulse animations into head once
    if (typeof document !== 'undefined' && !document.getElementById('dsh-signal-styles')) {
      var styleEl = document.createElement('style')
      styleEl.id = 'dsh-signal-styles'
      styleEl.textContent = [
        '@keyframes dsh-pulse-green {',
        '  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }',
        '  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }',
        '  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }',
        '}',
        '@keyframes dsh-pulse-red {',
        '  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }',
        '  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }',
        '  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }',
        '}',
        '@keyframes dsh-toast-slide {',
        '  from { transform: translateX(110%); opacity: 0; }',
        '  to { transform: translateX(0); opacity: 1; }',
        '}'
      ].join('\n')
      document.head.appendChild(styleEl)
    }

    function getSavedPref(key, fallback) {
      try {
        var v = localStorage.getItem(key)
        if (v) return v
      } catch (e) {}
      return fallback
    }

    function setSavedPref(key, val) {
      try {
        localStorage.setItem(key, val)
      } catch (e) {}
    }

    function getBeijingData(dateObj) {
      var now = dateObj || new Date()
      var formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        weekday: 'short',
        hour12: false
      })
      var parts = formatter.formatToParts(now)
      var d = {}
      for (var i = 0; i < parts.length; i++) {
        d[parts[i].type] = parts[i].value
      }
      var h = parseInt(d.hour, 10) === 24 ? 0 : parseInt(d.hour, 10)
      var m = parseInt(d.minute, 10)
      var s = parseInt(d.second, 10)
      var weekday = d.weekday
      var isWeekend = weekday === 'Sat' || weekday === 'Sun'
      return {
        h: h, m: m, s: s,
        mins: h * 60 + m,
        weekday: weekday,
        isWeekend: isWeekend,
        clock: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
      }
    }

    function getLocalData(dateObj) {
      var now = dateObj || new Date()
      var h = now.getHours()
      var m = now.getMinutes()
      var s = now.getSeconds()
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      var weekday = days[now.getDay()]
      return {
        h: h, m: m, s: s,
        mins: h * 60 + m,
        weekday: weekday,
        clock: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
      }
    }

    function calculateStatus(bj) {
      if (bj.isWeekend) {
        var minsUntilMonday = ((bj.weekday === 'Sat' ? 2 : 1) * 24 * 60) - bj.mins + 540
        var secsLeft = minsUntilMonday * 60 - bj.s
        var phaseTotalSecs = 48 * 3600
        var progress = Math.min(100, Math.max(0, ((phaseTotalSecs - secsLeft) / phaseTotalSecs) * 100))
        return {
          isPeak: false,
          isWeekend: true,
          labelKey: 'weekend',
          priceHintKey: 'rate50',
          secsToNext: secsLeft,
          progress: progress
        }
      }

      for (var i = 0; i < PEAK_RANGES.length; i++) {
        var start = PEAK_RANGES[i][0]
        var end = PEAK_RANGES[i][1]
        if (bj.mins >= start && bj.mins < end) {
          var secsLeft = (end - bj.mins) * 60 - bj.s
          var totalSecs = (end - start) * 60
          var progress = Math.min(100, Math.max(0, ((totalSecs - secsLeft) / totalSecs) * 100))
          return {
            isPeak: true,
            isWeekend: false,
            labelKey: 'peak',
            priceHintKey: 'rate100',
            secsToNext: secsLeft,
            progress: progress
          }
        }
      }

      var nextPeakMin = 0
      var phaseTotal = 0
      if (bj.mins < 540) {
        nextPeakMin = 540
        phaseTotal = 540 * 60
      } else if (bj.mins >= 720 && bj.mins < 840) {
        nextPeakMin = 840
        phaseTotal = 120 * 60
      } else {
        if (bj.weekday === 'Fri') {
          nextPeakMin = (24 * 60 - bj.mins) + (48 * 60) + 540
        } else {
          nextPeakMin = (24 * 60 - bj.mins) + 540
        }
        phaseTotal = (24 * 60 - 1080 + 540) * 60
      }

      var secsLeft = (nextPeakMin > bj.mins ? (nextPeakMin - bj.mins) * 60 : nextPeakMin * 60) - bj.s
      var progress = Math.min(100, Math.max(0, 100 - (secsLeft / (phaseTotal || 1)) * 100))
      return {
        isPeak: false,
        isWeekend: false,
        labelKey: 'offPeak',
        priceHintKey: 'rate50',
        secsToNext: Math.max(0, secsLeft),
        progress: progress
      }
    }

    function formatBeijingHourInTz(bjHour, targetTz) {
      try {
        var now = new Date()
        var bjNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
        var y = bjNow.getFullYear()
        var m = String(bjNow.getMonth() + 1).padStart(2, '0')
        var d = String(bjNow.getDate()).padStart(2, '0')
        var h = String(bjHour).padStart(2, '0')
        var dateInBj = new Date(y + '-' + m + '-' + d + 'T' + h + ':00:00+08:00')
        var opts = { hour: '2-digit', minute: '2-digit', hour12: false }
        if (targetTz === 'beijing') {
          opts.timeZone = 'Asia/Shanghai'
        }
        return new Intl.DateTimeFormat('en-US', opts).format(dateInBj)
      } catch (e) {
        return (bjHour < 10 ? '0' : '') + bjHour + ':00'
      }
    }

    function formatDurationFull(sec) {
      var total = Math.max(0, Math.round(sec))
      var d = Math.floor(total / 86400)
      var h = Math.floor((total % 86400) / 3600)
      var m = Math.floor((total % 3600) / 60)
      var s = total % 60
      var hh = (h < 10 ? '0' : '') + h
      var mm = (m < 10 ? '0' : '') + m
      var ss = (s < 10 ? '0' : '') + s
      if (d > 0) {
        return d + 'd ' + hh + ':' + mm + ':' + ss
      }
      return hh + ':' + mm + ':' + ss
    }

    function formatDurationShort(sec, lang) {
      var total = Math.max(0, Math.round(sec))
      var d = Math.floor(total / 86400)
      var h = Math.floor((total % 86400) / 3600)
      var m = Math.floor((total % 3600) / 60)
      var dUnit = lang === 'ru' ? 'д ' : 'd '
      var hUnit = lang === 'ru' ? 'ч ' : 'h '
      var mUnit = lang === 'ru' ? 'м' : 'm'
      if (d > 0) return d + dUnit + h + hUnit
      if (h > 0) return h + hUnit + m + mUnit
      return m + mUnit
    }

    function SignalMonitor() {
      var langState = react.useState(function () { return getSavedPref('dsh_signal_lang', 'ru') })
      var lang = langState[0]
      var setLang = langState[1]

      var tzState = react.useState(function () { return getSavedPref('dsh_signal_tz', 'local') })
      var tz = tzState[0]
      var setTz = tzState[1]

      var tickState = react.useState(function () { return new Date() })
      var now = tickState[0]
      var setNow = tickState[1]

      var popoverState = react.useState(false)
      var isOpen = popoverState[0]
      var setIsOpen = popoverState[1]

      var toastState = react.useState(null)
      var toast = toastState[0]
      var setToast = toastState[1]

      var prevPeakRef = react.useRef(null)
      var containerRef = react.useRef(null)

      // 1-second live clock tick
      react.useEffect(function () {
        var timer = setInterval(function () {
          setNow(new Date())
        }, 1000)
        return function () { clearInterval(timer) }
      }, [])

      // Close popover when clicking outside
      react.useEffect(function () {
        if (!isOpen) return
        function handleOutsideClick(e) {
          if (containerRef.current && !containerRef.current.contains(e.target)) {
            setIsOpen(false)
          }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return function () { document.removeEventListener('mousedown', handleOutsideClick) }
      }, [isOpen])

      var bj = getBeijingData(now)
      var local = getLocalData(now)
      var st = calculateStatus(bj)

      // Silent visual toast detection on tariff transition
      react.useEffect(function () {
        if (prevPeakRef.current !== null && prevPeakRef.current !== st.isPeak) {
          var toastData = {
            isPeak: st.isPeak,
            id: Date.now()
          }
          setToast(toastData)
          var autoDismiss = setTimeout(function () {
            setToast(function (curr) {
              return (curr && curr.id === toastData.id) ? null : curr
            })
          }, 6000)
          return function () { clearTimeout(autoDismiss) }
        }
        prevPeakRef.current = st.isPeak
      }, [st.isPeak])

      var dict = T[lang] || T.en
      var color = st.isPeak ? COLOR_PEAK : COLOR_OFF
      var colorBg = st.isPeak ? COLOR_PEAK_BG : COLOR_OFF_BG
      var colorBorder = st.isPeak ? COLOR_PEAK_BORDER : COLOR_OFF_BORDER
      var pulseAnimation = st.isPeak ? 'dsh-pulse-red 2s infinite' : 'dsh-pulse-green 2s infinite'

      var displayClock = tz === 'beijing' ? bj.clock : local.clock
      var displayTzName = tz === 'beijing' ? 'UTC+8' : (function () {
        try {
          var name = Intl.DateTimeFormat().resolvedOptions().timeZone
          var shortName = name.split('/').pop().replace(/_/g, ' ')
          return shortName
        } catch (e) {
          return 'Local'
        }
      })()

      var actionWord = st.isPeak ? dict.endsIn : (st.isWeekend ? dict.toPeak : dict.toOffPeak)
      var countdownText = actionWord + ' ' + formatDurationShort(st.secsToNext, lang)

      function switchLang(target) {
        setLang(target)
        setSavedPref('dsh_signal_lang', target)
      }

      function switchTz(target) {
        setTz(target)
        setSavedPref('dsh_signal_tz', target)
      }

      // Schedule window calculations based on selected timezone
      var p1Start = formatBeijingHourInTz(9, tz)
      var p1End = formatBeijingHourInTz(12, tz)
      var p2Start = formatBeijingHourInTz(14, tz)
      var p2End = formatBeijingHourInTz(18, tz)

      // Main header chip element
      var chipElement = react.createElement('div', {
        key: 'signal-chip',
        onClick: function () { setIsOpen(!isOpen) },
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '20px',
          padding: '2px 10px',
          borderRadius: 999,
          background: colorBg,
          border: '1px solid ' + colorBorder,
          color: 'var(--dsw-alias-text-primary, #ffffff)',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
      }, [
        react.createElement('span', {
          key: 'dot',
          style: {
            width: 8, height: 8,
            borderRadius: '50%',
            background: color,
            animation: pulseAnimation,
            flexShrink: 0
          }
        }),
        react.createElement('span', {
          key: 'label',
          style: { fontWeight: 700, color: color }
        }, dict[st.labelKey]),
        react.createElement('span', {
          key: 'clock',
          style: { fontVariantNumeric: 'tabular-nums', opacity: 0.9, letterSpacing: '0.2px' }
        }, displayClock),
        react.createElement('span', {
          key: 'countdown',
          style: { fontVariantNumeric: 'tabular-nums', color: st.isPeak ? '#fca5a5' : '#86efac' }
        }, '· ' + countdownText),
        react.createElement('span', {
          key: 'caret',
          style: { fontSize: 10, opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }
        }, '▾')
      ])

      // Popover details modal
      var popoverElement = null
      if (isOpen) {
        popoverElement = react.createElement('div', {
          key: 'signal-popover',
          style: {
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 330,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontFamily: FONT,
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--dsw-alias-text-primary, #e2e8f0)',
            background: 'var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-base, #1e293b))',
            border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.14))',
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)'
          }
        }, [
          // Header: Status title and badge
          react.createElement('div', {
            key: 'p-header',
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.1))', paddingBottom: 8 }
          }, [
            react.createElement('div', {
              key: 'ph-title-wrap',
              style: { display: 'flex', alignItems: 'center', gap: 6 }
            }, [
              react.createElement('span', {
                key: 'ph-indicator',
                style: { width: 8, height: 8, borderRadius: '50%', background: color }
              }),
              react.createElement('span', {
                key: 'ph-title',
                style: { fontWeight: 700, fontSize: 13, color: color }
              }, st.isPeak ? dict.peakActiveTitle : (st.isWeekend ? dict.weekendActiveTitle : dict.offPeakActiveTitle))
            ]),
            react.createElement('span', {
              key: 'ph-badge',
              style: {
                fontWeight: 700,
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                background: colorBg,
                color: color,
                border: '1px solid ' + colorBorder
              }
            }, dict[st.priceHintKey])
          ]),

          // Timezone Toggle Buttons
          react.createElement('div', {
            key: 'p-tz-toggle',
            style: {
              display: 'flex',
              background: 'var(--dsw-alias-bg-secondary, rgba(255,255,255,0.06))',
              borderRadius: 8,
              padding: 2,
              gap: 2
            }
          }, [
            react.createElement('button', {
              key: 'btn-tz-local',
              type: 'button',
              onClick: function (e) { e.stopPropagation(); switchTz('local') },
              style: {
                flex: 1,
                border: 'none',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: 11.5,
                fontWeight: tz === 'local' ? 600 : 400,
                cursor: 'pointer',
                background: tz === 'local' ? 'var(--dsw-alias-accent, #3b82f6)' : 'transparent',
                color: tz === 'local' ? '#ffffff' : 'var(--dsw-alias-text-secondary, #94a3b8)',
                transition: 'all 0.15s ease'
              }
            }, '🕒 ' + dict.tzLocal + ' (' + displayTzName + ')'),
            react.createElement('button', {
              key: 'btn-tz-bj',
              type: 'button',
              onClick: function (e) { e.stopPropagation(); switchTz('beijing') },
              style: {
                flex: 1,
                border: 'none',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: 11.5,
                fontWeight: tz === 'beijing' ? 600 : 400,
                cursor: 'pointer',
                background: tz === 'beijing' ? 'var(--dsw-alias-accent, #3b82f6)' : 'transparent',
                color: tz === 'beijing' ? '#ffffff' : 'var(--dsw-alias-text-secondary, #94a3b8)',
                transition: 'all 0.15s ease'
              }
            }, '🌏 ' + dict.tzBeijing)
          ]),

          // Live Countdown Section
          react.createElement('div', {
            key: 'p-countdown-box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'var(--dsw-alias-bg-secondary, rgba(255,255,255,0.04))',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.06))'
            }
          }, [
            react.createElement('div', {
              key: 'pc-row',
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            }, [
              react.createElement('span', {
                key: 'pc-label',
                style: { opacity: 0.8, fontSize: 11.5 }
              }, actionWord + ':'),
              react.createElement('span', {
                key: 'pc-val',
                style: { fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 14, color: color }
              }, formatDurationFull(st.secsToNext))
            ]),
            // Progress Bar Track
            react.createElement('div', {
              key: 'pc-bar-track',
              style: {
                width: '100%',
                height: 5,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 3,
                overflow: 'hidden'
              }
            }, [
              react.createElement('div', {
                key: 'pc-bar-fill',
                style: {
                  width: st.progress + '%',
                  height: '100%',
                  background: color,
                  borderRadius: 3,
                  transition: 'width 0.5s ease'
                }
              })
            ])
          ]),

          // Schedule Table mapped to selected timezone
          react.createElement('div', {
            key: 'p-schedule',
            style: {
              fontSize: 11.5,
              background: 'var(--dsw-alias-bg-secondary, rgba(255,255,255,0.03))',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.06))',
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }
          }, [
            react.createElement('div', {
              key: 'ps-title',
              style: { fontWeight: 600, color: 'var(--dsw-alias-text-primary, #ffffff)', marginBottom: 2 }
            }, dict.schedTitle),
            react.createElement('div', {
              key: 'ps-p1',
              style: { color: COLOR_PEAK }
            }, dict.schedPeak1 + p1Start + ' – ' + p1End),
            react.createElement('div', {
              key: 'ps-p2',
              style: { color: COLOR_PEAK }
            }, dict.schedPeak2 + p2Start + ' – ' + p2End),
            react.createElement('div', {
              key: 'ps-off',
              style: { opacity: 0.8 }
            }, dict.schedOffNote),
            react.createElement('div', {
              key: 'ps-wkd',
              style: { color: COLOR_OFF, fontWeight: 500, marginTop: 2 }
            }, dict.schedWeekend)
          ]),

          // Footer: Language Switcher and Credit
          react.createElement('div', {
            key: 'p-footer',
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.08))',
              paddingTop: 8,
              marginTop: 2
            }
          }, [
            react.createElement('span', {
              key: 'pf-credit',
              style: { fontSize: 10.5, opacity: 0.6 }
            }, dict.credit),
            react.createElement('div', {
              key: 'pf-lang-group',
              style: { display: 'inline-flex', gap: 4 }
            }, [
              react.createElement('button', {
                key: 'btn-ru',
                type: 'button',
                onClick: function (e) { e.stopPropagation(); switchLang('ru') },
                style: {
                  background: lang === 'ru' ? 'var(--dsw-alias-accent, #3b82f6)' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: lang === 'ru' ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }
              }, 'RU'),
              react.createElement('button', {
                key: 'btn-en',
                type: 'button',
                onClick: function (e) { e.stopPropagation(); switchLang('en') },
                style: {
                  background: lang === 'en' ? 'var(--dsw-alias-accent, #3b82f6)' : 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: lang === 'en' ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }
              }, 'EN')
            ])
          ])
        ])
      }

      // Silent Visual Toast Notification
      var toastElement = null
      if (toast) {
        var isPeakToast = toast.isPeak
        var toastColor = isPeakToast ? COLOR_PEAK : COLOR_OFF
        var toastBg = isPeakToast ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)'
        var toastBorder = isPeakToast ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'
        var toastTitle = isPeakToast ? dict.toastPeakTitle : dict.toastOffTitle
        var toastDesc = isPeakToast ? dict.toastPeakDesc : dict.toastOffDesc

        toastElement = react.createElement('div', {
          key: 'signal-toast',
          style: {
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 100000,
            width: 320,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-base, #1e293b))',
            border: '1px solid ' + toastBorder,
            boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontFamily: FONT,
            animation: 'dsh-toast-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(16px)'
          }
        }, [
          react.createElement('div', {
            key: 'toast-icon',
            style: {
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: toastColor,
              marginTop: 4,
              flexShrink: 0
            }
          }),
          react.createElement('div', {
            key: 'toast-content',
            style: { flex: 1 }
          }, [
            react.createElement('div', {
              key: 'toast-title',
              style: { fontWeight: 700, fontSize: 13, color: toastColor, marginBottom: 2 }
            }, toastTitle),
            react.createElement('div', {
              key: 'toast-desc',
              style: { fontSize: 11.5, opacity: 0.85, color: 'var(--dsw-alias-text-primary, #ffffff)' }
            }, toastDesc)
          ]),
          react.createElement('button', {
            key: 'toast-close',
            type: 'button',
            onClick: function () { setToast(null) },
            style: {
              background: 'transparent',
              border: 'none',
              color: 'var(--dsw-alias-text-secondary, #94a3b8)',
              cursor: 'pointer',
              fontSize: 14,
              padding: '0 4px',
              lineHeight: 1
            }
          }, '✕')
        ])
      }

      return react.createElement('div', {
        ref: containerRef,
        style: { position: 'relative', display: 'inline-block' }
      }, [chipElement, popoverElement, toastElement])
    }

    function apply(ctx) {
      try {
        var slots = ctx.get('slots') || ctx.slots
        if (!slots) {
          console.warn('[dsh-signal] slots service not available')
          return
        }
        ctx.slots.inject('conversation.session.header.utilities', function () {
          return ctx.slots.register(
            { name: 'conversation.session.header.utilities', id: 'dsh-signal', order: 1 },
            SignalMonitor
          )
        })
      } catch (err) {
        console.error('[dsh-signal] failed to register slot:', err)
      }
    }

    var name = 'dsh-signal'
    var inject = ['slots']

    exports.name = name
    exports.apply = apply
    exports.inject = inject

    return module.exports
  }

  // Register in DSH Module Loader
  if (typeof window !== 'undefined' && window.__ModuleLoader__) {
    window.__ModuleLoader__.load({
      id: MODULE_ID,
      factory: MODULE_FACTORY
    })
  }
})()
