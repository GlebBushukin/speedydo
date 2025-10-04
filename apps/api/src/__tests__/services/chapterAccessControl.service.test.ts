import { Types } from 'mongoose';
import { ChapterAccessControl } from '../../models/ChapterAccessControl.model';
// TODO: после реализации ChapterAccessControlService раскомментировать import ниже
// import { ChapterAccessControlService } from '../../services/chapterAccessControl.service';

jest.mock('../../models/ChapterAccessControl.model', () => ({
  ChapterAccessControl: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

// TODO: заменить "describe.skip(..." на "describe(..."
describe.skip('ChapterAccessControlService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('must return the list of chapter access controls', async () => {
      const mockData = [
        { _id: new Types.ObjectId(), user: new Types.ObjectId(), chapter: new Types.ObjectId() },
      ];
      (ChapterAccessControl.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await ChapterAccessControlService.get();

      expect(ChapterAccessControl.find).toHaveBeenCalledWith({});
      expect(result).toEqual({ chapterAccessControls: mockData });
    });

    it('should use the filter if it is transferred', async () => {
      const filter = { user: new Types.ObjectId() };
      const mockData = [
        { _id: new Types.ObjectId(), user: filter.user, chapter: new Types.ObjectId() },
      ];
      (ChapterAccessControl.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
      });

      const result = await ChapterAccessControlService.get(filter);

      expect(ChapterAccessControl.find).toHaveBeenCalledWith(filter);
      expect(result.chapterAccessControls).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('must create a document and return it', async () => {
      const input = { user: new Types.ObjectId(), chapter: new Types.ObjectId() };
      const createdId = new Types.ObjectId();
      const mockDoc = {
        _id: createdId,
        ...input,
        toObject: () => ({ _id: createdId, ...input }),
      };
      (ChapterAccessControl.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await ChapterAccessControlService.create(input);

      expect(ChapterAccessControl.create).toHaveBeenCalledWith(input);
      expect(result).toEqual({ _id: createdId, ...input });
    });
  });

  describe('update', () => {
    it('must update the document and return the new', async () => {
      const id = new Types.ObjectId().toHexString();
      const update = { chapter: new Types.ObjectId() };
      const mockResult = { _id: id, user: new Types.ObjectId(), ...update };

      (ChapterAccessControl.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockResult);

      const result = await ChapterAccessControlService.update(id, update);

      expect(ChapterAccessControl.findByIdAndUpdate).toHaveBeenCalledWith(id, update, {
        new: true,
        lean: true,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('must return TRUE if the document is deleted', async () => {
      const id = new Types.ObjectId().toHexString();
      (ChapterAccessControl.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: id });

      const result = await ChapterAccessControlService.delete(id);

      expect(ChapterAccessControl.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should return FALSE if the document is not found', async () => {
      (ChapterAccessControl.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await ChapterAccessControlService.delete(new Types.ObjectId().toHexString());

      expect(result).toBe(false);
    });
  });
});
