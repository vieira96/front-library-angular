# Library App - Frontend

Interface web da aplicação de biblioteca, desenvolvida com Angular.

## Tecnologias

- Angular 19.2
- TypeScript 5.7
- Tailwind CSS 4
- RxJS 7.8
- Node.js 20.19.1
- npm 10.8.2

## API

Este frontend consome a API Java/Spring Boot disponível em:

<https://github.com/vieira96/api-livraria-java-spring-boot>

Para executar o frontend localmente, a API deve estar em execução em
`http://localhost:8000`. A URL base configurada é:

```text
http://localhost:8000/api
```

## Como executar

Crie a configuração local a partir do exemplo:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Abra <http://localhost:4200> no navegador.

## Autenticação

- O access token fica apenas em memória.
- O refresh token é armazenado pela API em cookie `HttpOnly`.
- O interceptor adiciona o bearer token nas chamadas protegidas.
- Ao recarregar a página, o Angular tenta renovar a sessão usando o cookie.
- Rotas protegidas redirecionam para o login quando não existe sessão válida.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o servidor local na porta 4200. |
| `npm run build` | Gera o build de desenvolvimento em `dist/`. |
| `npm run watch` | Gera o build em modo observação. |
| `npm test` | Executa os testes unitários com Karma. |

## Estrutura

```text
src/app/
├── core/       # infraestrutura e estado global
├── features/   # funcionalidades da aplicação
├── layout/     # elementos de layout compartilhados
└── testing/    # utilitários de testes
```
