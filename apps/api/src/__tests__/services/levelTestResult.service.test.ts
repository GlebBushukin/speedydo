import { Types } from 'mongoose';
import { LevelTestResult } from '../../models/LevelTestResult.model';
// TODO: после реализации LevelTestResultService раскомментировать import ниже
// import { LevelTestResultService } from '../../services/levelTestResult.service';

jest.mock('../../models/LevelTestResult.model', () => ({
  LevelTestResult: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// TODO: заменить "describe.skip(..." на "describe(..."
describe.skip('LevelTestResultService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('must return the list of level test results', async () => {
      const mockData = [
        {
          _id: new Types.ObjectId(),
          user: new Types.ObjectId(),
          level: new Types.ObjectId(),
          ltrPoints: 10,
          ltrAttempt: 1,
          ltrDate: new Date(),
        },
      ];
      (LevelTestResult.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await LevelTestResultService.get();

      expect(LevelTestResult.find).toHaveBeenCalledWith({});
      expect(result).toEqual({ levelTestResults: mockData });
    });

    it('should use the filter if it is transferred', async () => {
      const filter = { user: new Types.ObjectId() };
      const mockData = [
        {
          _id: new Types.ObjectId(),
          user: filter.user,
          level: new Types.ObjectId(),
          ltrPoints: 5,
          ltrAttempt: 2,
          ltrDate: new Date(),
        },
      ];
      (LevelTestResult.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await LevelTestResultService.get(filter);

      expect(LevelTestResult.find).toHaveBeenCalledWith(filter);
      expect(result.levelTestResults).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('must create a document and return it', async () => {
      const input = {
        user: new Types.ObjectId(),
        level: new Types.ObjectId(),
        ltrPoints: 8,
        ltrAttempt: 1,
      };
      const createdId = new Types.ObjectId();
      const mockDoc = {
        _id: createdId,
        ...input,
        toObject: () => ({ _id: createdId, ...input }),
      };
      (LevelTestResult.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await LevelTestResultService.create(input);

      expect(LevelTestResult.create).toHaveBeenCalledWith(input);
      expect(result).toEqual({ _id: createdId, ...input });
    });
  });

  describe('update', () => {
    it('must update the document and return the new', async () => {
      const id = new Types.ObjectId().toHexString();
      const update = { ltrPoints: 12 };
      const mockResult = {
        _id: id,
        user: new Types.ObjectId(),
        level: new Types.ObjectId(),
        ltrPoints: update.ltrPoints,
        ltrAttempt: 3,
      };

      (LevelTestResult.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockResult);

      const result = await LevelTestResultService.update(id, update);

      expect(LevelTestResult.findByIdAndUpdate).toHaveBeenCalledWith(id, update, {
        new: true,
        lean: true,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('must return TRUE if the document is deleted', async () => {
      const id = new Types.ObjectId().toHexString();
      (LevelTestResult.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: id });

      const result = await LevelTestResultService.delete(id);

      expect(LevelTestResult.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should return FALSE if the document is not found', async () => {
      (LevelTestResult.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await LevelTestResultService.delete(new Types.ObjectId().toHexString());

      expect(result).toBe(false);
    });
  });
});
