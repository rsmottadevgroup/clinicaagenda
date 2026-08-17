# Clínica Bem Estar — Sistema Web de Agendamento

Sistema completo para clínica médica: site institucional, autenticação, agendamento de consultas com calendário, painel administrativo e notificações push. Construído em HTML, CSS e JavaScript puro (sem frameworks), com Supabase como backend.

## Estrutura de pastas

```
/clinica
├── index.html                  # Home institucional
├── firebase-messaging-sw.js    # Service worker do push (raiz obrigatória)
├── /css                        # variables, base, home, auth, dashboard
├── /js
│   ├── app.js                  # comportamentos globais
│   ├── /utils                  # toast.js, validators.js
│   ├── /modules                # auth.js, booking.js, admin.js, notifications.js
│   └── /pages                  # script específico de cada página
├── /pages                      # login, cadastro, dashboard, admin, erros...
├── /config                     # supabase-config.js, firebase-config.js
├── /database                   # schema.sql, edge-function-exemplo.md
└── /assets                     # imagens e ícones
```

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e execute todo o conteúdo de `database/schema.sql`. Isso cria as tabelas, índices, políticas RLS, funções e os dados iniciais de disponibilidade.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.
4. Cole esses valores em `config/supabase-config.js`:
   ```js
   const SUPABASE_URL = "https://awicyopjfjawjngeeokt.supabase.co";
   const SUPABASE_ANON_KEY = "sb_publishable_tAXDcwTZzirZmWdM-e9hww_Sl30fTwE";
   ```
5. Em **Authentication > Email**, habilite "Confirm email" conforme sua preferência.

### Criar o administrador

1. Cadastre-se normalmente pelo site (`pages/cadastro.html`) — você entrará como "cliente".
2. No SQL Editor do Supabase, rode:
   ```sql
   update usuarios set role = 'admin' where email = 'seu-email@exemplo.com';
   ```
3. Faça login novamente: você será redirecionado ao painel administrativo.

## 2. Configurar o Firebase (push notifications)

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Adicione um app Web e copie as credenciais para `config/firebase-config.js` **e** para `firebase-messaging-sw.js` (as duas precisam ser idênticas).
3. Em **Project Settings > Cloud Messaging > Web Push certificates**, gere a chave VAPID e cole em `FCM_VAPID_KEY`.
4. O envio real do push (servidor) exige uma Edge Function separada — veja `database/edge-function-exemplo.md` para o passo a passo, pois a chave de serviço do Firebase nunca deve ficar no frontend.

## 3. Publicar o site

Qualquer hospedagem de arquivos estáticos funciona (Vercel, Netlify, GitHub Pages, Supabase Storage, etc.), já que não há backend próprio — tudo roda via Supabase. Basta enviar a pasta inteira e apontar o domínio para `index.html`.

## 4. Personalização

| O que alterar | Onde |
|---|---|
| Cores da marca | `css/variables.css` (`--color-blue-petrol`, `--color-green-soft`, etc.) |
| Textos e imagens da home | `index.html` |
| Logo/ícone | Trocar `<i class="fa-solid fa-staff-snake">` por `<img>` no header |
| Dados de contato | Tabela `configuracoes` no Supabase (ou direto no HTML) |
| Nova especialidade | Duplicar um `.specialty-card` em `index.html` (seção Especialidades) |
| Novo horário/dia de atendimento | Painel Admin > Disponibilidade (não precisa editar código) |
| Duração da consulta | Painel Admin > Disponibilidade > campo "Duração da consulta" |
| Nova página | Criar `.html` em `/pages`, importar os CSS/JS necessários e, se for área logada, chamar `Auth.protegerPagina("cliente"|"admin")` |

## 5. Segurança implementada

- Row Level Security (RLS) no Supabase: cada paciente só vê seus próprios dados; apenas admins veem tudo.
- `Auth.protegerPagina()` bloqueia o acesso direto às páginas internas sem sessão válida.
- Sanitização de campos de texto livre (`sanitizeInput`) antes de gravar no banco.
- Validação de e-mail, telefone e força de senha no frontend.
- Constraint `unique(data, horario)` no banco impede overbooking do mesmo horário.

## 6. Manutenção

- Página `pages/manutencao.html` pode ser usada como página temporária durante atualizações (redirecione manualmente via seu provedor de hospedagem).
- `pages/404.html` e `pages/500.html` cobrem erros de rota e falhas inesperadas.
- Todo o JavaScript é modular (`/js/modules`) — para adicionar uma funcionalidade nova, crie um módulo próprio e importe onde for necessário, evitando duplicar lógica.

## Bibliotecas externas usadas (via CDN)

- [Supabase JS v2](https://supabase.com/docs/reference/javascript)
- [Firebase Cloud Messaging (compat)](https://firebase.google.com/docs/cloud-messaging)
- [FullCalendar v6](https://fullcalendar.io/)
- [Font Awesome 6](https://fontawesome.com/)
- [Google Fonts — Poppins & Inter](https://fonts.google.com/)

Nenhuma dessas bibliotecas exige build step: tudo funciona abrindo os arquivos diretamente ou publicando em qualquer hospedagem estática.
