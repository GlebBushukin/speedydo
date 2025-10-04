// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: после реализации LevelAccessControlService удалить коментарии выше

import { Types } from 'mongoose';
import { LevelAccessControl } from '../../models/LevelAccessControl.model';
// TODO: после реализации LevelAccessControlService раскомментировать import ниже
// import { LevelAccessControlService } from '../../services/levelAccessControl.service';

jest.mock('../../models/LevelAccessControl.model', () => ({
  LevelAccessControl: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// TODO: заменить "describe.skip(..." на "describe(..."
describe.skip('LevelAccessControlService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('must return the list of level access controls', async () => {
      const mockData = [
        { _id: new Types.ObjectId(), user: new Types.ObjectId(), level: new Types.ObjectId() },
      ];
      (LevelAccessControl.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await LevelAccessControlService.get();

      expect(LevelAccessControl.find).toHaveBeenCalledWith({});
      expect(result).toEqual({ levelAccessControls: mockData });
    });

    it('should use the filter if it is transferred', async () => {
      const filter = { user: new Types.ObjectId() };
      const mockData = [
        { _id: new Types.ObjectId(), user: filter.user, level: new Types.ObjectId() },
      ];
      (LevelAccessControl.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await LevelAccessControlService.get(filter);

      expect(LevelAccessControl.find).toHaveBeenCalledWith(filter);
      expect(result.levelAccessControls).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('must create a document and return it', async () => {
      const input = { user: new Types.ObjectId(), level: new Types.ObjectId() };
      const createdId = new Types.ObjectId();
      const mockDoc = {
        _id: createdId,
        ...input,
        toObject: () => ({ _id: createdId, ...input }),
      };
      (LevelAccessControl.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await LevelAccessControlService.create(input);

      expect(LevelAccessControl.create).toHaveBeenCalledWith(input);
      expect(result).toEqual({ _id: createdId, ...input });
    });
  });

  describe('update', () => {
    it('must update the document and return the new', async () => {
      const id = new Types.ObjectId().toHexString();
      const update = { level: new Types.ObjectId() };
      const mockResult = { _id: id, user: new Types.ObjectId(), ...update };

      (LevelAccessControl.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockResult);

      const result = await LevelAccessControlService.update(id, update);

      expect(LevelAccessControl.findByIdAndUpdate).toHaveBeenCalledWith(id, update, {
        new: true,
        lean: true,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('must return TRUE if the document is deleted', async () => {
      const id = new Types.ObjectId().toHexString();
      (LevelAccessControl.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: id });

      const result = await LevelAccessControlService.delete(id);

      expect(LevelAccessControl.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should return FALSE if the document is not found', async () => {
      (LevelAccessControl.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await LevelAccessControlService.delete(new Types.ObjectId().toHexString());

      expect(result).toBe(false);
    });
  });
});
