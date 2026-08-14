# Lista de Presentes — Happy Kids

## Etapa atual

A aplicação está estruturada e possui fluxos de autenticação de vendedoras,
listas, brinquedos com foto, galeria pública e intenção de compra pelo
WhatsApp. O funcionamento externo ainda depende de confirmar no projeto real
do Supabase o schema, o bucket `toys_images`, as políticas RLS e o perfil de
vendedora.

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

## Identidade visual prioritária

Toda cor e tipografia de marca deve usar exclusivamente os tokens definidos no
`:root` de `css/base.css`. Não altere seus nomes, valores ou famílias sem
autorização explícita, nem crie outra paleta ou tipografia de marca.

```css
:root {
  --logo-rosa: #d73d6f;
  --logo-laranja: #f66a09;
  --logo-azul: #24b1a1;
  --logo-verde: #7CBc42;
  --fonte-titulos: 'Fredoka', sans-serif;
  --fonte-textos: 'Nunito', sans-serif;
}
```

Use Fredoka em títulos, preços e chamadas de destaque; use Nunito nos demais
textos da interface.

## Limites de alteração

Pedidos para adicionar funções, ajustar a interface ou mudar o visual não
autorizam alterações nas regras de negócio, banco de dados, Supabase, RLS ou
Storage. Esses elementos devem permanecer intactos, salvo autorização explícita
para esse escopo.

## Estrutura

- `css/`: estilos globais, de layout, de componentes e específicos de página.
- `js/config.js`: configuração pública do Supabase e nome do bucket de imagens.
- `js/supabase-client.js`: cria uma única conexão reutilizável com o Supabase.
- `js/pages/`: controla o comportamento específico de cada página.
- `js/services/`: receberá as operações de banco e Storage, sem manipular a tela.
- `js/ui/`: receberá componentes e atualizações de DOM, sem fazer consultas.
- `supabase/`: contém o SQL do banco, políticas RLS, Storage e o guia de
  execução no painel do Supabase.
