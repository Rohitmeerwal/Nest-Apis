import { Test, TestingModule } from '@nestjs/testing';
import { ApifeaturesService } from './apifeatures.service';

describe('ApifeaturesService', () => {
  let service: ApifeaturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApifeaturesService],
    }).compile();

    service = module.get<ApifeaturesService>(ApifeaturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
