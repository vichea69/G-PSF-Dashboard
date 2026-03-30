import { MenuItem } from '@/features/menu/types';

const normalizeParent = (id?: string) => (id ? id : '__root__');

export function listSiblings(items: MenuItem[], parentId?: string) {
  const key = normalizeParent(parentId);
  return items
    .filter((i) => normalizeParent(i.parentId) === key)
    .sort((a, b) => a.order - b.order);
}

export function setSequentialOrder(items: MenuItem[]) {
  return items.map((item, idx) => ({ ...item, order: idx }));
}

export function getDescendantIds(items: MenuItem[], itemId: string) {
  const descendants = new Set<string>();
  const stack = [itemId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (!currentId) continue;

    items.forEach((item) => {
      if (item.parentId !== currentId || descendants.has(item.id)) return;
      descendants.add(item.id);
      stack.push(item.id);
    });
  }

  return descendants;
}

export function wouldCreateMenuCycle(
  items: MenuItem[],
  itemId: string,
  nextParentId?: string | null
) {
  if (!nextParentId) return false;
  if (nextParentId === itemId) return true;
  return getDescendantIds(items, itemId).has(nextParentId);
}

export function reorderAll(
  all: MenuItem[],
  sourceParentId: string | undefined,
  destParentId: string | undefined,
  sourceIndex: number,
  destIndex: number
) {
  const from = listSiblings(all, sourceParentId);
  const to = listSiblings(all, destParentId);

  const fromCopy = [...from];
  const toCopy = [...to];

  const [removed] = fromCopy.splice(sourceIndex, 1);
  const moved = { ...removed, parentId: destParentId };
  toCopy.splice(destIndex, 0, moved);

  const fromRe = setSequentialOrder(fromCopy);
  const toRe = setSequentialOrder(toCopy);

  const fromIds = new Set(fromRe.map((x) => x.id));
  const toIds = new Set(toRe.map((x) => x.id));

  return all.map((i) => {
    if (toIds.has(i.id)) {
      const u = toRe.find((x) => x.id === i.id)!;
      return { ...i, parentId: u.parentId, order: u.order };
    }
    if (fromIds.has(i.id)) {
      const u = fromRe.find((x) => x.id === i.id)!;
      return { ...i, order: u.order };
    }
    return i;
  });
}

export function reorderWithinSameParent(
  all: MenuItem[],
  parentId: string | undefined,
  sourceIndex: number,
  destIndex: number
) {
  const siblings = listSiblings(all, parentId);
  const copy = [...siblings];
  const [removed] = copy.splice(sourceIndex, 1);
  copy.splice(destIndex, 0, removed);
  const re = setSequentialOrder(copy);
  const ids = new Set(re.map((x) => x.id));
  return all.map((i) => {
    if (!ids.has(i.id)) return i;
    const u = re.find((x) => x.id === i.id)!;
    return { ...i, order: u.order };
  });
}
