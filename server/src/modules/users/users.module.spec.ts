import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  it('expone UsersService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    const service = moduleRef.get(UsersService);
    expect(service).toBeDefined();
  });
});
