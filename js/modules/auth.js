/* ============================================================
   AUTH.JS
   Todas as operações de autenticação usando Supabase Auth:
   cadastro, login, logout, recuperação de senha e guarda de rotas.
   Compatível com Vercel + Supabase
   ============================================================ */


const Auth = {


  /**
   * Cadastro de usuário
   */
  async cadastrar({ nome, email, telefone, senha }) {

    console.log("Iniciando cadastro...");


    const { data, error } =
      await window.db.auth.signUp({

        email,

        password: senha,

        options: {

          // Redirecionamento após confirmação de email
          emailRedirectTo:
            `${window.location.origin}/pages/dashboard.html`,


          data: {

            nome,

            telefone,

            role: "cliente"

          }

        }

      });



    console.log("Resposta SignUp:", data);

    console.log("Erro SignUp:", error);



    if (error) {

      console.error("Erro ao cadastrar:", error);

      throw error;

    }



    /*
      Caso o Supabase esteja configurado
      com confirmação de email,
      a sessão será null.
    */

    const sessionResponse =
      await window.db.auth.getSession();



    const session =
      sessionResponse.data.session;



    console.log("Sessão criada:", session);



    if (!session) {


      console.warn(
        "Usuário criado. Aguardando confirmação de email."
      );


      return data;


    }



    /*
      Criar perfil na tabela usuarios
    */


    const { error: dbError } =

      await window.db

        .from("usuarios")

        .insert({

          id: session.user.id,

          nome,

          email,

          telefone,

          role: "cliente"

        });



    if (dbError) {


      console.error(
        "Erro ao salvar usuário:",
        dbError
      );


      throw dbError;

    }



    return data;


  },





  /**
   * Login
   */
  async login({ email, senha }) {


    const { data, error } =

      await window.db.auth.signInWithPassword({

        email,

        password: senha

      });



    console.log("Login:", data);

    console.log("Erro Login:", error);



    if (error) {

      throw error;

    }



    return data;


  },





  /**
   * Logout
   */
  async logout() {


    const { error } =

      await window.db.auth.signOut();



    if (error) {

      throw error;

    }



    // Como está dentro da pasta pages
    window.location.href =
      "login.html";


  },





  /**
   * Recuperar senha
   */
  async recuperarSenha(email) {



    const { error } =

      await window.db.auth.resetPasswordForEmail(

        email,

        {

          redirectTo:

            `${window.location.origin}/pages/redefinir-senha.html`

        }

      );



    if (error) {

      throw error;

    }



  },





  /**
   * Atualizar senha
   */
  async atualizarSenha(novaSenha) {



    const { error } =

      await window.db.auth.updateUser({

        password: novaSenha

      });



    if (error) {

      throw error;

    }



  },
    /**
   * Retorna a sessão atual
   */
  async getSession() {

    const { data, error } =
      await window.db.auth.getSession();

    if (error) {

      console.error(
        "Erro ao obter sessão:",
        error
      );

      return null;
    }

    return data.session;

  },



  /**
   * Busca o perfil do usuário
   */
  async getPerfil() {

    const session =
      await this.getSession();

    if (!session) {

      console.warn(
        "Nenhuma sessão encontrada."
      );

      return null;

    }


    const { data, error } =

      await window.db

        .from("usuarios")

        .select("*")

        .eq("id", session.user.id)

        .single();


    if (error) {

      console.error(
        "Erro ao buscar perfil:",
        error
      );

      return null;

    }


    return data;

  },



  /**
   * Verifica se existe usuário logado
   * e se ele possui a permissão necessária.
   *
   * requiredRole:
   * null       -> qualquer usuário logado
   * "cliente"  -> somente clientes
   * "admin"    -> somente administradores
   */
  async protegerPagina(requiredRole = null) {

    const session =
      await this.getSession();


    // Não logado
    if (!session) {

      console.warn(
        "Usuário não autenticado."
      );

      window.location.href = "login.html";

      return null;

    }


    const perfil =
      await this.getPerfil();


    // Perfil inexistente
    if (!perfil) {

      console.warn(
        "Perfil não encontrado."
      );

      await this.logout();

      return null;

    }


    // Página aceita qualquer usuário
    if (!requiredRole) {

      return perfil;

    }


    // Usuário possui a permissão correta
    if (perfil.role === requiredRole) {

      return perfil;

    }


    console.warn(
      "Usuário sem permissão."
    );


    // Redirecionamento automático
    if (perfil.role === "admin") {

      window.location.href =
        "admin-dashboard.html";

    } else {

      window.location.href =
        "dashboard.html";

    }

    return null;

  }

};


window.Auth = Auth;