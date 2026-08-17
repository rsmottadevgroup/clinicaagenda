# Envio real do Push Notification (server-side)

O frontend **nunca** deve conter a chave de serviço do Firebase (ela dá acesso total ao seu projeto). Por isso, o disparo real da notificação para o administrador precisa acontecer em um ambiente seguro server-side. O caminho recomendado com Supabase é uma **Edge Function** acionada por um **Database Webhook**.

## Passo a passo

1. No painel do Supabase, vá em **Database > Webhooks** e crie um webhook que dispara em todo `INSERT` na tabela `notificacoes`, chamando uma Edge Function.
2. Crie a Edge Function (`supabase functions new enviar-push`) com um código como este:

```ts
// supabase/functions/enviar-push/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const payload = await req.json();
  const notificacao = payload.record;

  // Busca os tokens FCM dos administradores no banco (via service role key)
  // e chama a API HTTP v1 do Firebase Cloud Messaging com a service account.
  // Documentação: https://firebase.google.com/docs/cloud-messaging/send-message

  return new Response("ok");
});
```

3. Configure a variável de ambiente da função com a **chave de serviço do Firebase** (Service Account JSON), nunca no frontend.
4. Faça o deploy: `supabase functions deploy enviar-push`.

Esse padrão mantém a chave sensível fora do navegador e cumpre as boas práticas de segurança do Firebase e do Supabase.
