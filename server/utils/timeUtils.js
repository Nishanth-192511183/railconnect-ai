/**
 * Time helpers. Trains store "HH:MM" clock times (source data) and journeys
 * store full ISO datetimes once tied to a travel_date. Both are supported.
 */

// "HH:MM" -> minutes since midnight
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// difference in minutes between two "HH:MM" clock times, always >= 0,
// assuming `to` may roll over into the next day if it's earlier than `from`.
function diffMinutesClock(fromHHMM, toHHMM) {
  let diff = timeToMinutes(toHHMM) - timeToMinutes(fromHHMM);
  if (diff < 0) diff += 1440; // rolled past midnight
  return diff;
}

function addMinutesToClock(hhmm, minsToAdd) {
  return minutesToTime(timeToMinutes(hhmm) + minsToAdd);
}

// ISO datetime helpers (used once a journey is anchored to a travel_date)
function diffMinutesISO(fromISO, toISO) {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return Math.round((to.getTime() - from.getTime()) / 60000);
}

function addMinutesToISO(iso, minsToAdd) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minsToAdd);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function combineDateAndTime(dateStr, hhmm) {
  // dateStr: YYYY-MM-DD, hhmm: HH:MM -> "YYYY-MM-DD HH:MM:00"
  return `${dateStr} ${hhmm}:00`;
}
function combineDateAndTime(dateStr, hhmm) {
  if (!hhmm) return null

  const time = String(hhmm)

  if (time.length === 5) {
    return `${dateStr} ${time}:00`
  }

  return `${dateStr} ${time}`
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

function logger(tag, message) {
  const ts = new Date().toISOString();
  // never log secrets - callers are responsible for not passing sensitive data
  console.log(`[${ts}] [${tag}] ${message}`);
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  diffMinutesClock,
  addMinutesToClock,
  diffMinutesISO,
  addMinutesToISO,
  combineDateAndTime,
  formatDuration,
  logger,
};
