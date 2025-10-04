jest.mock('../../models/Question.model', () => ({
  Question: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Types } from 'mongoose';
import { Question } from '../../models/Question.model';
import { QuestionService } from '../../services/question.service';

const questionModel = Question as unknown as {
  find: jest.Mock;
  create: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('QuestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches questions with filter and lean data', async () => {
    const questions = [{ _id: 'q1' }];
    const leanMock = jest.fn().mockResolvedValue(questions);
    questionModel.find.mockReturnValue({ lean: leanMock });

    const result = await QuestionService.get({ test: 't1' });

    expect(questionModel.find).toHaveBeenCalledWith({ test: 't1' });
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ questions });
  });

  it('uses empty filter by default', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    questionModel.find.mockReturnValue({ lean: leanMock });

    await QuestionService.get();

    expect(questionModel.find).toHaveBeenCalledWith({});
  });

  it('creates questions and returns plain objects', async () => {
    const dto = {
      test: new Types.ObjectId(),
      questionTitle: 'Question',
      questionDetails: 'Details',
      questionPoints: 5,
    };
    const toObjectMock = jest.fn().mockReturnValue({ _id: 'q1', ...dto });
    questionModel.create.mockResolvedValue({ toObject: toObjectMock });

    const result = await QuestionService.create(dto);

    expect(questionModel.create).toHaveBeenCalledWith(dto);
    expect(toObjectMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ _id: 'q1', ...dto });
  });

  it('updates questions and keeps lean option', async () => {
    const updated = { _id: 'q1', questionTitle: 'Updated' };
    questionModel.findByIdAndUpdate.mockResolvedValue(updated);

    const result = await QuestionService.update('q1', { questionTitle: 'Updated' });

    expect(questionModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'q1',
      { questionTitle: 'Updated' },
      { new: true, lean: true },
    );
    expect(result).toEqual(updated);
  });

  it('returns deletion outcome as boolean', async () => {
    questionModel.findByIdAndDelete.mockResolvedValueOnce(null);
    const missing = await QuestionService.delete('missing');
    expect(missing).toBe(false);

    questionModel.findByIdAndDelete.mockResolvedValueOnce({ _id: 'q1' });
    const existing = await QuestionService.delete('q1');
    expect(existing).toBe(true);
  });
});
