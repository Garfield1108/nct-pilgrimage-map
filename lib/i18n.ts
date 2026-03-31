export type Locale = 'zh' | 'en';

export const LOCALE_STORAGE_KEY = 'nct-ui-locale';

export const uiText = {
  zh: {
    subtitle: '把关于 NCT 的心动地点，一页页收进你的巡礼手账。',
    headerTitle: 'NCT Pilgrimage Archive',
    searchPlaceholder: '搜索地点或区域',
    members: '成员筛选',
    placeType: '地点类型',
    route: '我的巡礼',
    mapView: '地图探索',
    wantToGo: '想去',
    visited: '已打卡',
    basicInfo: '基本信息',
    relationInfo: '关联信息',
    descriptionTitle: '地点说明',
    actionHint: '收藏后，线下到访再标记已打卡。',
    selectPlace: '在地图上选择一个地点，查看详情。',
    routeEmpty: '你还没有巡礼地点，先在地图里添加想去或已打卡地点。',
    routeList: '我的巡礼地点',
    routeHint: '仅展示你已收藏或已打卡的地点。',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    collectionEmpty: '没有匹配地点，试试减少筛选或更换关键词。',
    popupTagMembers: '成员',
    popupTagType: '类型',
    visitedBadge: '已打卡',
    savedBadge: '已收藏',
    moodTagLabels: {
      hot: 'Hot',
      classic: 'Classic',
      hidden: 'Hidden',
      'photo-spot': 'Photo spot'
    },
    placeTypeLabels: {
      cafe: '咖啡店',
      restaurant: '餐厅',
      'filming-spot': '拍摄地',
      other: '其他'
    }
  },
  en: {
    subtitle: 'Collect the places that feel like NCT, one page at a time.',
    headerTitle: 'NCT Pilgrimage Archive',
    searchPlaceholder: 'Search places or areas',
    members: 'Members',
    placeType: 'Place type',
    route: 'My Pilgrimage',
    mapView: 'Map',
    wantToGo: 'Want to go',
    visited: 'Visited',
    basicInfo: 'Basic Info',
    relationInfo: 'Members & Type',
    descriptionTitle: 'Why fans go here',
    actionHint: 'Save first, then mark visited after your trip.',
    selectPlace: 'Pick a marker on the map to view spot details.',
    routeEmpty: 'No pilgrimage places yet. Save or mark spots as visited on the map.',
    routeList: 'My Pilgrimage Places',
    routeHint: 'Only saved and visited places are shown here.',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    collectionEmpty: 'No matching spots. Try fewer filters or another keyword.',
    popupTagMembers: 'Members',
    popupTagType: 'Type',
    visitedBadge: 'Visited',
    savedBadge: 'Saved',
    moodTagLabels: {
      hot: 'Hot',
      classic: 'Classic',
      hidden: 'Hidden',
      'photo-spot': 'Photo spot'
    },
    placeTypeLabels: {
      cafe: 'Cafe',
      restaurant: 'Restaurant',
      'filming-spot': 'Filming Spot',
      other: 'Other'
    }
  }
} as const;

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return value === 'en' ? 'en' : 'zh';
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
