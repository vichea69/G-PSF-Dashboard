import {
  type LocalizedMenuLabel,
  type MenuGroup,
  type MenuItem,
  type MenuItemType,
  toLocalizedLabel
} from '@/features/menu/types';

type AnyRecord = Record<string, unknown>;

const FALLBACK_MENU_TYPE: MenuItemType = 'custom';

const toStringSafe = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const toBooleanSafe = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

const inferMenuItemType = (rawType: unknown, url: string): MenuItemType => {
  const candidate = toStringSafe(rawType).toLowerCase();
  if (
    candidate === 'page' ||
    candidate === 'post' ||
    candidate === 'category' ||
    candidate === 'custom' ||
    candidate === 'external'
  ) {
    return candidate;
  }

  if (/^https?:\/\//i.test(url)) return 'external';
  return FALLBACK_MENU_TYPE;
};

const toParentId = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  return toStringSafe(value) || undefined;
};

const flattenTreeItems = (input: unknown[], parentId?: string): MenuItem[] => {
  const rows: MenuItem[] = [];

  input.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const raw = item as AnyRecord;

    const id = toStringSafe(raw.id, `menu-item-${parentId ?? 'root'}-${index}`);
    const url = toStringSafe(raw.url, '');
    const orderRaw =
      typeof raw.orderIndex === 'number'
        ? raw.orderIndex
        : typeof raw.order === 'number'
          ? raw.order
          : index;

    const resolvedParentId = parentId ?? toParentId(raw.parentId);
    const label = toLocalizedLabel(raw.label) as LocalizedMenuLabel;

    rows.push({
      id,
      label,
      url,
      type: inferMenuItemType(raw.type, url),
      parentId: resolvedParentId,
      order: Number.isFinite(orderRaw) ? Number(orderRaw) : index,
      isVisible: toBooleanSafe(raw.isVisible, true),
      openInNewTab: toBooleanSafe(raw.openInNewTab, false),
      cssClass: toStringSafe(raw.cssClass),
      icon: toStringSafe(raw.icon)
    });

    const children = Array.isArray(raw.children)
      ? raw.children
      : Array.isArray(raw.items)
        ? raw.items
        : [];

    if (children.length > 0) {
      rows.push(...flattenTreeItems(children, id));
    }
  });

  return rows;
};

const pickMenuRecord = (input: unknown): AnyRecord => {
  if (!input || typeof input !== 'object') return {};
  const raw = input as AnyRecord;
  const directData = raw.data;

  if (
    directData &&
    typeof directData === 'object' &&
    !Array.isArray(directData)
  ) {
    return directData as AnyRecord;
  }

  return raw;
};

export const normalizeMenuTreeResponse = (
  input: unknown,
  slug: string
): MenuGroup => {
  const record = pickMenuRecord(input);
  const menuRecord =
    record.menu &&
    typeof record.menu === 'object' &&
    !Array.isArray(record.menu)
      ? (record.menu as AnyRecord)
      : record;

  const itemsInput = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.tree)
      ? record.tree
      : Array.isArray(menuRecord.items)
        ? menuRecord.items
        : [];

  const items = flattenTreeItems(itemsInput);
  const name = toStringSafe(menuRecord.name, toStringSafe(record.name, slug));

  return {
    id: toStringSafe(menuRecord.id, toStringSafe(record.id, slug)),
    slug: toStringSafe(menuRecord.slug, toStringSafe(record.slug, slug)),
    name,
    location: toStringSafe(
      menuRecord.location,
      toStringSafe(record.location, 'menu')
    ),
    description: toStringSafe(
      menuRecord.description,
      toStringSafe(record.description, '')
    ),
    items,
    isActive: toBooleanSafe(
      menuRecord.isActive,
      toBooleanSafe(record.isActive, true)
    ),
    createdAt: toStringSafe(
      menuRecord.createdAt,
      toStringSafe(record.createdAt, '')
    )
  };
};
