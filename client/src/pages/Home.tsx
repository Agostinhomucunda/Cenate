import {
  AlertCircle,
  ArrowDownToLine,
  Check,
  ChevronDown,
  FileVideo,
  LockKeyhole,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  formatBytes,
  removeVideoMetadata,
  type CleanVideoResult,
} from "@/lib/mp4Metadata";

type Phase = "idle" | "ready" | "processing" | "done" | "error";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

function isSupportedFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    ["mp4", "mov"].includes(extension ?? "") ||
    ["video/mp4", "video/quicktime"].includes(file.type)
  );
}

function cleanName(name: string) {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : ".mp4";
  return `${stem}-limpo${extension}`;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CleanVideoResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setPhase("idle");
    setFile(null);
    setResult(null);
    setDownloadUrl(null);
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const chooseFile = (candidate: File | null) => {
    if (!candidate) return;
    setError("");
    setResult(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    if (!isSupportedFile(candidate)) {
      setFile(null);
      setPhase("error");
      setError("Escolhe um ficheiro MP4 ou MOV. Outros formatos não são suportados.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null);
      setPhase("error");
      setError("O vídeo ultrapassa o limite de 500 MB. Escolhe um ficheiro mais pequeno.");
      return;
    }

    setFile(candidate);
    setPhase("ready");
    setProgress(0);
  };

  const processFile = async () => {
    if (!file || phase === "processing") return;
    setPhase("processing");
    setError("");
    setProgress(8);

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      setProgress(28);
      const cleanResult = await removeVideoMetadata(file);
      setProgress(88);
      await new Promise((resolve) => setTimeout(resolve, 180));
      const url = URL.createObjectURL(cleanResult.blob);
      setResult(cleanResult);
      setDownloadUrl(url);
      setProgress(100);
      setPhase("done");
    } catch (caught) {
      setPhase("error");
      setProgress(0);
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível limpar este vídeo. Tenta novamente com outro ficheiro.",
      );
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  };

  const statusLabel =
    phase === "processing"
      ? "A limpar metadados…"
      : phase === "done"
        ? "Vídeo pronto"
        : phase === "error"
          ? "Não foi possível concluir"
          : "Pronto para limpar";

  return (
    <div className="site-shell">
      <header className="topbar container">
        <a href="#top" className="brand" aria-label="Vídeo Limpo, início">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>vídeo<span>limpo</span></span>
        </a>
        <a className="topbar-link" href="#como-funciona">
          Como funciona <ChevronDown size={16} strokeWidth={2.5} />
        </a>
      </header>

      <main id="top">
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> Feito para quem publica</div>
            <h1>Publica o teu vídeo.<br /><em>Sem deixar rastos.</em></h1>
            <p className="hero-lede">
              Remove metadados escondidos de templates e edições — diretamente no teu dispositivo,
              sem reencodar e sem perder qualidade.
            </p>
            <div className="trust-line">
              <ShieldCheck size={17} />
              <span>O vídeo não sai do teu navegador</span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-glow" />
            <div className="phone-card">
              <div className="phone-top"><span className="camera-dot" /><span>EXPORT / 01</span><span>•••</span></div>
              <div className="phone-scene">
                <div className="scene-sun" />
                <div className="scene-horizon" />
                <div className="scene-person"><span /><i /><b /></div>
                <div className="scene-caption">CLEAN CUT</div>
              </div>
              <div className="phone-timeline"><span /><span /><span /><span /><span /><span /></div>
            </div>
            <div className="floating-tag tag-clean"><Check size={14} /> metadados removidos</div>
            <div className="floating-tag tag-format">MP4 / MOV</div>
            <div className="visual-note"><span>100%</span><small>qualidade original</small></div>
          </div>
        </section>

        <section className="tool-section container" aria-labelledby="tool-title">
          <div className="tool-heading">
            <div>
              <div className="section-kicker">01 / limpar ficheiro</div>
              <h2 id="tool-title">Arrasta. Limpa. Publica.</h2>
            </div>
            <p>Sem conta. Sem upload. Sem marca de água.</p>
          </div>

          <div
            className={`dropzone ${isDragging ? "is-dragging" : ""} ${phase === "error" ? "has-error" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,.mp4,.mov"
              onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
              hidden
            />
            <div className="upload-symbol"><Upload size={24} strokeWidth={2.3} /></div>
            <div className="dropzone-text">
              <strong>{file ? file.name : "Solta o vídeo aqui"}</strong>
              <span>{file ? `${formatBytes(file.size)} · pronto para limpar` : "ou escolhe um ficheiro do teu dispositivo"}</span>
            </div>
            <button className="button secondary-button" type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>
              <MousePointer2 size={16} /> Escolher vídeo
            </button>
            <div className="dropzone-foot"><span>MP4 ou MOV</span><span>máx. 500 MB</span><span>processamento local</span></div>
          </div>

          {phase === "ready" && file && (
            <div className="action-row">
              <div className="selected-file"><FileVideo size={19} /><span>{file.name}</span><small>{formatBytes(file.size)}</small></div>
              <button className="button primary-button" type="button" onClick={processFile}>
                <WandSparkles size={17} /> Remover metadados
              </button>
            </div>
          )}

          {phase === "processing" && (
            <div className="progress-panel" aria-live="polite">
              <div className="progress-top"><span>{statusLabel}</span><b>{progress}%</b></div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <p>A trabalhar localmente. Não feches esta página.</p>
            </div>
          )}

          {phase === "done" && result && downloadUrl && (
            <div className="success-panel" aria-live="polite">
              <div className="success-icon"><Check size={21} /></div>
              <div className="success-copy"><strong>O teu vídeo está limpo.</strong><span>{result.removedBoxes} bloco{result.removedBoxes === 1 ? "" : "s"} de metadados removido{result.removedBoxes === 1 ? "" : "s"} · qualidade original preservada</span></div>
              <a className="button primary-button download-button" href={downloadUrl} download={cleanName(file?.name ?? "video.mp4")} onClick={() => setTimeout(reset, 1200)}>
                <ArrowDownToLine size={17} /> Descarregar vídeo
              </a>
            </div>
          )}

          {phase === "error" && error && (
            <div className="error-panel" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button className="text-button" type="button" onClick={reset}><RefreshCw size={15} /> Tentar novamente</button>
            </div>
          )}
        </section>

        <section className="proof-section container" id="como-funciona">
          <div className="section-kicker">02 / o que acontece</div>
          <div className="proof-grid">
            <article className="proof-card proof-card-dark"><span className="proof-number">01</span><LockKeyhole size={20} /><h3>Fica no teu dispositivo</h3><p>O ficheiro é lido e tratado no navegador. Não há contas, servidores ou histórico.</p></article>
            <article className="proof-card"><span className="proof-number">02</span><FileVideo size={20} /><h3>Sem reencodar</h3><p>Removemos apenas as caixas de metadados do MP4/MOV. O vídeo e o som ficam intactos.</p></article>
            <article className="proof-card proof-card-lime"><span className="proof-number">03</span><ArrowDownToLine size={20} /><h3>Pronto para publicar</h3><p>Descarrega uma cópia nova e testa no TikTok antes de publicar para toda a gente.</p></article>
          </div>
        </section>

        <section className="note-section container">
          <div className="note-mark"><span>i</span></div>
          <div><strong>Uma nota importante sobre o TikTok</strong><p>Este processo remove a assinatura técnica que pode vir no ficheiro. Ainda assim, o TikTok pode reconhecer um template através da imagem, dos efeitos ou da montagem visual. A limpeza melhora a privacidade do ficheiro — não é uma garantia contra todo o reconhecimento visual.</p></div>
        </section>
      </main>

      <footer className="footer container"><span>vídeo<span>limpo</span></span><span>Uma ferramenta simples para criadores.</span><span>feito localmente · 2026</span></footer>
    </div>
  );
}
