export function findCycle(
  enteringCell: [number, number],
  allocation: (number | null)[][],
  rows: number,
  cols: number,
): [number, number][] | null {
  const [startR, startC] = enteringCell;

  const basicCells: [number, number][] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (allocation[i][j] !== null && !(i === startR && j === startC)) {
        basicCells.push([i, j]);
      }
    }
  }

  const path: [number, number][] = [[startR, startC]];

  function dfs(horizontal: boolean): boolean {
    const [curR, curC] = path[path.length - 1];

    if (path.length >= 4 && path.length % 2 === 0) {
      if (horizontal && curR === startR) return true;
    }
    if (path.length >= 4) {
      if (!horizontal && curC === startC) {
        path.push([startR, startC]);
        return true;
      }
    }

    if (path.length > 2 * Math.min(rows, cols) + 2) return false;

    for (const [br, bc] of basicCells) {
      if (horizontal && br === curR && bc !== curC) {
        if (path.some(([pr, pc]) => pr === br && pc === bc)) continue;
        path.push([br, bc]);
        if (dfs(!horizontal)) return true;
        path.pop();
      } else if (!horizontal && bc === curC && br !== curR) {
        if (path.some(([pr, pc]) => pr === br && pc === bc)) continue;
        path.push([br, bc]);
        if (dfs(!horizontal)) return true;
        path.pop();
      }
    }

    return false;
  }

  if (dfs(true)) {
    if (
      path.length > 1 &&
      path[0][0] === path[path.length - 1][0] &&
      path[0][1] === path[path.length - 1][1]
    ) {
      path.pop();
    }
    return path;
  }

  path.length = 0;
  path.push([startR, startC]);
  if (dfs(false)) {
    if (
      path.length > 1 &&
      path[0][0] === path[path.length - 1][0] &&
      path[0][1] === path[path.length - 1][1]
    ) {
      path.pop();
    }
    return path;
  }

  return null;
}
