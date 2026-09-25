import request from 'supertest';

export async function loginUser(app, email, senha) {
    const resposta = await request(app)
        .post('/api/auth/login')
        .send({
            email,
            senha
        });

    return resposta.body.token;
}