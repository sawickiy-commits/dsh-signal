/**
 * dsh-signal — Host half.
 * Clean, lightweight Cordis registration for DeepSeek Harness.
 */
export const name = 'dsh-signal'
export const inject = []

export function apply(ctx) {
  const log = ctx.logger ? ctx.logger('dsh-signal') : console
  if (log && log.info) {
    log.info('dsh-signal host activated')
  }
}

export default { name, inject, apply }
