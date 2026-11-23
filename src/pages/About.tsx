import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  Target,
  GraduationCap,
  LogIn,
  Sparkles,
} from "lucide-react";

export function About() {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FDFBF7",
        backgroundImage: 'url("/fundo-ipa.png")',
        backgroundRepeat: "repeat",
        backgroundAttachment: "fixed",
        color: "#181818",
        paddingBottom: "4rem",
      }}
    >
      {/* Barra Superior */}
      <header
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderBottom: "3px solid #181818",
          padding: "1rem 2rem",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "#181818",
            }}
          >
            <img
              src="/logo.png"
              alt="T4 English"
              style={{
                height: "100px",
                objectFit: "contain",
                mixBlendMode: "multiply",
              }}
            />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                textDecoration: "none",
                color: "#181818",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "2px solid #181818",
                backgroundColor: "#F4EFE6",
                boxShadow: "2px 2px 0px #181818",
              }}
            >
              <ArrowLeft size={16} color="#E05A67" /> Início
            </Link>

            <Link
              to="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                textDecoration: "none",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "0.5rem 1.2rem",
                borderRadius: "8px",
                border: "2px solid #181818",
                backgroundColor: "#E05A67",
                boxShadow: "2px 2px 0px #181818",
              }}
            >
              <LogIn size={16} /> Área do Aluno
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "3rem 1.5rem 0",
        }}
      >
        {/* Hero / Cabeçalho */}
        <section style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#F4EFE6",
              border: "2px solid #181818",
              borderRadius: "20px",
              padding: "0.35rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              boxShadow: "3px 3px 0px #181818",
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={16} color="#E05A67" /> Nossa História e Propósito
          </div>

          <h1
            style={{
              fontSize: "2.5rem",
              color: "#181818",
              textTransform: "uppercase",
              marginBottom: "1rem",
              textShadow: "2px 2px 0px #FFFFFF",
            }}
          >
            Quem Somos
          </h1>

          <p
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              color: "#333333",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              border: "2px solid #181818",
            }}
          >
            A <strong>T4 English</strong> nasceu com o objetivo de tornar o
            aprendizado de inglês leve, estruturado e conectado à comunicação
            real — unindo prática fonética, materiais visuais interativos e
            acompanhamento próximo em cada etapa da evolução do aluno.
          </p>
        </section>

        {/* Seção do Professor */}
        <section
          className="doodle-card"
          style={{
            backgroundColor: "#FFFFFF",
            border: "3px solid #181818",
            borderRadius: "16px",
            boxShadow: "8px 8px 0px #181818",
            padding: "2.5rem",
            marginBottom: "3.5rem",
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Moldura da Foto do Professor */}
          <div
            style={{
              width: "210px",
              height: "210px",
              borderRadius: "16px",
              border: "3px solid #181818",
              backgroundColor: "#F4EFE6",
              boxShadow: "5px 5px 0px #E05A67",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              margin: "0 auto",
            }}
          >
            {!imgError ? (
              <img
                src="/professor.png"
                alt="Prof. Henrique Torquato"
                onError={() => setImgError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <GraduationCap size={64} color="#181818" strokeWidth={1.75} />
                <span
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: "#181818",
                  }}
                >
                  T4 TEACHER
                </span>
              </div>
            )}
          </div>

          {/* Apresentação do Professor */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#FEE2E2",
                color: "#E05A67",
                border: "2px solid #181818",
                borderRadius: "8px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Idealizador & Professor
            </span>

            <h2
              style={{
                fontSize: "1.8rem",
                color: "#181818",
                marginBottom: "0.75rem",
              }}
            >
              Prof. Henrique Torquato
            </h2>

            <p
              style={{
                color: "#444444",
                lineHeight: "1.65",
                marginBottom: "1rem",
              }}
            >
              Apaixonado pelo ensino de idiomas e pela clareza na comunicação,
              desenvolveu a metodologia da <strong>T4 English</strong> para
              eliminar o bloqueio na fala desde os primeiros passos (
              <em>First Step</em>).
            </p>

            <p style={{ color: "#444444", lineHeight: "1.65", margin: 0 }}>
              Com foco em pronúncia consciente através do alfabeto fonético
              (IPA), materiais exclusivos e atividades direcionadas, cada aula é
              pensada para que o aluno entenda a lógica do idioma sem depender
              apenas de memorização mecânica.
            </p>
          </div>
        </section>

        {/* Pilares da T4 English */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.6rem",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
          >
            Como Funciona Nossa Metodologia
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div
              className="doodle-card"
              style={{
                backgroundColor: "#FFFFFF",
                border: "3px solid #181818",
                borderRadius: "12px",
                padding: "1.75rem",
                boxShadow: "5px 5px 0px #181818",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#FEE2E2",
                  border: "2px solid #181818",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Volume2 size={24} color="#E05A67" />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Pronúncia com IPA
              </h3>
              <p
                style={{
                  color: "#555555",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Tabela fonética interativa integrada à plataforma para você
                ouvir, comparar e dominar os sons reais do inglês.
              </p>
            </div>

            <div
              className="doodle-card"
              style={{
                backgroundColor: "#FFFFFF",
                border: "3px solid #181818",
                borderRadius: "12px",
                padding: "1.75rem",
                boxShadow: "5px 5px 0px #181818",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#F4EFE6",
                  border: "2px solid #181818",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <BookOpen size={24} color="#181818" />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Materiais Exclusivos
              </h3>
              <p
                style={{
                  color: "#555555",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Apresentações interativas, biblioteca de aulas organizadas por
                módulo e e-books de apoio sempre disponíveis para revisão.
              </p>
            </div>

            <div
              className="doodle-card"
              style={{
                backgroundColor: "#FFFFFF",
                border: "3px solid #181818",
                borderRadius: "12px",
                padding: "1.75rem",
                boxShadow: "5px 5px 0px #181818",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#DCFCE7",
                  border: "2px solid #181818",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Target size={24} color="#166534" />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                Trilha Individual
              </h3>
              <p
                style={{
                  color: "#555555",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                Acompanhamento personalizado de progresso, tarefas corrigidas
                pelo professor e evolução passo a passo no seu ritmo.
              </p>
            </div>
          </div>
        </section>

        {/* Chamada para Ação (CTA) */}
        <section
          style={{
            backgroundColor: "#F4EFE6",
            border: "3px solid #181818",
            borderRadius: "16px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "6px 6px 0px #181818",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            Pronto para dar o próximo passo no seu inglês?
          </h2>
          <p
            style={{
              color: "#444444",
              marginBottom: "1.5rem",
              fontSize: "1rem",
            }}
          >
            Acesse o portal do aluno para explorar suas aulas, tarefas e
            materiais de estudo.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#E05A67",
              color: "#FFFFFF",
              border: "3px solid #181818",
              borderRadius: "10px",
              padding: "0.9rem 2rem",
              fontWeight: 800,
              fontSize: "1.05rem",
              textDecoration: "none",
              boxShadow: "4px 4px 0px #181818",
            }}
          >
            <LogIn size={20} /> Acessar Plataforma
          </Link>
        </section>
      </main>
    </div>
  );
}
