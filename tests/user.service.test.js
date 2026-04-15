const userService = require('../src/modules/users/user.service');
const userRepository = require('../src/modules/users/user.repository');

// мокаем репозиторий целиком — тесты не должны ходить в БД
jest.mock('../src/modules/users/user.repository');

// JWT требует секрет из env
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1d';

// вспомогательная функция — создаёт объект пользователя как это делает Mongoose
const makeUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isActive: true,
  comparePassword: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({ ...overrides }),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------

describe('registerUser', () => {
  it('создаёт пользователя и возвращает токен', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(makeUser());

    const result = await userService.registerUser({
      fullName: 'Test User',
      email: 'test@example.com',
      password: '123456',
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
  });

  it('бросает 409 если email уже занят', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      userService.registerUser({ email: 'test@example.com', password: '123456' })
    ).rejects.toMatchObject({ status: 409 });
  });
});

// ---------------------------------------------------------------------------
// loginUser
// ---------------------------------------------------------------------------

describe('loginUser', () => {
  it('возвращает токен при верных данных', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await userService.loginUser('test@example.com', '123456');

    expect(result).toHaveProperty('token');
    expect(user.comparePassword).toHaveBeenCalledWith('123456');
  });

  it('бросает 401 если пользователь не найден', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      userService.loginUser('nobody@example.com', '123456')
    ).rejects.toMatchObject({ status: 401 });
  });

  it('бросает 401 если пароль неверный', async () => {
    const user = makeUser({ comparePassword: jest.fn().mockResolvedValue(false) });
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      userService.loginUser('test@example.com', 'wrongpassword')
    ).rejects.toMatchObject({ status: 401 });
  });

  it('бросает 403 если аккаунт заблокирован', async () => {
    const user = makeUser({ isActive: false });
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      userService.loginUser('test@example.com', '123456')
    ).rejects.toMatchObject({ status: 403 });
  });
});

// ---------------------------------------------------------------------------
// getUserById
// ---------------------------------------------------------------------------

describe('getUserById', () => {
  const userId = '507f1f77bcf86cd799439011';
  const adminId = '507f1f77bcf86cd799439099';

  it('пользователь может получить свой профиль', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);

    const result = await userService.getUserById(userId, userId, 'user');
    expect(result).toEqual(user);
  });

  it('админ может получить чужой профиль', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);

    const result = await userService.getUserById(userId, adminId, 'admin');
    expect(result).toEqual(user);
  });

  it('обычный пользователь не может смотреть чужой профиль', async () => {
    await expect(
      userService.getUserById(userId, adminId, 'user')
    ).rejects.toMatchObject({ status: 403 });
  });

  it('бросает 404 если пользователь не найден', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      userService.getUserById(userId, userId, 'user')
    ).rejects.toMatchObject({ status: 404 });
  });
});

// ---------------------------------------------------------------------------
// blockUser
// ---------------------------------------------------------------------------

describe('blockUser', () => {
  const userId = '507f1f77bcf86cd799439011';
  const adminId = '507f1f77bcf86cd799439099';

  it('админ может заблокировать любого пользователя', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);
    userRepository.updateById.mockResolvedValue({ ...user, isActive: false });

    const result = await userService.blockUser(userId, adminId, 'admin');
    expect(result.isActive).toBe(false);
  });

  it('пользователь может заблокировать сам себя', async () => {
    const user = makeUser();
    userRepository.findById.mockResolvedValue(user);
    userRepository.updateById.mockResolvedValue({ ...user, isActive: false });

    const result = await userService.blockUser(userId, userId, 'user');
    expect(result.isActive).toBe(false);
  });

  it('обычный пользователь не может заблокировать другого', async () => {
    await expect(
      userService.blockUser(userId, adminId, 'user')
    ).rejects.toMatchObject({ status: 403 });
  });

  it('бросает 404 если пользователь не найден', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      userService.blockUser(userId, userId, 'user')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('бросает 400 если пользователь уже заблокирован', async () => {
    userRepository.findById.mockResolvedValue(makeUser({ isActive: false }));

    await expect(
      userService.blockUser(userId, userId, 'user')
    ).rejects.toMatchObject({ status: 400 });
  });
});
