jest.mock('../../models/Level.model', () => ({
  Level: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Types } from 'mongoose';
import { DifficultyEnum } from '../../models/DifficultyEnum.model';
import { Level } from '../../models/Level.model';
import { LevelService } from '../../services/level.service';

const levelModel = Level as unknown as {
  find: jest.Mock;
  create: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('LevelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches levels using provided filter', async () => {
    const levels = [{ _id: 'l1' }];
    const leanMock = jest.fn().mockResolvedValue(levels);
    levelModel.find.mockReturnValue({ lean: leanMock });

    const result = await LevelService.get({ chapter: 'c1' });

    expect(levelModel.find).toHaveBeenCalledWith({ chapter: 'c1' });
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ levels });
  });

  it('falls back to empty filter when missing', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    levelModel.find.mockReturnValue({ lean: leanMock });

    await LevelService.get();

    expect(levelModel.find).toHaveBeenCalledWith({});
  });

  it('creates levels and returns plain object', async () => {
    const dto = {
      chapter: new Types.ObjectId(),
      levelTitle: 'Level 1',
      levelDesc: 'Basics',
      levelDifficulty: DifficultyEnum.LOW,
      levelWords: 10,
      levelTimeSec: 60,
    };
    const toObjectMock = jest.fn().mockReturnValue({ _id: 'l1', ...dto });
    levelModel.create.mockResolvedValue({ toObject: toObjectMock });

    const result = await LevelService.create(dto);

    expect(levelModel.create).toHaveBeenCalledWith(dto);
    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 'l1', ...dto });
  });

  it('updates levels and keeps lean options', async () => {
    const updated = { _id: 'l1', levelTitle: 'Updated' };
    levelModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await LevelService.update('l1', { levelTitle: 'Updated' });

    expect(levelModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'l1',
      { levelTitle: 'Updated' },
      { new: true, lean: true },
    );
    expect(result).toEqual(updated);
  });

  it('returns boolean for delete result', async () => {
    levelModel.findByIdAndDelete.mockResolvedValueOnce(null);
    const missing = await LevelService.delete('missing');
    expect(missing).toBe(false);

    levelModel.findByIdAndDelete.mockResolvedValueOnce({ _id: 'l1' });
    const existing = await LevelService.delete('l1');
    expect(existing).toBe(true);
  });
});
