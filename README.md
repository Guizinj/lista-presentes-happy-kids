# Lista de Presentes — Happy Kids

## Etapa atual

A estrutura inicial e o cliente Supabase estão prontos. Ainda não há tabelas,
autenticação ou dados reais conectados.

## Configurar o Supabase

1. Crie um projeto no painel do Supabase.
2. No painel do projeto, abra **Connect** e copie a URL do projeto e a chave
   **Publishable**. Em projetos antigos, use a chave `anon`.
3. Abra `js/config.js` e substitua os dois valores de exemplo.
4. Nunca copie a chave `service_role` para este arquivo ou para o navegador.

Depois disso, siga `supabase/SETUP.md` para criar o banco, o bucket, as
políticas de segurança e a primeira vendedora. Em seguida, abriremos
`admin.html` em um servidor local para implementar o acesso administrativo.

Se você executou a primeira versão do schema antes da área de brinquedos, rode
também a migração `supabase/002_add_image_path.sql` no SQL Editor.

## Estrutura

- `css/`: estilos globais, de layout, de componentes e específicos de página.
- `js/config.js`: configuração pública do Supabase e nome do bucket de imagens.
- `js/supabase-client.js`: cria uma única conexão reutilizável com o Supabase.
- `js/pages/`: controla o comportamento específico de cada página.
- `js/services/`: receberá as operações de banco e Storage, sem manipular a tela.
- `js/ui/`: receberá componentes e atualizações de DOM, sem fazer consultas.
- `supabase/`: contém o SQL do banco, políticas RLS, Storage e o guia de
  execução no painel do Supabase.
