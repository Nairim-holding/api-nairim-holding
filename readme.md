# Nairim Holding API

Este projeto utiliza o **Prisma** como ORM (Object Relational Mapper) para interagir com um banco de dados PostgreSQL em um ambiente Node.js com TypeScript.

Neste README, você encontrará informações sobre como usar o Prisma, como configurar e executar comandos para gerenciar seu banco de dados e como trabalhar com o cliente Prisma.

## 📦 Tecnologias Usadas

- **Node.js**: Ambiente de execução JavaScript.
- **TypeScript**: Superset do JavaScript, com tipagem estática.
- **Prisma**: ORM moderno para trabalhar com bancos de dados.
- **PostgreSQL**: Banco de dados relacional.
- **Express**: Framework web para Node.js.

## ⚙️ Configuração Inicial

### 1. Instale as dependências

```bash
npm install
``` 


### 2.🚀 Prisma
O Prisma usa um arquivo `schema.prisma` para definir os modelos e a conexão com o banco de dados.

- O arquivo `schema.prisma` está localizado na pasta `prisma/`.
- A string de conexão do banco de dados é definida no arquivo `.env` usando a variável `DATABASE_URL`.

Exemplo de um arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
```

### 3.🚀 Comandos do Prisma

```bash
# Criar e aplicar novas migrações
npx prisma migrate dev --name nome_da_migracao

# Resetar banco de dados e aplicar migrações
npx prisma migrate reset

# Aplicar migrações existentes (produção)
npx prisma migrate deploy
```

## Trabalhar com Banco de Dados
```bash
# Sincronizar schema com banco de dados (sem migrações)
npx prisma db push

# Puxar schema de banco existente
npx prisma db pull

# Popular banco de dados (seed)
npx prisma db seed
```

## Prisma Studio (Interface Visual)
```bash
npx prisma studio
```

## Utilitários
```bash
# Validar schema.prisma
npx prisma validate

# Formatar schema.prisma
npx prisma format

# Ver status das migrações
npx prisma migrate status

# Gerar SQL para migração sem aplicar
npx prisma migrate dev --create-only
```
