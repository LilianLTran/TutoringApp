export default function convertTime(minFromMn: number) {
  let period;
  let h = Math.floor(minFromMn / 60);
  if (h > 12) {
    h = h % 12;
    period = "PM"
  } else {
    period = "AM"
  }
  const m = minFromMn % 60;
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  return `${hStr}:${mStr} ${period}`;
}