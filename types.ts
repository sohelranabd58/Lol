
export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  resultImageUrl: string | null;
}

export interface UserPhoto {
  file: File;
  previewUrl: string;
}

export enum PhotoAttire {
  ORIGINAL_ATTIRE = 'keep my original clothes',
  // Men's Styles
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
  // Women's Styles
  W_BLACK_BLAZER = 'black professional blazer and white inner top',
  W_NAVY_SUIT = 'navy blue business blazer suit',
  W_WHITE_BLOUSE = 'elegant white formal silk blouse',
  W_SAREE = 'formal silk saree in elegant professional colors',
  W_SALWAR = 'professional formal Salwar Kameez',
  W_GREY_CARDIGAN = 'grey professional cardigan over a white shirt',
  W_MAROON_DRESS = 'maroon professional high-neck dress',
  W_TEAL_BLAZER = 'modern teal professional blazer',
  W_BEIGE_COAT = 'beige professional trench coat or blazer',
  W_TURTLENECK = 'black professional turtleneck sweater'
}

export interface StudioHistoryItem {
  id: string;
  originalUrl: string;
  resultUrl: string;
  timestamp: number;
}
