jest.mock('../../models/Chapter.model', () => ({
  Chapter: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Chapter } from '../../models/Chapter.model';
import { ChapterService } from '../../services/chapter.service';

const chapterModel = Chapter as unknown as {
  find: jest.Mock;
  create: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('ChapterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches chapters with provided filter', async () => {
    const chapters = [{ _id: 'c1' }];
    const leanMock = jest.fn().mockResolvedValue(chapters);
    chapterModel.find.mockReturnValue({ lean: leanMock });

    const result = await ChapterService.get({ level: 'l1' });

    expect(chapterModel.find).toHaveBeenCalledWith({ level: 'l1' });
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ chapters });
  });

  it('uses empty filter when none specified', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    chapterModel.find.mockReturnValue({ lean: leanMock });

    await ChapterService.get();

    expect(chapterModel.find).toHaveBeenCalledWith({});
  });

  it('creates chapter documents', async () => {
    const dto = { chapterTitle: 'Intro', chapterDesc: 'Basics' } as const;
    const toObjectMock = jest.fn().mockReturnValue({ _id: 'c1', ...dto });
    chapterModel.create.mockResolvedValue({ toObject: toObjectMock });

    const result = await ChapterService.create(dto);

    expect(chapterModel.create).toHaveBeenCalledWith(dto);
    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 'c1', ...dto });
  });

  it('updates chapters with lean option', async () => {
    const updated = { _id: 'c1', chapterTitle: 'Updated' };
    chapterModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await ChapterService.update('c1', { chapterTitle: 'Updated' });

    expect(chapterModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'c1',
      { chapterTitle: 'Updated' },
      { new: true, lean: true },
    );
    expect(result).toEqual(updated);
  });

  it('reports deletion as boolean', async () => {
    chapterModel.findByIdAndDelete.mockResolvedValueOnce(null);
    const missing = await ChapterService.delete('missing');
    expect(missing).toBe(false);

    chapterModel.findByIdAndDelete.mockResolvedValueOnce({ _id: 'c1' });
    const existing = await ChapterService.delete('c1');
    expect(existing).toBe(true);
  });
});
