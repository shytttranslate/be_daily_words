import { GCEService } from '~@/google/gce/services/gce.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getToken } from '~@/google/gce/extension';
import { UserAgentService } from '~@/shared/user-agent/user-agent.service';
import _ from 'lodash';
import { RequestService } from '~@/shared/request/request.service';
import { DiscordService } from '~@/shared/discord/discord.service';
import { GoogleModule } from '../google.module';
import { SharedModule } from '~@/shared/shared.module';
import { TestModule } from '~@/shared/test/test.module';
import { GCEProxyManagerService } from '../gce/services/gce.proxy-manager';
jest.setTimeout(60 * 1000);
// import { getToken } from '@google/services/utils/googleToken';
describe('translate by extension', () => {
  let service: GCEService;
  let GCEProxyService: GCEProxyManagerService;
  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [GoogleModule, SharedModule, TestModule],
      providers: [UserAgentService, RequestService, DiscordService],
    }).compile();

    service = app.get<GCEService>(GCEService);
    GCEProxyService = app.get<GCEProxyManagerService>(GCEProxyManagerService);
    await GCEProxyService.sync();
  });
  describe('by-icon', () => {
    it('Can generate correct token line', () => {
      const text = 'helo';
      const token = getToken(text);
      expect(token).toEqual('976751.976751');
    });
    it('Can generate correct token paragraph', () => {
      const text = `If you want to disable ESLint for a specific section of code within a file, you can add the comment before the section and enable it again after the section. Here's an example:`;
      const token = getToken(text);
      expect(token).toEqual('265140.265140');
    });
    it('Can generate token by mutiple lines', () => {
      const text = `West Ham condemn fan behaviour after object hit Fiorentina captain in ECL final
West Ham have released a statement condemning fans who threw objects onto the pitch during Wednesday's Europa Conference League final in Prague.`;
      const token = getToken(text);
      expect(token).toEqual('785384.785384');
    });

    it('Can generate token  long text', () => {
      const text = `Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.Đương nhiên! Đây là một đoạn văn tiếng Việt dài 1000 từ không có xuống dòng. Trái đất chúng ta là một hành tinh đa dạng với hơn 7 tỷ con người sinh sống trên khắp thế giới. Chúng ta có những ngôn ngữ, văn hóa và truyền thống độc đáo. Từ châu Á đến châu Âu, từ châu Mỹ đến châu Phi, mỗi nơi mang trong mình sự đa dạng và phong phú. Cuộc sống trên Trái đất là một bức tranh tuyệt đẹp của sự kỳ diệu tự nhiên và con người. Chúng ta cần yêu quý và bảo vệ hành tinh này để cho những thế hệ tương lai cũng có thể tận hưởng vẻ đẹp và sự sống trên Trái đất.`;
      const token = getToken(text);
      expect(token).toEqual('279330.279330');
    });

    it('can translate a word', async () => {
      const { trans } = await service.translateByIcon('en', 'vi', 'Hello world');
      expect(trans).toEqual(`Chào thế giới`);
    });

    it('can translate a sentence', async () => {
      const { trans } = await service.translateByIcon(
        'en',
        'vi',
        `Your download should start automatically. Didn't work? Try downloading again.`,
      );
      expect(trans).toEqual(`Tải về của bạn sẽ tự khởi động. Không hoạt động? Hãy thử tải xuống lại.`);
    });
    it('can translate a paragraph', async () => {
      const { trans } = await service.translateByIcon(
        'en',
        'vi',
        `
Before you can begin to determine what the composition of a particular paragraph will be, you must first decide on an argument and a working thesis statement for your paper. What is the most important idea that you are trying to convey to your reader? The information in each paragraph must be related to that idea. In other words, your paragraphs should remind your reader that there is a recurrent relationship between your thesis and the information in each paragraph. A working thesis functions like a seed from which your paper, and your ideas, will grow. The whole process is an organic one—a natural progression from a seed to a full-blown paper where there are direct, familial relationships between all of the ideas in the paper.
The decision about what to put into your paragraphs begins with the germination of a seed of ideas; this “germination process” is better known as brainstorming. There are many techniques for brainstorming; whichever one you choose, this stage of paragraph development cannot be skipped. Building paragraphs can be like building a skyscraper: there must be a well-planned foundation that supports what you are building. Any cracks, inconsistencies, or other corruptions of the foundation can cause your whole paper to crumble.`,
      );
      expect(trans.split('\n').length).toEqual(2);
    });

    it('can translate long text', async () => {
      const Text = `Before you can begin to determine what the composition of a particular paragraph will be, you must first decide on an argument and a working thesis statement for your paper. What is the most important idea that you are trying to convey to your reader? The information in each paragraph must be related to that idea. In other words, your paragraphs should remind your reader that there is a recurrent relationship between your thesis and the information in each paragraph. A working thesis functions like a seed from which your paper, and your ideas, will grow. The whole process is an organic one—a natural progression from a seed to a full-blown paper where there are direct, familial relationships between all of the ideas in the paper.
The decision about what to put into your paragraphs begins with the germination of a seed of ideas; this “germination process” is better known as brainstorming. There are many techniques for brainstorming; whichever one you choose, this stage of paragraph development cannot be skipped. Building paragraphs can be like building a skyscraper: there must be a well-planned foundation that supports what you are building. Any cracks, inconsistencies, or other corruptions of the foundation can cause your whole paper to crumble.`;
      const longText = _.times(820, () => {
        return Text;
      }).join('\n');
      const { trans } = await service.translateByIcon('en', 'vi', longText);
      expect(trans.split('\n').length).toEqual(1640);
    });
  });
});
