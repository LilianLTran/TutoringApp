export type Block = { startMin: number; endMin: number };

// true overlap (not touching)
export function overlaps(a: Block, b: Block) {
  return a.startMin < b.endMin && a.endMin > b.startMin;
}

// overlap OR touching (useful for merging recurring)
export function overlapsOrTouches(a: Block, b: Block) {
  return a.startMin <= b.endMin && a.endMin >= b.startMin;
}

export function subtract(blocks: Block[], cut: Block): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    if (!overlaps(b, cut)) {
      out.push(b);
      continue;
    }
    if (cut.startMin > b.startMin) out.push({ startMin: b.startMin, endMin: cut.startMin });
    if (cut.endMin < b.endMin) out.push({ startMin: cut.endMin, endMin: b.endMin });
  }
  return out;
}

export function merge(blocks: Block[], touch = true): Block[] {
  if (blocks.length <= 1) return blocks;

  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin);
  const out: Block[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];

    const shouldMerge = touch ? cur.startMin <= last.endMin : cur.startMin < last.endMin;
    if (shouldMerge) last.endMin = Math.max(last.endMin, cur.endMin);
    else out.push({ ...cur });
  }

  return out;
}