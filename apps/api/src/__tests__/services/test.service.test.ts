jest.mock('../../models/Test.model', () => ({
  Test: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Types } from 'mongoose';
import { Test } from '../../models/Test.model';
import { TestService } from '../../services/test.service';

const testModel = Test as unknown as {
  find: jest.Mock;
  create: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('TestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches tests with provided filter', async () => {
    const tests = [{ _id: 't1' }];
    const leanMock = jest.fn().mockResolvedValue(tests);
    testModel.find.mockReturnValue({ lean: leanMock });

    const result = await TestService.get({ level: 'l1' });

    expect(testModel.find).toHaveBeenCalledWith({ level: 'l1' });
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ tests });
  });

  it('defaults filter to empty object', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    testModel.find.mockReturnValue({ lean: leanMock });

    await TestService.get();

    expect(testModel.find).toHaveBeenCalledWith({});
  });

  it('creates tests and returns plain object', async () => {
    const dto = { successCondition: new Types.ObjectId(), level: new Types.ObjectId() };
    const toObjectMock = jest.fn().mockReturnValue({ _id: 't1', ...dto });
    testModel.create.mockResolvedValue({ toObject: toObjectMock });

    const result = await TestService.create(dto);

    expect(testModel.create).toHaveBeenCalledWith(dto);
    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 't1', ...dto });
  });

  it('updates tests with lean option', async () => {
    const levelId = new Types.ObjectId();
    const updated = { _id: 't1', level: levelId };
    testModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await TestService.update('t1', { level: levelId });

    expect(testModel.findByIdAndUpdate).toHaveBeenCalledWith(
      't1',
      { level: levelId },
      { new: true, lean: true },
    );
    expect(result).toEqual(updated);
  });

  it('maps deletion result to boolean', async () => {
    testModel.findByIdAndDelete.mockResolvedValueOnce(null);
    const missing = await TestService.delete('missing');
    expect(missing).toBe(false);

    testModel.findByIdAndDelete.mockResolvedValueOnce({ _id: 't1' });
    const existing = await TestService.delete('t1');
    expect(existing).toBe(true);
  });
});
