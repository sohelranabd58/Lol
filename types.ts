
export type AppView = 'home' | 'passport' | 'prompt-to-image' | 'image-to-image' | 'face-swap' | 'settings';

export interface UserPhoto {
  file: File;
  previewUrl: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export enum PhotoAttire {
  ORIGINAL_ATTIRE = 'keep my original clothes',
  CUSTOM = 'CUSTOM_TEXT',
  // Men (15+)
  M_NAVY_SUIT = 'navy blue suit, white shirt, and red tie',
  M_BLACK_SUIT = 'black tailored suit and slim black tie',
  M_CHARCOAL_SUIT = 'charcoal grey suit and white shirt',
  M_GREY_BLAZER = 'grey blazer with a light blue shirt',
  M_BEIGE_SUIT = 'beige suit with a brown silk tie',
  M_WHITE_SHIRT = 'professional white formal button-down shirt',
  M_BLUE_SHIRT = 'light blue professional oxford shirt',
  M_TUXEDO = 'classic black tuxedo with a black bowtie',
  M_NAVY_POLO = 'high-quality navy blue professional polo shirt',
  M_PANJABI = 'formal white traditional Panjabi',
  M_THOBE = 'traditional clean white Arabic Thobe (Jubba)',
  M_KABLI = 'professional traditional Kabli set',
  M_WAISTCOAT = 'formal waistcoat over a white shirt',
  M_SAFARI = 'formal safari jacket style',
  M_LEATHER = 'professional leather formal jacket',
  M_DENIM = 'professional indigo denim shirt',
  M_SWEATER = 'formal grey V-neck sweater over a white shirt',
  // Women (15+)
  W_BLACK_BLAZER = 'black professional blazer and white inner top',
  W_NAVY_SUIT = 'navy blue business blazer suit',
  W_WHITE_BLOUSE = 'elegant white formal silk blouse',
  W_SAREE = 'formal silk saree in elegant professional colors',
  W_SALWAR = 'professional formal Salwar Kameez',
  W_GREY_CARDIGAN = 'grey professional cardigan over a white shirt',
  W_MAROON_DRESS = 'maroon professional high-neck dress',
  W_TEAL_BLAZER = 'modern teal professional blazer',
  W_BEIGE_COAT = 'beige professional trench coat',
  W_TURTLENECK = 'black professional turtleneck sweater',
  W_ABAYA_HIJAB = 'modest black abaya with a matching clean professional hijab',
  W_MODEST_HIJAB = 'professional modest outfit with an elegant hijab',
  W_PUSSYBOW = 'elegant pussy-bow blouse in soft colors',
  W_SHIFT_DRESS = 'classic business shift dress',
  W_TWEED = 'formal tweed jacket style',
  W_PEPLUM = 'professional peplum top in neutral colors',
  W_SILK_TOP = 'emerald green formal silk top'
}

export const ATTIRE_CATEGORIES = {
  MEN: [
    { id: PhotoAttire.ORIGINAL_ATTIRE, label: 'Keep Original Clothes', bnLabel: 'আসল পোশাক রাখুন' },
    { id: PhotoAttire.M_NAVY_SUIT, label: 'Navy Suit & Tie', bnLabel: 'নেভি স্যুট ও টাই' },
    { id: PhotoAttire.M_BLACK_SUIT, label: 'Black Suit & Tie', bnLabel: 'কালো স্যুট ও টাই' },
    { id: PhotoAttire.M_CHARCOAL_SUIT, label: 'Charcoal Suit', bnLabel: 'চারকোল স্যুট' },
    { id: PhotoAttire.M_GREY_BLAZER, label: 'Grey Blazer', bnLabel: 'ধূসর বলেজার' },
    { id: PhotoAttire.M_BEIGE_SUIT, label: 'Beige Suit', bnLabel: 'বেজ স্যুট' },
    { id: PhotoAttire.M_WHITE_SHIRT, label: 'Formal White Shirt', bnLabel: 'সাদা ফরমাল শার্ট' },
    { id: PhotoAttire.M_BLUE_SHIRT, label: 'Light Blue Shirt', bnLabel: 'হালকা নীল শার্ট' },
    { id: PhotoAttire.M_TUXEDO, label: 'Black Tuxedo', bnLabel: 'কালো টাক্সেডো' },
    { id: PhotoAttire.M_NAVY_POLO, label: 'Navy Polo', bnLabel: 'নেভি পলো শার্ট' },
    { id: PhotoAttire.M_PANJABI, label: 'White Panjabi', bnLabel: 'সাদা পাঞ্জাবি' },
    { id: PhotoAttire.M_THOBE, label: 'Arabic Thobe', bnLabel: 'আরবি জোব্বা' },
    { id: PhotoAttire.M_KABLI, label: 'Formal Kabli', bnLabel: 'ফরমাল কাবলি' },
    { id: PhotoAttire.M_WAISTCOAT, label: 'Waistcoat Set', bnLabel: 'ওয়েস্টকোট সেট' },
    { id: PhotoAttire.M_SAFARI, label: 'Safari Jacket', bnLabel: 'সাফারি জ্যাকেট' },
    { id: PhotoAttire.M_DENIM, label: 'Denim Formal', bnLabel: 'ডেনিম ফরমাল' },
  ],
  WOMEN: [
    { id: PhotoAttire.ORIGINAL_ATTIRE, label: 'Keep Original Clothes', bnLabel: 'আসল পোশাক রাখুন' },
    { id: PhotoAttire.W_BLACK_BLAZER, label: 'Black Blazer', bnLabel: 'কালো ব্লেজার' },
    { id: PhotoAttire.W_NAVY_SUIT, label: 'Navy Business Suit', bnLabel: 'নেভি বিজনেস স্যুট' },
    { id: PhotoAttire.W_WHITE_BLOUSE, label: 'Silk Blouse', bnLabel: 'সিল্ক ব্লাউজ' },
    { id: PhotoAttire.W_SAREE, label: 'Formal Saree', bnLabel: 'ফরমাল শাড়ি' },
    { id: PhotoAttire.W_SALWAR, label: 'Salwar Kameez', bnLabel: 'সালোয়ার কামিজ' },
    { id: PhotoAttire.W_GREY_CARDIGAN, label: 'Grey Cardigan', bnLabel: 'ধূসর কার্ডিগান' },
    { id: PhotoAttire.W_MAROON_DRESS, label: 'High-neck Dress', bnLabel: 'হাই-নেক ড্রেস' },
    { id: PhotoAttire.W_TEAL_BLAZER, label: 'Teal Blazer', bnLabel: 'টিল ব্লেজার' },
    { id: PhotoAttire.W_BEIGE_COAT, label: 'Trench Coat', bnLabel: 'ট্রেঞ্চ কোট' },
    { id: PhotoAttire.W_TURTLENECK, label: 'Turtleneck', bnLabel: 'টার্টলনেক সোয়েটার' },
    { id: PhotoAttire.W_ABAYA_HIJAB, label: 'Abaya & Hijab', bnLabel: 'আবায়া ও হিজাব' },
    { id: PhotoAttire.W_MODEST_HIJAB, label: 'Modest Hijab', bnLabel: 'মডেস্ট হিজাব' },
    { id: PhotoAttire.W_PUSSYBOW, label: 'Pussybow Blouse', bnLabel: 'পুসিবো ব্লাউজ' },
    { id: PhotoAttire.W_TWEED, label: 'Tweed Jacket', bnLabel: 'টুইড জ্যাকেট' },
    { id: PhotoAttire.W_PEPLUM, label: 'Peplum Top', bnLabel: 'পেপলাম টপ' },
    { id: PhotoAttire.W_SILK_TOP, label: 'Silk Top', bnLabel: 'সিল্ক টপ' },
  ],
  CUSTOM: [
    { id: PhotoAttire.CUSTOM, label: 'Custom Attire (Type Below)', bnLabel: 'নিজে লিখে দিন (নিচে)' },
  ]
};

export const STYLE_PRESETS = [
  { id: 'cinematic', label: 'Cinematic', bnLabel: 'সিনেমেটিক', prompt: 'cinematic lighting, shallow depth of field, 8k, professional photography' },
  { id: 'corporate', label: 'Corporate', bnLabel: 'কর্পোরেট', prompt: 'professional high-end corporate office background, soft studio lighting' },
  { id: 'cyberpunk', label: 'Cyberpunk', bnLabel: 'সাইবারপাঙ্ক', prompt: 'futuristic neon city lights, synthwave aesthetic, high-tech environment' },
  { id: 'royal', label: 'Royal', bnLabel: 'রাজকীয়', prompt: 'regal palace background, ornate golden textures, majestic atmosphere' },
  { id: 'renaissance', label: 'Renaissance', bnLabel: 'রেনেসাঁ', prompt: 'classical oil painting style, chiaroscuro lighting, museum masterpiece quality' }
];

export interface StudioHistoryItem {
  id: string;
  originalUrl: string;
  resultUrl: string;
  timestamp: number;
  type: AppView;
}
