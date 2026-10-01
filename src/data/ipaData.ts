export interface IpaWordExample {
  word: string;
  highlightText?: string; // Trecho da palavra que representa o som
  audioUrl?: string;      // Opcional para arquivo MP3 futuro
}

export interface IpaDetail {
  id: string;
  symbol: string;
  category: 'vowels' | 'diphthongs' | 'consonants';
  categoryLabel: string;
  keyword: string;
  description: string;
  diagramUrl?: string;
  examples: IpaWordExample[];
}

export const ipaDetailsData: IpaDetail[] = [
  // ==========================================
  // 1. VOWELS / MONOPHTHONGS (12 SÍMBOLOS)
  // ==========================================
  {
    id: 'u_long',
    symbol: 'u:',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'moon',
    description: '/u:/ é um som longo. Lábios em forma de túnel (arredondados) e a língua recolhida no fundo da boca.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Lips+Rounded%0ATongue+Up',
    examples: [{ word: 'too' }, { word: 'group' }, { word: 'shoe' }, { word: 'blue' }]
  },
  {
    id: 'i_long',
    symbol: 'i:',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'see',
    description: '/i:/ é um som longo de vogal. Sorria levemente com lábios esticados e a língua próxima ao céu da boca.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Wide+Smile%0ATongue+High',
    examples: [{ word: 'bean' }, { word: 'see' }, { word: 'team' }, { word: 'happy' }]
  },
  {
    id: 'i_short',
    symbol: 'ɪ',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'sit',
    description: '/ɪ/ é um som curto e relaxado. A boca fica ligeiramente aberta e os lábios relaxados.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Relaxed+Lips%0AShort+Sound',
    examples: [{ word: 'tip' }, { word: 'sit' }, { word: 'big' }, { word: 'gym' }]
  },
  {
    id: 'u_short',
    symbol: 'ʊ',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'book',
    description: '/ʊ/ é um som curto de "u". Lábios levemente arredondados, sem forçar o bico.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slightly+Rounded%0AShort+U',
    examples: [{ word: 'put' }, { word: 'foot' }, { word: 'look' }, { word: 'could' }]
  },
  {
    id: 'e_short',
    symbol: 'e',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'bed',
    description: '/e/ é um som curto equivalente ao "é" do português. Lábios abertos e língua no meio.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Mid+Open%0AShort+E',
    examples: [{ word: 'ten' }, { word: 'pen' }, { word: 'red' }, { word: 'head' }]
  },
  {
    id: 'schwa',
    symbol: 'ə',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'teacher',
    description: '/ə/ (Schwa) é o som mais comum do inglês. Totalmente fraco e relaxado, feito no centro da boca.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Neutral+Mouth%0ASchwa',
    examples: [{ word: 'ago' }, { word: 'banana' }, { word: 'sofa' }, { word: 'doctor' }]
  },
  {
    id: 'er_long',
    symbol: 'ɜ:',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'bird',
    description: '/ɜ:/ é um som longo e neutro. Muito usado em palavras com "ir", "ur", "er".',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Neutral+Tongue%0ALong+Sound',
    examples: [{ word: 'nurse' }, { word: 'work' }, { word: 'learn' }, { word: 'turn' }]
  },
  {
    id: 'or_long',
    symbol: 'ɔ:',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'door',
    description: '/ɔ:/ é um som longo de "ó". Lábios bem arredondados e som vindo do fundo da garganta.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Rounded+Lips%0ALong+O',
    examples: [{ word: 'saw' }, { word: 'walk' }, { word: 'call' }, { word: 'more' }]
  },
  {
    id: 'ae_short',
    symbol: 'æ',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'cat',
    description: '/æ/ é uma mistura de "á" e "é". Abra bem a boca na vertical e puxe os lábios para os lados.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Wide+Open%0ALow+Tongue',
    examples: [{ word: 'pan' }, { word: 'man' }, { word: 'apple' }, { word: 'black' }]
  },
  {
    id: 'ah_short',
    symbol: 'ʌ',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'cup',
    description: '/ʌ/ é um som curto e rápido de "â". Boca aberta de forma relaxada.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Short+Cut%0ARelaxed+A',
    examples: [{ word: 'run' }, { word: 'bus' }, { word: 'love' }, { word: 'sun' }]
  },
  {
    id: 'a_long',
    symbol: 'ɑ:',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'car',
    description: '/ɑ:/ é um som longo e aberto de "á". Imagine o som que faz quando o médico olha sua garganta.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Deep+Open%0ALong+Ah',
    examples: [{ word: 'park' }, { word: 'start' }, { word: 'heart' }, { word: 'father' }]
  },
  {
    id: 'o_short',
    symbol: 'ɒ',
    category: 'vowels',
    categoryLabel: 'Vogais (Vowels)',
    keyword: 'hot',
    description: '/ɒ/ é um som curto de "ó". Muito comum no inglês britânico para palavras com "o".',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Open+Rounded%0AShort+O',
    examples: [{ word: 'stop' }, { word: 'rock' }, { word: 'box' }, { word: 'not' }]
  },

  // ==========================================
  // 2. DIPHTHONGS / DITONGOS (8 SÍMBOLOS)
  // ==========================================
  {
    id: 'ei_diph',
    symbol: 'eɪ',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'say',
    description: '/eɪ/ desliza do som de /e/ para o som de /ɪ/. Semelhante ao "ei" em português.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+E+to+I',
    examples: [{ word: 'make' }, { word: 'train' }, { word: 'day' }, { word: 'late' }]
  },
  {
    id: 'ai_diph',
    symbol: 'aɪ',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'my',
    description: '/aɪ/ desliza do som de /a/ aberto para /ɪ/. Semelhante ao "ai" em português.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+A+to+I',
    examples: [{ word: 'fine' }, { word: 'line' }, { word: 'sky' }, { word: 'night' }]
  },
  {
    id: 'oi_diph',
    symbol: 'ɔɪ',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'boy',
    description: '/ɔɪ/ desliza do som de /ɔ/ para /ɪ/. Semelhante ao "ói" em português.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+O+to+I',
    examples: [{ word: 'coin' }, { word: 'voice' }, { word: 'toy' }, { word: 'point' }]
  },
  {
    id: 'ow_diph',
    symbol: 'əʊ',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'go',
    description: '/əʊ/ desliza do schwa neutro /ə/ para /ʊ/. Som clássico de "ou" em inglês.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+Schwa+to+U',
    examples: [{ word: 'home' }, { word: 'phone' }, { word: 'boat' }, { word: 'know' }]
  },
  {
    id: 'au_diph',
    symbol: 'aʊ',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'now',
    description: '/aʊ/ desliza do som /a/ para /ʊ/. Semelhante ao "au" em português.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+A+to+U',
    examples: [{ word: 'house' }, { word: 'mouth' }, { word: 'cow' }, { word: 'out' }]
  },
  {
    id: 'ear_diph',
    symbol: 'ɪə',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'ear',
    description: '/ɪə/ desliza do som /ɪ/ curto para o schwa neutro /ə/.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+I+to+Schwa',
    examples: [{ word: 'hear' }, { word: 'clear' }, { word: 'beer' }, { word: 'near' }]
  },
  {
    id: 'air_diph',
    symbol: 'eə',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'hair',
    description: '/eə/ desliza do som /e/ para o schwa /ə/.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+E+to+Schwa',
    examples: [{ word: 'air' }, { word: 'care' }, { word: 'pair' }, { word: 'where' }]
  },
  {
    id: 'ure_diph',
    symbol: 'ʊə',
    category: 'diphthongs',
    categoryLabel: 'Ditongos (Diphthongs)',
    keyword: 'pure',
    description: '/ʊə/ desliza do som /ʊ/ para o schwa /ə/.',
    diagramUrl: 'https://placehold.co/240x160/FFFFFF/181818?text=Slide+U+to+Schwa',
    examples: [{ word: 'tourist' }, { word: 'cure' }, { word: 'sure' }, { word: 'endure' }]
  },

  // ==========================================
  // 3. CONSONANTS / CONSOANTES (24 SÍMBOLOS)
  // ==========================================
  {
    id: 'p_consonant',
    symbol: 'p',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'pen',
    description: '/p/ é um som plosivo desvozeado (sem vibração das cordas vocais), feito unindo os lábios.',
    examples: [{ word: 'pet' }, { word: 'cap' }, { word: 'pop' }, { word: 'paper' }]
  },
  {
    id: 'b_consonant',
    symbol: 'b',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'bad',
    description: '/b/ é um som plosivo vozeado (as cordas vocais vibram), feito unindo os lábios.',
    examples: [{ word: 'big' }, { word: 'lab' }, { word: 'ball' }, { word: 'baby' }]
  },
  {
    id: 't_consonant',
    symbol: 't',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'tea',
    description: '/t/ é um som plosivo desvozeado. Toque a ponta da língua no céu da boca, atrás dos dentes.',
    examples: [{ word: 'top' }, { word: 'cat' }, { word: 'stop' }, { word: 'time' }]
  },
  {
    id: 'd_consonant',
    symbol: 'd',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'dog',
    description: '/d/ é um som plosivo vozeado com toque da língua atrás dos dentes superiores.',
    examples: [{ word: 'door' }, { word: 'bed' }, { word: 'red' }, { word: 'day' }]
  },
  {
    id: 'ch_consonant',
    symbol: 'tʃ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'chair',
    description: '/tʃ/ equivale ao som de "tch". Desvozeado e firme.',
    examples: [{ word: 'watch' }, { word: 'cheese' }, { word: 'march' }, { word: 'rich' }]
  },
  {
    id: 'j_consonant',
    symbol: 'dʒ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'june',
    description: '/dʒ/ equivale ao "dj" vozeado (ex: "dia" em certas regiões).',
    examples: [{ word: 'job' }, { word: 'bridge' }, { word: 'age' }, { word: 'jump' }]
  },
  {
    id: 'k_consonant',
    symbol: 'k',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'key',
    description: '/k/ é um som plosivo desvozeado feito no fundo da boca com a parte posterior da língua.',
    examples: [{ word: 'cat' }, { word: 'book' }, { word: 'car' }, { word: 'keep' }]
  },
  {
    id: 'g_consonant',
    symbol: 'g',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'go',
    description: '/g/ é um som plosivo vozeado produzido no fundo da garganta.',
    examples: [{ word: 'get' }, { word: 'bag' }, { word: 'game' }, { word: 'good' }]
  },
  {
    id: 'f_consonant',
    symbol: 'f',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'fish',
    description: '/f/ é um som fricativo desvozeado. Dentes superiores encostam no lábio inferior.',
    examples: [{ word: 'food' }, { word: 'laugh' }, { word: 'off' }, { word: 'first' }]
  },
  {
    id: 'v_consonant',
    symbol: 'v',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'voice',
    description: '/v/ é um som fricativo vozeado com vibração nos dentes e lábio inferior.',
    examples: [{ word: 'van' }, { word: 'love' }, { word: 'give' }, { word: 'very' }]
  },
  {
    id: 'th_unvoiced',
    symbol: 'θ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'think',
    description: '/θ/ é o "th" sopra-dente desvozeado. Coloque a ponta da língua entre os dentes e solte ar.',
    examples: [{ word: 'teeth' }, { word: 'bath' }, { word: 'math' }, { word: 'thirty' }]
  },
  {
    id: 'th_voiced',
    symbol: 'ð',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'this',
    description: '/ð/ é o "th" vozeado. Língua entre os dentes, vibrando as cordas vocais.',
    examples: [{ word: 'mother' }, { word: 'brother' }, { word: 'with' }, { word: 'they' }]
  },
  {
    id: 's_consonant',
    symbol: 's',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'sun',
    description: '/s/ é o som fricativo desvozeado tradicional de "s".',
    examples: [{ word: 'see' }, { word: 'bus' }, { word: 'city' }, { word: 'stop' }]
  },
  {
    id: 'z_consonant',
    symbol: 'z',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'zoo',
    description: '/z/ é o som vozeado de "z" (com zumbido de abelha).',
    examples: [{ word: 'zero' }, { word: 'rose' }, { word: 'buzz' }, { word: 'music' }]
  },
  {
    id: 'sh_consonant',
    symbol: 'ʃ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'shoe',
    description: '/ʃ/ equivale ao som de "x" ou "ch" em português (pedindo silêncio: "shh").',
    examples: [{ word: 'ship' }, { word: 'fish' }, { word: 'wish' }, { word: 'shop' }]
  },
  {
    id: 'zh_consonant',
    symbol: 'ʒ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'vision',
    description: '/ʒ/ equivale ao som vozeado de "j" ou "ge" (ex: "janela").',
    examples: [{ word: 'measure' }, { word: 'casual' }, { word: 'treasure' }, { word: 'decision' }]
  },
  {
    id: 'm_consonant',
    symbol: 'm',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'man',
    description: '/m/ é um som nasal com lábios fechados.',
    examples: [{ word: 'moon' }, { word: 'sum' }, { word: 'arm' }, { word: 'make' }]
  },
  {
    id: 'n_consonant',
    symbol: 'n',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'no',
    description: '/n/ é um som nasal com a língua no céu da boca.',
    examples: [{ word: 'name' }, { word: 'ten' }, { word: 'sun' }, { word: 'nice' }]
  },
  {
    id: 'ng_consonant',
    symbol: 'ŋ',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'sing',
    description: '/ŋ/ é o som nasal do "ng" final. O ar sai pelo nariz com o fundo da língua levantado.',
    examples: [{ word: 'ring' }, { word: 'long' }, { word: 'song' }, { word: 'king' }]
  },
  {
    id: 'h_consonant',
    symbol: 'h',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'hat',
    description: '/h/ é o som de suspiro vindo da garganta (como o "r" de "rua" em algumas regiões).',
    examples: [{ word: 'house' }, { word: 'hot' }, { word: 'home' }, { word: 'hello' }]
  },
  {
    id: 'l_consonant',
    symbol: 'l',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'leg',
    description: '/l/ é o som de "l" com a ponta da língua firme nos dentes superiores.',
    examples: [{ word: 'light' }, { word: 'ball' }, { word: 'call' }, { word: 'love' }]
  },
  {
    id: 'r_consonant',
    symbol: 'r',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'red',
    description: '/r/ no inglês enrola a língua para trás sem encostar no céu da boca ("r" caipira).',
    examples: [{ word: 'run' }, { word: 'car' }, { word: 'room' }, { word: 'read' }]
  },
  {
    id: 'w_consonant',
    symbol: 'w',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'wet',
    description: '/w/ é uma semivogal com lábios bem arredondados como se fosse falar "u".',
    examples: [{ word: 'win' }, { word: 'water' }, { word: 'way' }, { word: 'world' }]
  },
  {
    id: 'j_semivowel',
    symbol: 'j',
    category: 'consonants',
    categoryLabel: 'Consoantes (Consonants)',
    keyword: 'yes',
    description: '/j/ equivale ao som de "i" rápido em palavras como "ia" ou "yellow".',
    examples: [{ word: 'you' }, { word: 'yellow' }, { word: 'use' }, { word: 'young' }]
  }
];