import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';

const TEST_EMAIL = 'ci-test@paris-janitor.fr';
const TEST_PASSWORD = 'Password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await User.deleteOne({ email: TEST_EMAIL });
});

afterAll(async () => {
  await User.deleteOne({ email: TEST_EMAIL });
  await mongoose.disconnect();
});

describe('Authentification', () => {
  it('crée un compte via /api/auth/register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.role).toBe('VOYAGEUR');
  });

  it('refuse un email déjà utilisé', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
  });

  it('connecte avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('refuse un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'mauvais-mot-de-passe' });

    expect(res.status).toBe(401);
  });
});

describe('Routes protégées', () => {
  it("refuse l'accès au catalogue sans token", async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(401);
  });
});
