export type Locale = 'zh' | 'en';

export const LOCALE_STORAGE_KEY = 'nct-ui-locale';

export const uiText = {
  zh: {
    subtitle: '把关于 NCT 的心动地点，一页页收进你的巡礼手账。',
    headerTitle: 'NCT Pilgrimage Archive',
    headerNote: '从地图开始，慢慢整理你的首尔巡礼记录。',
    searchPlaceholder: 'Search places or areas',
    members: '成员筛选',
    placeType: '地点类型',
    route: '我的巡礼',
    mapView: '地图探索',
    wantToGo: '想去',
    visited: '已打卡',
    destination: '地点详情',
    fanCheckins: '用户打卡',
    addCheckin: '上传打卡',
    emptyCheckin: '还没有人打卡，成为第一个来这里的 NCTzen 吧。',
    selectPlace: '在地图上选择一个地点，右侧将显示地点详情与打卡信息。',
    viewSpot: '查看详情',
    routeEmpty: '你还没有任何巡礼记录，先在地图里点“想去”或“已打卡”。',
    routeList: '我的巡礼记录',
    routeHint: '保存想去地点，标记已打卡，把记忆留在这里。',
    addCheckinHint: '可选备注（最多 200 字）',
    addCheckinNeedImage: '请至少上传 1 张图片。',
    addCheckinError: '提交失败，请稍后再试。',
    duplicateWarn: '你刚刚在这个地点打过卡，是否继续提交？',
    submitting: '提交中...',
    uploadAction: '上传打卡',
    language: '语言切换',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    mapBoardTitle: 'Seoul Pilgrimage Map',
    mapBoardNote: 'Map Discovery',
    myPilgrimageTitle: '我的巡礼',
    myPilgrimageNote: 'Saved / Visited / Notes',
    collectionEmpty: '没有匹配地点，试试减少筛选或更换关键词。',
    popupTagMembers: '关联成员',
    popupTagType: '地点类型',
    visitedBadge: 'Visited',
    savedBadge: 'Saved',
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
    headerNote: 'Start on the map, then keep your Seoul pilgrimage records here.',
    searchPlaceholder: 'Search places or areas',
    members: 'Members',
    placeType: 'Place type',
    route: 'My Pilgrimage',
    mapView: 'Map',
    wantToGo: 'Want to go',
    visited: 'Visited',
    destination: 'Destination',
    fanCheckins: 'Fan check-ins',
    addCheckin: 'Add check-in',
    emptyCheckin: 'No check-ins yet. Be the first NCTzen to mark this spot.',
    selectPlace: 'Pick a marker on the map to view full spot details.',
    viewSpot: 'View spot',
    routeEmpty: 'No personal records yet. Mark places as Want to go or Visited on the map.',
    routeList: 'My Pilgrimage Records',
    routeHint: 'Keep your saved places, visited spots, notes, and photos in one place.',
    addCheckinHint: 'Optional note (max 200 chars)',
    addCheckinNeedImage: 'Please upload at least 1 image.',
    addCheckinError: 'Submit failed. Please try again.',
    duplicateWarn: 'You just checked in here. Submit again?',
    submitting: 'Submitting...',
    uploadAction: 'Add check-in',
    language: 'Language',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    mapBoardTitle: 'Seoul Pilgrimage Map',
    mapBoardNote: 'Map Discovery',
    myPilgrimageTitle: 'My Pilgrimage',
    myPilgrimageNote: 'Saved / Visited / Notes',
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
