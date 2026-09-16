export interface IPASymbol {
  id: string;
  symbol: string;
  example: string;
  category: 'vowel' | 'diphthong' | 'consonant';
  audioUrl: string;
}

export const ipaSymbols: IPASymbol[] = [
  { id: 'i-long', symbol: 'i:', example: 'bean', category: 'vowel', audioUrl: '/audio/ipa/i_long.mp3' },
  { id: 'i-short', symbol: 'ɪ', example: 'tip', category: 'vowel', audioUrl: '/audio/ipa/i_short.mp3' },
  { id: 'u-long', symbol: 'u:', example: 'moon', category: 'vowel', audioUrl: '/audio/ipa/u_long.mp3' },
  { id: 'f-consonant', symbol: 'f', example: 'first', category: 'consonant', audioUrl: '/audio/ipa/f.mp3' },
  // ... demais símbolos mapeados
];