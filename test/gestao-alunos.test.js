import 'dotenv/config';
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import app from '../src/app.js';
import { loginAdmin } from './helpers/loginAdmin.js';
import { loginUser } from './helpers/loginUser.js';

import dados from './data/alunos.json' with { type: 'json' };

describe('Gestão de Alunos API', () => {
  let adminToken;
  let alunoId;
  let alunoToken;

  const aluno = {
    nome: faker.person.fullName(),
    email: faker.internet.email(),
    matricula: faker.string.numeric(7),
    senha: dados.aluno.senha
  };

  const trabalho = {
    disciplinaId: dados.trabalho.disciplinaId,
    titulo: faker.lorem.words(5),
    descricao: faker.lorem.sentence()
  };

  it('deve realizar login como administrador', async () => {
    adminToken = await loginAdmin(app);

    expect(adminToken).to.be.a('string');
    expect(adminToken).to.not.be.empty;
  });

  it('deve retornar 401 quando a senha do administrador for inválida', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        senha: 'senha-incorreta'
      });

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });

  it('deve cadastrar um aluno', async () => {
    const resposta = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(aluno);

    expect(resposta.status).to.equal(201);
    expect(resposta.body).to.have.property('id');

    alunoId = resposta.body.id;
  });

  it('deve matricular o aluno em uma disciplina', async () => {
    const resposta = await request(app)
      .post(`/api/admin/disciplinas/${dados.trabalho.disciplinaId}/matriculas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        alunoId
      });

    expect(resposta.status).to.equal(201);
  });

  it('deve realizar login como aluno', async () => {
    alunoToken = await loginUser(
      app,
      aluno.email,
      aluno.senha
    );

    expect(alunoToken).to.be.a('string');
    expect(alunoToken).to.not.be.empty;
  });

  it('deve registrar entrega de trabalho como aluno', async () => {
    const resposta = await request(app)
      .post(`/api/alunos/${alunoId}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send(trabalho);

    expect(resposta.status).to.equal(201);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});