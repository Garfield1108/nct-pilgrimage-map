export type Locale = 'zh' | 'en';

export const LOCALE_STORAGE_KEY = 'nct-ui-locale';

export const uiText = {
  zh: {
    subtitle: 'Seoul spots, memories, and fan routes.',
    headerTitle: 'NCT Pilgrimage Archive',
    headerNote: '把喜欢的地点贴进你的巡礼手账。',
    searchPlaceholder: 'Search places or areas',
    members: '成员筛选',
    placeType: '地点类型',
    route: '我的巡礼',
    mapView: '地图探索',
    wantToGo: '想去',
    visited: '已打卡',
    visitedSoon: '已打卡（开发中）',
    destination: '地点详情',
    fanCheckins: '用户打卡',
    addCheckin: '上传打卡',
    emptyCheckin: '还没有人打卡，成为第一个来这里的 NCTzen 吧。',
    selectPlace: '在地图上选择一个地点，右侧将显示地点详情与打卡信息。',
    viewSpot: '查看详情',
    routeEmpty: '你还没有收藏地点，先在地图里点“想去”吧。',
    routeList: '收藏地点列表',
    routeMapTitle: '我的巡礼地图',
    routeMapSubtitle: '你的巡礼路线正在成形。',
    routeHint: '你的收藏正在连成一条路线。',
    generateCard: '生成巡礼卡片',
    downloadCard: '下载卡片',
    cardReady: '卡片已生成，可下载或分享。',
    addCheckinHint: '可选备注（最多 200 字）',
    addCheckinNeedImage: '请至少上传 1 张图片。',
    addCheckinError: '提交失败，请稍后再试。',
    duplicateWarn: '你刚刚在这个地点打过卡，是否继续提交？',
    submitting: '提交中...',
    uploadAction: '上传打卡',
    language: '语言',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    mapBoardTitle: 'Seoul Pilgrimage Map',
    mapBoardNote: 'Fan Archive Sheet',
    collectionTitle: '地点收藏册',
    collectionEmpty: '没有匹配地点，试试减少筛选或更换关键词。',
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
    subtitle: 'Seoul spots, memories, and fan routes.',
    headerTitle: 'NCT Pilgrimage Archive',
    headerNote: 'Pin your favorite spots into a living fan scrapbook.',
    searchPlaceholder: 'Search places or areas',
    members: 'Members',
    placeType: 'Place type',
    route: 'My Route',
    mapView: 'Explore',
    wantToGo: 'Want to go',
    visited: 'Visited',
    visitedSoon: 'Visited (Coming soon)',
    destination: 'Destination',
    fanCheckins: 'Fan check-ins',
    addCheckin: 'Add check-in',
    emptyCheckin: 'No check-ins yet. Be the first NCTzen to mark this spot.',
    selectPlace: 'Pick a marker on the map to view full spot details.',
    viewSpot: 'View spot',
    routeEmpty: 'No saved places yet. Add spots with “Want to go”.',
    routeList: 'Saved spots',
    routeMapTitle: 'My Pilgrimage Map',
    routeMapSubtitle: 'Your pilgrimage is taking shape.',
    routeHint: 'Your saved spots are forming a route.',
    generateCard: 'Generate Pilgrimage Card',
    downloadCard: 'Download Card',
    cardReady: 'Card generated. Save it or share it.',
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
    mapBoardNote: 'Fan Archive Sheet',
    collectionTitle: 'Spot Collection',
    collectionEmpty: 'No matching spots. Try fewer filters or another keyword.',
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
