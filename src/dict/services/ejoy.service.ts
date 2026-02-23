import { Injectable } from '@nestjs/common';
// import { ProxyStoreService } from '~@/shared/proxy-manager/proxy-store.service';
import { RequestService } from '~@/shared/request/request.service';
import md5 from 'md5';
const HASH_CODE = 'ego';
const keyHash = 'R10-ego-fs1knl34l2flksdlk3mlsf0-kfdsjksf';
@Injectable()
export class EjoyService {
  constructor(private requestService: RequestService /* , private proxyService: ProxyStoreService */) { }
  _hash(...input) {
    const hashCode = input.length > 1 && input[1] !== undefined ? input[1] : HASH_CODE;
    return md5(hashCode + input[0]);
  }
  async getWord(word: string) {
    const keyHashStr = this._hash(word, keyHash);
    const [client] = await this.requestService.generate();
    const { data } = await client.get(`https://dics.ejoyspace.com/vocab/word?id=${word}&key=${keyHashStr}`);
    return this.toResult(word, data as Record<string, unknown>);
  }
  /** Thu thập tất cả level từ dict.us_dict / dict.uk_dict → defs[].level, trả về level có số lần xuất hiện nhiều nhất. */
  private getMostCommonLevel(jsonData: Record<string, unknown>): string | null {
    const counts: Record<string, number> = {};
    const dict = jsonData.dict as Record<string, unknown> | undefined;
    if (!dict) return null;

    for (const key of ['us_dict', 'uk_dict']) {
      const arr = dict[key] as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        const senses = entry.senses as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(senses)) continue;
        for (const sense of senses) {
          const defs = sense.defs as Array<Record<string, unknown>> | undefined;
          if (!Array.isArray(defs)) continue;
          for (const def of defs) {
            const lv = (def.level as string)?.trim?.() || '';
            if (lv) counts[lv] = (counts[lv] || 0) + 1;
          }
        }
      }
    }

    let maxCount = 0;
    let result: string | null = null;
    for (const [lv, c] of Object.entries(counts)) {
      if (c > maxCount) {
        maxCount = c;
        result = lv;
      }
    }
    return result;
  }


  /** Thu thập tất cả example từ dict.*.senses[].defs[].example (mảng chuỗi), flatten. */
  private collectExamples(jsonData: Record<string, unknown>): string[] {
    const out: string[] = [];
    const dict = jsonData.dict as Record<string, unknown> | undefined;
    if (!dict) return out;

    for (const key of ['us_dict', 'uk_dict']) {
      const arr = dict[key] as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        const senses = entry.senses as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(senses)) continue;
        for (const sense of senses) {
          const defs = sense.defs as Array<Record<string, unknown>> | undefined;
          if (!Array.isArray(defs)) continue;
          for (const def of defs) {
            const ex = def.example as string[] | undefined;
            if (Array.isArray(ex)) out.push(...ex.filter((s) => typeof s === 'string' && s.trim()));
          }
        }
      }
    }
    return [...new Set(out)];
  }

  toResult(word: string, jsonData: Record<string, unknown>) {
    const level = this.getMostCommonLevel(jsonData);
    const examples = this.collectExamples(jsonData).slice(0, 3);
    const phonetics = {
      uk_pronun: jsonData.uk_pronun as string | undefined,
      uk_sound: jsonData.uk_sound as string | undefined,
      us_pronun: jsonData.us_pronun as string | undefined,
      us_sound: jsonData.us_sound as string | undefined,
      grammar: jsonData.grammar as string | undefined,
    };
    return { word, level, examples, phonetics };
  }

}
