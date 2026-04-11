export type Locale = 'zh' | 'en';

export const LOCALE_STORAGE_KEY = 'nct-ui-locale';

export const uiText = {
  zh: {
    subtitle: '把和廷祐有关的首尔糖分地点，一页页夹进私人的收藏册。',
    headerTitle: 'Sugaring Seoul',
    coverNote: '给 sugaringcandy 的私人收藏页',
    heroSubtitle: 'A JOURNEY THROUGH JUNGWOO\'S SEOUL',
    heroScroll: '[ SCROLL TO OPEN BOX ]',
    searchPlaceholder: '搜索廷祐相关地点或首尔区域',
    searchAction: '搜索',
    placeType: '地点类型',
    allPlaceTypes: '全选',
    route: '收藏夹',
    mapView: 'Sugar Map',
    wantToGo: '想去',
    visited: '已打卡',
    basicInfo: '地点信息',
    relationInfo: 'Jungwoo Route',
    descriptionTitle: '\u63d0\u793a',
    descriptionFallback: '适合收进金廷祐巡礼收藏册的一站。',
    noImageText: '暂时没有图片，先记下这个地点。',
    expandDescription: '\u5c55\u5f00\u5b8c\u6574\u4fbf\u7b7e',
    collapseDescription: '\u6536\u8d77\u4fbf\u7b7e',
    navigationTitle: '外部导航',
    googleMaps: 'Google Maps',
    appleMaps: 'Apple Maps',
    selectPlace: '在地图上选择一个地点，翻开廷祐的私藏页面。',
    routeEmpty: '你还没有糖分巡礼地点，先在地图里添加想去或已打卡地点。',
    routeList: '收藏夹',
    routeHint: '',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    collectionEmpty: '还没有匹配地点，换个区域关键词试试。',
    popupMembersLabel: '',
    popupTagType: '类型',
    popupOverline: 'SUGAR SPOT',
    popupNote: '\u63d0\u793a',
    visitedBadge: '已打卡',
    savedBadgeText: '已收藏',
    savedBadge: '已收藏',
    soloLabel: 'Jungwoo',
    sugarTag: 'sugaringcandy archive',
    puppyTag: '狗狗路线',
    candyTag: '糖纸贴签',
    photoSticker: '糖纸封套',
    routeCardKicker: '糖分巡礼便签',
    routeDateSticker: '首尔收藏页',
    placeTypeLabels: {
      cafe: '咖啡店',
      restaurant: '餐厅',
      'filming-spot': '拍摄地',
      other: '其他'
    }
  },
  en: {
    subtitle: 'A private scrapbook of Seoul places that feel like Jungwoo.',
    headerTitle: 'Sugaring Seoul',
    coverNote: 'a private page for sugaringcandy',
    heroSubtitle: 'A JOURNEY THROUGH JUNGWOO\'S SEOUL',
    heroScroll: '[ SCROLL TO OPEN BOX ]',
    searchPlaceholder: 'Search Jungwoo spots or Seoul areas',
    searchAction: 'Search',
    placeType: 'Place type',
    allPlaceTypes: 'All',
    route: 'Collection',
    mapView: 'Sugar Map',
    wantToGo: 'Want to go',
    visited: 'Visited',
    basicInfo: 'Spot Info',
    relationInfo: 'Jungwoo Route',
    descriptionTitle: 'Notes',
    descriptionFallback: 'A soft stop to tuck into your Jungwoo scrapbook.',
    noImageText: 'No photo yet. Save the spot first.',
    expandDescription: 'Read full note',
    collapseDescription: 'Fold note',
    navigationTitle: 'Open in Maps',
    googleMaps: 'Google Maps',
    appleMaps: 'Apple Maps',
    selectPlace: 'Pick a marker to open Jungwoo\'s saved page.',
    routeEmpty: 'No sugar route spots yet. Save or mark Jungwoo spots as visited on the map.',
    routeList: 'Collection',
    routeHint: '',
    localeZh: '中文 CN',
    localeEn: 'English EN',
    collectionEmpty: 'No matching spots yet. Try another Seoul area or type.',
    popupMembersLabel: '',
    popupTagType: 'Type',
    popupOverline: 'SUGAR SPOT',
    popupNote: 'Note',
    visitedBadge: 'Visited',
    savedBadgeText: 'Saved',
    savedBadge: 'Saved',
    soloLabel: 'Jungwoo',
    sugarTag: 'sugaringcandy archive',
    puppyTag: 'puppy route',
    candyTag: 'candy wrap note',
    photoSticker: 'sugar wrap',
    routeCardKicker: 'SUGAR PUPPY NOTE',
    routeDateSticker: 'saved for seoul spring',
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






