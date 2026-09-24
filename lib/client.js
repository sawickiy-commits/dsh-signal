/**
 * dsh-signal — Browser client half.
 *
 * A native header status chip in DeepSeek Harness (conversation.session.header.utilities)
 * showing real-time DeepSeek API Peak / Off-Peak status in Beijing time (UTC+8).
 *
 * Built cleanly for DSH 0.1.7+ with full English and Russian support.
 */
(function () {
  var MODULE_ID = 'dsh-signal'

  var MODULE_FACTORY = function (require) {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')

    // Official DeepSeek peak windows in minutes from midnight (Beijing time)
    // 09:00 = 540, 12:00 = 720, 14:00 = 840, 18:00 = 1080
    var PEAK_RANGES = [
      [540, 720],   // 09:00 - 12:00
      [840, 1080]   // 14:00 - 18:00
    ]

    var PEAK_COLOR = '#ff4d4f'
    var OFF_COLOR = '#52c41a'
    var FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

    var T = {
      en: {
        peak: 'Peak',
        offPeak: 'Off-peak',
        weekend: 'Weekend Off-peak',
        endsIn: 'Ends in',
        toPeak: 'To Peak',
        rate2x: '2× Rate',
        rateHalf: '50% OFF',
        rateHalfLong: '0.5× Rate',
        peakActive: '🔴 Peak Hours Active',
        offPeakActive: '🟢 Off-Peak Discount Active',
        beijingTime: 'Beijing Time (UTC+8):',
        schedTitle: 'Official DeepSeek Pricing Schedule:',
        schedPeak: '• Peak (2× Rate): Weekdays 09:00–12:00 & 14:00–18:00',
        schedOff: '• Off-peak (50% OFF): Weekdays night/morning',
        schedWeekend: '• Weekends (Sat & Sun): 24/7 All-Day Half Price!',
        nextTransition: 'Next transition:',
        langLabel: 'Language / Язык:',
        credit: 'dsh-signal · sawickiy-commits',
        days: {
          Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun'
        }
      },
      ru: {
        peak: 'Пик',
        offPeak: 'Эконом',
        weekend: 'Выходной эконом',
        endsIn: 'До конца',
        toPeak: 'До пика',
        rate2x: 'Тариф ×2',
        rateHalf: 'Скидка 50%',
        rateHalfLong: 'Тариф ×0.5 (Скидка)',
        peakActive: '🔴 Пиковые часы (Тариф 100%)',
        offPeakActive: '🟢 Эконом-режим (Скидка 50%)',
        beijingTime: 'Пекинское время (UTC+8):',
        schedTitle: 'Официальное расписание тарифов DeepSeek:',
        schedPeak: '• Пик (тариф 100%): Будни 09:00–12:00 и 14:00–18:00',
        schedOff: '• Эконом (скидка 50%): Будни ночь, утро и 12:00–14:00',
        schedWeekend: '• Выходные (Сб и Вс): Круглосуточно скидка 50%!',
        nextTransition: 'Смена периода через:',
        langLabel: 'Язык / Language:',
        credit: 'dsh-signal · sawickiy-commits',
        days: {
          Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс'
        }
      }
    }

    function getInitialLang() {
      try {
        var saved = localStorage.getItem('dsh_signal_lang')
        if (saved === 'en' || saved === 'ru') return saved
        if (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().indexOf('ru') === 0) {
          return 'ru'
        }
      } catch (e) {}
      return 'ru' // Default to Russian as requested by user
    }

    function getBeijingTime() {
      var now = new Date()
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
      var weekday = d.weekday // 'Mon', 'Tue', ...
      var isWeekend = weekday === 'Sat' || weekday === 'Sun'
      return {
        h: h, m: m, s: s,
        mins: h * 60 + m,
        weekday: weekday,
        isWeekend: isWeekend,
        clock: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
      }
    }

    function calculateStatus(bj) {
      if (bj.isWeekend) {
        var minsUntilMonday = ((bj.weekday === 'Sat' ? 2 : 1) * 24 * 60) - bj.mins + 540
        var secsLeft = minsUntilMonday * 60 - bj.s
        return {
          isPeak: false,
          isWeekend: true,
          labelKey: 'weekend',
          priceHintKey: 'rateHalf',
          rateHintKey: 'rateHalfLong',
          secsToNext: secsLeft,
          progress: Math.min(100, Math.max(0, (bj.mins / 1440) * 100))
        }
      }

      for (var i = 0; i < PEAK_RANGES.length; i++) {
        var start = PEAK_RANGES[i][0]
        var end = PEAK_RANGES[i][1]
        if (bj.mins >= start && bj.mins < end) {
          var secsLeft = (end - bj.mins) * 60 - bj.s
          var totalSecs = (end - start) * 60
          return {
            isPeak: true,
            isWeekend: false,
            labelKey: 'peak',
            priceHintKey: 'rate2x',
            rateHintKey: 'rate2x',
            secsToNext: secsLeft,
            progress: Math.min(100, Math.max(0, ((totalSecs - secsLeft) / totalSecs) * 100))
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
      return {
        isPeak: false,
        isWeekend: false,
        labelKey: 'offPeak',
        priceHintKey: 'rateHalf',
        rateHintKey: 'rateHalfLong',
        secsToNext: Math.max(0, secsLeft),
        progress: Math.min(100, Math.max(0, 100 - (secsLeft / (phaseTotal || 1)) * 100))
      }
    }

    function formatDuration(sec, l) {
      var total = Math.max(0, Math.round(sec))
      var d = Math.floor(total / 86400)
      var h = Math.floor((total % 86400) / 3600)
      var m = Math.floor((total % 3600) / 60)
      var dUnit = l === 'ru' ? 'д ' : 'd '
      var hUnit = l === 'ru' ? 'ч ' : 'h '
      var mUnit = l === 'ru' ? 'м' : 'm'
      if (d > 0) return d + dUnit + h + hUnit
      return (h > 0 ? h + hUnit : '') + m + mUnit
    }

    function formatDurationFull(sec) {
      var total = Math.max(0, Math.round(sec))
      var h = Math.floor(total / 3600)
      var m = Math.floor((total % 3600) / 60)
      var s = total % 60
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
    }

    function SignalChip() {
      var langState = react.useState(getInitialLang)
      var lang = langState[0]
      var setLang = langState[1]

      var timeState = react.useState(getBeijingTime)
      var bj = timeState[0]
      var setBj = timeState[1]

      var popoverState = react.useState(false)
      var isOpen = popoverState[0]
      var setIsOpen = popoverState[1]

      react.useEffect(function () {
        var timer = setInterval(function () {
          setBj(getBeijingTime())
        }, 1000)
        return function () { clearInterval(timer) }
      }, [])

      var dict = T[lang] || T.en
      var st = calculateStatus(bj)
      var color = st.isPeak ? PEAK_COLOR : OFF_COLOR

      var actionWord = st.isPeak ? dict.endsIn : dict.toPeak
      var countdownText = actionWord + ' ' + formatDuration(st.secsToNext, lang) + ' · ' + dict[st.priceHintKey]
      var statusLabel = dict[st.labelKey]
      var dayName = dict.days[bj.weekday] || bj.weekday

      function switchLang(target) {
        setLang(target)
        try {
          localStorage.setItem('dsh_signal_lang', target)
        } catch (e) {}
      }

      var chipElement = react.createElement('div', {
        onClick: function () { setIsOpen(!isOpen) },
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '20px',
          padding: '2px 10px',
          borderRadius: 999,
          background: 'var(--dsw-alias-bg-layer-1, rgba(127,127,127,0.12))',
          border: '1px solid var(--dsw-alias-border-l1, rgba(127,127,127,0.25))',
          color: 'var(--dsw-alias-text-primary, #e6e6e6)',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease'
        }
      }, [
        react.createElement('span', {
          key: 'dot',
          style: {
            width: 8, height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: '0 0 8px ' + color,
            flexShrink: 0
          }
        }),
        react.createElement('span', {
          key: 'label',
          style: { fontWeight: 700, color: color }
        }, statusLabel),
        react.createElement('span', {
          key: 'clock',
          style: { fontVariantNumeric: 'tabular-nums', opacity: 0.9 }
        }, bj.clock),
        react.createElement('span', {
          key: 'count',
          style: { fontVariantNumeric: 'tabular-nums', color: st.isPeak ? '#ffa39e' : '#b7eb8f' }
        }, countdownText),
        react.createElement('span', {
          key: 'caret',
          style: { fontSize: 10, opacity: 0.6 }
        }, isOpen ? '▾' : '▸')
      ])

      if (!isOpen) return chipElement

      // Popover detail card
      var popover = react.createElement('div', {
        key: 'popover',
        style: {
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 320,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          fontFamily: FONT,
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--dsw-alias-text-primary, #e6e6e6)',
          background: 'var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-base, #1f1f23))',
          border: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.15))',
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(8px)'
        }
      }, [
        // Header
        react.createElement('div', {
          key: 'p-head',
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 6 }
        }, [
          react.createElement('span', { key: 'ph-title', style: { fontWeight: 700, fontSize: 13, color: color } },
            st.isPeak ? dict.peakActive : dict.offPeakActive
          ),
          react.createElement('span', { key: 'ph-rate', style: { fontWeight: 700, color: color } }, dict[st.rateHintKey])
        ]),

        // Current status row
        react.createElement('div', { key: 'p-status' }, [
          react.createElement('span', { key: 'ps-lbl', style: { opacity: 0.7 } }, dict.beijingTime + ' '),
          react.createElement('b', { key: 'ps-val', style: { fontVariantNumeric: 'tabular-nums' } }, bj.clock + ' (' + dayName + ')')
        ]),

        // Schedule guide
        react.createElement('div', { key: 'p-sched', style: { fontSize: 11.5, opacity: 0.85, background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6 } }, [
          react.createElement('div', { key: 'sc-1', style: { fontWeight: 600, marginBottom: 2 } }, dict.schedTitle),
          react.createElement('div', { key: 'sc-2' }, dict.schedPeak),
          react.createElement('div', { key: 'sc-3' }, dict.schedOff),
          react.createElement('div', { key: 'sc-4', style: { color: OFF_COLOR } }, dict.schedWeekend)
        ]),

        // Next switch countdown
        react.createElement('div', { key: 'p-next', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }, [
          react.createElement('span', { key: 'pn-lbl', style: { opacity: 0.8 } }, dict.nextTransition),
          react.createElement('b', { key: 'pn-val', style: { fontVariantNumeric: 'tabular-nums', color: color } },
            formatDurationFull(st.secsToNext)
          )
        ]),

        // Progress bar
        react.createElement('div', {
          key: 'p-bar-track',
          style: { width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }
        }, [
          react.createElement('div', {
            key: 'p-bar-fill',
            style: { width: st.progress + '%', height: '100%', background: color, transition: 'width 0.5s ease' }
          })
        ]),

        // Interactive Language Switcher
        react.createElement('div', {
          key: 'p-lang',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 6,
            marginTop: 2
          }
        }, [
          react.createElement('span', { key: 'pl-lbl', style: { fontSize: 11, opacity: 0.7 } }, dict.langLabel),
          react.createElement('div', {
            key: 'pl-btn-group',
            style: { display: 'inline-flex', gap: 4 }
          }, [
            react.createElement('button', {
              key: 'btn-ru',
              type: 'button',
              onClick: function (e) { e.stopPropagation(); switchLang('ru') },
              style: {
                background: lang === 'ru' ? 'var(--dsw-alias-accent, #3b82f6)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
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
                color: '#fff',
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
        ]),

        // Footer note
        react.createElement('div', {
          key: 'p-foot',
          style: { fontSize: 10, opacity: 0.5, textAlign: 'center', marginTop: 2 }
        }, dict.credit)
      ])

      return react.createElement('div', {
        style: { position: 'relative', display: 'inline-block' }
      }, [chipElement, popover])
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
            SignalChip
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
