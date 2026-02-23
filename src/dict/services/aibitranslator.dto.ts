import { IsString, IsOptional } from 'class-validator';

/** Body gửi lên api.aibitranslator.com */
export interface TranslateRequestDto {
  from: string;
  to: string;
  text: string;
  provider: string;
}

/** Body cho endpoint POST /dict/translate (from/to/provider optional) */
export class TranslateBodyDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

/** Một entry trong dict (từ/cụm dịch + reverse_translation) */
export interface DictEntryItem {
  word: string;
  reverse_translation?: string[];
  score?: number;
}

/** Một nhóm dict theo từ loại (pos) */
export interface DictEntryGroup {
  pos: string;
  entry: DictEntryItem[];
  base_form?: string;
  pos_enum?: number;
}

/** Response từ api.aibitranslator.com */
export interface TranslateResponseDto {
  trans: string;
  source_language_code: string;
  source_language: string;
  trust_level: number;
  dict: DictEntryGroup[];
}

/** Phần ejoy: level, examples, phonetics */
export interface EjoyPart {
  word: string;
  level: string | null;
  examples: string[];
  phonetics: {
    uk_pronun?: string;
    uk_sound?: string;
    us_pronun?: string;
    us_sound?: string;
    grammar?: string;
  };
}

/** Kết quả gộp từ ejoy + aibitranslator khi search một từ */
export interface WordSearchResultDto {
  word: string;
  ejoy: EjoyPart | null;
  translate: TranslateResponseDto | null;
}
