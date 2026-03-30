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
    destination: '地点详情',
    basicInfo: '基本信息',
    relationInfo: '关联信息',
    descriptionTitle: '地点说明',
    actionHint: '先收藏，再到访后标记已打卡。',
    fanCheckins: '我的巡礼记录',
    addCheckin: '添加巡礼记录',
    emptyCheckin: '你还没有在这个地点留下个人记录。',
    selectPlace: '在地图上选择一个地点，右侧会显示详细信息。',
    routeEmpty: '你还没有巡礼记录，先在地图里添加想去或已打卡地点。',
    routeList: '我的巡礼地点',
    routeHint: '这里集中展示你保存和已打卡的地点。',
    addCheckinHint: '文字备注（可选，最多 200 字）',
    addCheckinNeedContent: '请至少填写备注或上传 1 张图片。',
    addCheckinImageOptional: '图片可选。支持仅文字记录。',
    addCheckinError: '提交失败，请稍后再试。',
    duplicateWarn: '你刚刚在这个地点提交过记录，是否继续提交？',
    submitting: '提交中...',
    uploadAction: '保存记录',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    mapBoardTitle: '首尔巡礼地图',
    myPilgrimageTitle: '我的巡礼',
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
    destination: 'Place Details',
    basicInfo: 'Basic Info',
    relationInfo: 'Members & Type',
    descriptionTitle: 'Why fans go here',
    actionHint: 'Save first, then mark visited after your trip.',
    fanCheckins: 'My Notes & Photos',
    addCheckin: 'Add personal note',
    emptyCheckin: 'No personal records yet for this place.',
    selectPlace: 'Pick a marker on the map to view spot details.',
    routeEmpty: 'No personal records yet. Save or mark spots as visited on the map.',
    routeList: 'My Pilgrimage Places',
    routeHint: 'Your saved and visited places in one list.',
    addCheckinHint: 'Text note (optional, max 200 chars)',
    addCheckinNeedContent: 'Please add a note or at least 1 image.',
    addCheckinImageOptional: 'Image is optional. Text-only records are supported.',
    addCheckinError: 'Submit failed. Please try again.',
    duplicateWarn: 'You just added a record here. Submit again?',
    submitting: 'Submitting...',
    uploadAction: 'Save record',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    mapBoardTitle: 'Seoul Pilgrimage Map',
    myPilgrimageTitle: 'My Pilgrimage',
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
