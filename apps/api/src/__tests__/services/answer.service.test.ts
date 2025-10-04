jest.mock('../../models/Answer.model', () => ({
  Answer: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Types } from 'mongoose';
import { Answer } from '../../models/Answer.model';
import { AnswerService } from '../../services/answer.service';

const answerModel = Answer as unknown as {
  find: jest.Mock;
  create: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('AnswerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gets answers with filter and lean results', async () => {
    const answers = [{ _id: 'a1' }];
    const leanMock = jest.fn().mockResolvedValue(answers);
    answerModel.find.mockReturnValue({ lean: leanMock });

    const result = await AnswerService.get({ question: 'q1' });

    expect(answerModel.find).toHaveBeenCalledWith({ question: 'q1' });
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ answers });
  });

  it('defaults to empty filter when none provided', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    answerModel.find.mockReturnValue({ lean: leanMock });

    await AnswerService.get();

    expect(answerModel.find).toHaveBeenCalledWith({});
  });

  it('creates answers and returns plain object', async () => {
    const questionId = new Types.ObjectId();
    const dto = { question: questionId, answerTitle: 'Title', answersValid: true };
    const toObjectMock = jest.fn().mockReturnValue({ _id: 'new-id', ...dto });
    answerModel.create.mockResolvedValue({ toObject: toObjectMock });

    const result = await AnswerService.create(dto);

    expect(answerModel.create).toHaveBeenCalledWith(dto);
    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 'new-id', ...dto });
  });

  it('updates answer using lean query option', async () => {
    const updated = { _id: 'a1', answerTitle: 'updated' };
    answerModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await AnswerService.update('a1', { answerTitle: 'updated' });

    expect(answerModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'a1',
      { answerTitle: 'updated' },
      { new: true, lean: true },
    );
    expect(result).toEqual(updated);
  });

  it('returns deletion status as boolean', async () => {
    answerModel.findByIdAndDelete.mockResolvedValueOnce(null);
    const first = await AnswerService.delete('missing');
    expect(first).toBe(false);

    answerModel.findByIdAndDelete.mockResolvedValueOnce({ _id: 'a1' });
    const second = await AnswerService.delete('a1');
    expect(second).toBe(true);
  });
});
