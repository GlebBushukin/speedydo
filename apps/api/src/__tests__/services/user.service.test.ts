jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

jest.mock('../../models/User.model', () => ({
  User: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

import bcrypt from 'bcrypt';
import { User } from '../../models/User.model';
import { UserService } from '../../services/user.service';

const hashMock = bcrypt.hash as unknown as jest.Mock;

const userModel = User as unknown as {
  find: jest.Mock;
  findByIdAndUpdate: jest.Mock;
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches users without passwords', async () => {
    const leanMock = jest.fn().mockResolvedValue([{ _id: 'u1' }]);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    userModel.find.mockReturnValue({ select: selectMock });

    const result = await UserService.get({ userNickname: 'nick' });

    expect(userModel.find).toHaveBeenCalledWith({ userNickname: 'nick' });
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(leanMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ users: [{ _id: 'u1' }] });
  });

  it('uses empty filter when fetching without params', async () => {
    const leanMock = jest.fn().mockResolvedValue([]);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    userModel.find.mockReturnValue({ select: selectMock });

    await UserService.get();

    expect(userModel.find).toHaveBeenCalledWith({});
  });

  it('updates user without hashing when password missing', async () => {
    const leanMock = jest.fn().mockResolvedValue({ _id: 'u1', userNickname: 'nick' });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock });

    const result = await UserService.update('u1', { userNickname: 'nick' });

    expect(hashMock).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { userNickname: 'nick' },
      { new: true },
    );
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(result).toEqual({ _id: 'u1', userNickname: 'nick' });
  });

  it('hashes password before updating user', async () => {
    hashMock.mockResolvedValueOnce('hashed');
    const leanMock = jest.fn().mockResolvedValue({ _id: 'u1', userNickname: 'nick' });
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    userModel.findByIdAndUpdate.mockReturnValue({ select: selectMock });

    const result = await UserService.update('u1', {
      userNickname: 'nick',
      userPassword: 'raw-password',
    });

    expect(hashMock).toHaveBeenCalledWith('raw-password', 10);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { userNickname: 'nick', userPassword: 'hashed' },
      { new: true },
    );
    expect(selectMock).toHaveBeenCalledWith('-password');
    expect(result).toEqual({ _id: 'u1', userNickname: 'nick' });
  });
});
