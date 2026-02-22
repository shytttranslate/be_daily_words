import { Injectable } from '@nestjs/common';
import { ProxyStoreService } from '~@/shared/proxy-manager/proxy-store.service';
import { RequestService } from '~@/shared/request/request.service';
import md5 from 'md5';
const HASH_CODE = 'ego';
const keyHash = 'R10-ego-fs1knl34l2flksdlk3mlsf0-kfdsjksf';
@Injectable()
export class EjoyService {
  constructor(
    private requestService: RequestService,
    private proxyService: ProxyStoreService,
  ) {}
  _hash(...input) {
    const hashCode =
      input.length > 1 && input[1] !== undefined ? input[1] : HASH_CODE;
    return md5(hashCode + input[0]);
  }
  async getWord(word: string) {
    const keyHashStr = this._hash(word, keyHash);
    const [client] = await this.requestService.generate();
    const { data } = await client.get(
      `https://dics.glot.ai/vocab/word?id=${word}&key=${keyHashStr}`,
    );
    return data;
  }
}
