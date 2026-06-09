# MongoDB Chat — CRUD Demo
## Grupo 9 | Tema 2 — Document Store

---

## Pré-requisitos
- Node.js instalado (https://nodejs.org)
- Conta gratuita no MongoDB Atlas (https://www.mongodb.com/cloud/atlas)

---

## 1. Criar o banco no MongoDB Atlas (gratuito)

1. Acesse https://cloud.mongodb.com e crie uma conta
2. Crie um cluster gratuito (M0 Free Tier)
3. Em **Database Access**: crie um usuário com senha
4. Em **Network Access**: adicione `0.0.0.0/0` (permite qualquer IP)
5. Em **Clusters > Connect > Drivers**: copie a connection string
   - Exemplo: `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/chatdb`

---

## 2. Configurar o projeto

1. Extraia o ZIP
2. Abra o arquivo `.env` e cole sua connection string:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/chatdb
   ```

---

## 3. Instalar dependências e rodar

Abra o terminal na pasta do projeto e execute:

```bash
npm install
npm start
```

Acesse no navegador: **http://localhost:3000**

---

## O que o app demonstra

| Operação | Como fazer na demo |
|----------|-------------------|
| **INSERT** | Digite uma mensagem e pressione Enter |
| **FIND**   | As mensagens carregam automaticamente (polling a cada 3s) |
| **UPDATE** | Passe o mouse sobre uma mensagem sua → ícone de lápis |
| **DELETE** | Passe o mouse sobre uma mensagem sua → ícone de lixo (soft delete) |

### Abas disponíveis
- **Chat ao vivo** — interface de chat com respostas automáticas dos bots
- **Documentos** — visualiza os documentos reais na coleção MongoDB
- **Log de operações** — cada query executada com a sintaxe MongoDB
- **Schema** — estrutura do documento explicada
- **Estatísticas** — gráfico de operações realizadas

---

## Estrutura do projeto

```
mongodb-chat/
  server.js        ← API REST (Express + MongoDB)
  package.json
  .env             ← sua connection string aqui
  public/
    index.html     ← frontend (abre no navegador)
```

## Rotas da API

| Método | Rota | Operação MongoDB |
|--------|------|-----------------|
| POST   | /messages | insertOne() |
| GET    | /messages?room=geral | find().sort() |
| PUT    | /messages/:id | updateOne() $set |
| DELETE | /messages/:id | updateOne() $set deleted:true |
| DELETE | /messages | deleteMany() |
