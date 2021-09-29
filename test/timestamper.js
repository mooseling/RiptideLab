const stamps = [];

function stamp() {
  stamps.push(Date.now());
}

function getSmallestGap() {
  let smallestGap = Infinity;
  for (let index = 1; index < stamps.length; index++) {
    const thisStamp = stamps[index];
    const lastStamp = stamps[index - 1];
    if (thisStamp !== undefined && lastStamp !== undefined) {
      const gap = thisStamp - lastStamp;
      if (gap < smallestGap)
        smallestGap = gap;
    }
  }
  return smallestGap;
}

export {stamp, getSmallestGap};
