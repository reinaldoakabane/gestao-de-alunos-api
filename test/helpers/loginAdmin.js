import request from 'supertest';

export async function loginAdmin(app) {
    const resposta = await request(app)
        .post('/api/auth/login')
        .send({
            email: process.env.ADMIN_EMAIL,
            senha: process.env.ADMIN_PASSWORD
        });

    return resposta.body.token;
}