import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bell,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FilePlus2,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  Link2,
  MessageSquare,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

type Occurrence = { q: string; t: string };

type Conflict = {
  id: number;
  expanded: boolean;
  tag: string;
  desc: string;
  oldest: string;
  newest: string;
  occurrences: Occurrence[];
  a: { name: string; desc: string; updated: string };
  b: { name: string; desc: string; updated: string };
};

type Suggestion = {
  id: number;
  title: string;
  occurrences: number;
  oldest: string;
  newest: string;
  added: boolean;
  text: string;
  occExpanded: boolean;
  occList: Occurrence[];
};

type Msg = { id: number; text: string; date: string; checked: boolean };

type ModalTab = "escrever" | "arquivo" | "url";

type InsertModalState = {
  open: boolean;
  suggestionId: number | null;
  tab: ModalTab;
  title: string;
  content: string;
  fileName: string;
  url: string;
};

type ViewModalState = { open: boolean; title: string; text: string; date: string };

type ChatMessage = { id: number; from: "sophia" | "user"; text: string };

const INITIAL_CONFLICTS: Conflict[] = [
  {
    id: 1,
    expanded: true,
    tag: "#35",
    desc: "Os trechos apresentam dois horários distintos de check-in",
    oldest: "09/08/2026",
    newest: "24/08/2026",
    occurrences: [
      { q: "Que horas posso fazer o check-in?", t: "09/08/2026 11:11" },
      { q: "Que horas é o check-in?", t: "14/08/2026 09:32" },
      { q: "Tem check-in antecipado?", t: "18/08/2026 15:04" },
      { q: "Qual o horário do check-in?", t: "21/08/2026 10:47" },
      { q: "O check-in pode ser feito a partir de qual horário?", t: "24/08/2026 22:12" },
    ],
    a: {
      name: "Site oficial – Check-in e Check-out",
      desc: "O check-in pode ser feito a partir das 14h e o check-out até as 12h. Chegadas antecipadas estão sujeitas à disponibilidade.",
      updated: "12/08/2026 09:15",
    },
    b: {
      name: "FAQ – Perguntas frequentes",
      desc: "Nosso horário de check-in é a partir das 15h. Em caso de chegada antecipada, oferecemos guarda de bagagens sem custo.",
      updated: "20/08/2026 17:40",
    },
  },
  {
    id: 2,
    expanded: false,
    tag: "#41",
    desc: "Os trechos indicam políticas de cancelamento diferentes",
    oldest: "02/08/2026",
    newest: "19/08/2026",
    occurrences: [
      { q: "Posso cancelar minha reserva sem multa?", t: "02/08/2026 08:20" },
      { q: "Qual a política de cancelamento?", t: "10/08/2026 13:55" },
      { q: "Tem multa se eu cancelar?", t: "19/08/2026 19:03" },
    ],
    a: {
      name: "Termos de reserva",
      desc: "Cancelamentos com até 48h de antecedência não possuem multa. Após esse prazo, será cobrada a primeira diária.",
      updated: "05/08/2026 10:00",
    },
    b: {
      name: "Política de cancelamento – site parceiro",
      desc: "Reservas podem ser canceladas gratuitamente até 24h antes do check-in.",
      updated: "15/08/2026 14:22",
    },
  },
];

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 1,
    title: "Informações de check-in e check-out",
    occurrences: 142,
    oldest: "09/08/2026",
    newest: "24/08/2026",
    added: false,
    occExpanded: false,
    text: "O check-in pode ser realizado a partir das 15h e o check-out até as 12h. Check-in antecipado e late check-out estão sujeitos à disponibilidade no dia e podem ter custo adicional. Hóspedes que chegarem antes ou saírem depois do horário podem deixar as bagagens guardadas gratuitamente na recepção.",
    occList: [
      { q: "Que horas é o check-in?", t: "24/08/2026" },
      { q: "Posso fazer check-out mais tarde?", t: "20/08/2026" },
      { q: "Tem check-in antecipado?", t: "15/08/2026" },
    ],
  },
  {
    id: 2,
    title: "Política de pets",
    occurrences: 87,
    oldest: "02/08/2026",
    newest: "22/08/2026",
    added: true,
    occExpanded: false,
    text: "Aceitamos pets de pequeno porte mediante taxa adicional por diária. É necessário informar a presença do animal no momento da reserva.",
    occList: [
      { q: "Posso levar meu cachorro?", t: "22/08/2026" },
      { q: "Tem taxa para animais?", t: "18/08/2026" },
      { q: "Aceita pets de porte grande?", t: "10/08/2026" },
    ],
  },
  {
    id: 3,
    title: "Acessibilidade e acesso PCD",
    occurrences: 41,
    oldest: "05/08/2026",
    newest: "18/08/2026",
    added: false,
    occExpanded: false,
    text: "O hotel conta com quartos adaptados, rampas de acesso e banheiros com barras de apoio. Recomendamos informar a necessidade no momento da reserva para garantir a disponibilidade.",
    occList: [
      { q: "Tem quarto adaptado para cadeirante?", t: "18/08/2026" },
      { q: "O hotel tem rampa de acesso?", t: "12/08/2026" },
      { q: "Banheiro tem barra de apoio?", t: "05/08/2026" },
    ],
  },
];

const INITIAL_MSGS: Msg[] = [
  {
    id: 1,
    text: "Aqui vai uma frase que a Sophia não entendeu que pode ser longa com duas linhas até acabar o espaço...",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
  {
    id: 2,
    text: "Aqui vai uma frase que a Sophia não entendeu",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
  {
    id: 3,
    text: "Aqui vai uma frase que a Sophia não entendeu",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
  {
    id: 4,
    text: "Aqui vai uma frase que a Sophia não entendeu",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
  {
    id: 5,
    text: "Aqui vai uma frase que a Sophia não entendeu",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
  {
    id: 6,
    text: "Aqui vai uma frase que a Sophia não entendeu",
    date: "30/07/2025 às 22:00",
    checked: false,
  },
];

const PERIOD_OPTIONS = ["Hoje", "Última semana", "Últimos 30 dias", "Este mês"];

const EMPTY_INSERT_MODAL: InsertModalState = {
  open: false,
  suggestionId: null,
  tab: "escrever",
  title: "",
  content: "",
  fileName: "",
  url: "",
};

const EMPTY_VIEW_MODAL: ViewModalState = { open: false, title: "", text: "", date: "" };

function Index() {
  const [period, setPeriod] = useState<string>("Última semana");
  const [conflicts, setConflicts] = useState<Conflict[]>(INITIAL_CONFLICTS);
  const [resolvedCount, setResolvedCount] = useState(6);
  const [ignoredCount, setIgnoredCount] = useState(2);

  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<number[]>([2]);

  const [msgs, setMsgs] = useState<Msg[]>(INITIAL_MSGS);
  const [msgsReviewOpen, setMsgsReviewOpen] = useState(false);

  const [insertModal, setInsertModal] = useState<InsertModalState>(EMPTY_INSERT_MODAL);
  const [viewModal, setViewModal] = useState<ViewModalState>(EMPTY_VIEW_MODAL);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "sophia",
      text: "Seja bem-vindo ao Hotel Fazendinha do Campo! Sou a Sophia, assistente digital do hotel, e estou aqui 24h para te auxiliar no que for preciso. Estamos esperando por você! Como posso ajudá-lo hoje?",
    },
    { id: 2, from: "user", text: "Quero saber os horários de checkout" },
  ]);
  const [chatDraft, setChatDraft] = useState("");

  const currentSuggestion = suggestions[currentSuggestionIndex];
  const pendingCount = pendingChanges.length;

  function toggleConflict(id: number) {
    setConflicts((cs) => cs.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)));
  }

  function resolveConflict(id: number) {
    setConflicts((cs) => cs.filter((c) => c.id !== id));
    setResolvedCount((n) => n + 1);
    toast.success("Conflito marcado como resolvido.");
  }

  function ignoreConflict(id: number) {
    setConflicts((cs) => cs.filter((c) => c.id !== id));
    setIgnoredCount((n) => n + 1);
    toast("Conflito desconsiderado.");
  }

  function goToSuggestion(i: number) {
    setCurrentSuggestionIndex(((i % suggestions.length) + suggestions.length) % suggestions.length);
  }

  function toggleSuggestionOcc(id: number) {
    setSuggestions((ss) =>
      ss.map((s) => (s.id === id ? { ...s, occExpanded: !s.occExpanded } : s)),
    );
  }

  function openInsertModal(suggestion: Suggestion) {
    if (suggestion.added) return;
    setInsertModal({
      open: true,
      suggestionId: suggestion.id,
      tab: "escrever",
      title: suggestion.title,
      content: suggestion.text,
      fileName: "",
      url: "",
    });
  }

  function closeInsertModal() {
    setInsertModal(EMPTY_INSERT_MODAL);
  }

  function confirmInsertModal() {
    const target = suggestions.find((s) => s.id === insertModal.suggestionId);
    if (!target) return;
    setSuggestions((ss) =>
      ss.map((s) =>
        s.id === insertModal.suggestionId
          ? { ...s, added: true, title: insertModal.title, text: insertModal.content }
          : s,
      ),
    );
    setPendingChanges((p) => [...p, target.id]);
    closeInsertModal();
    toast.success(`"${insertModal.title}" adicionado às alterações pendentes.`, {
      description: "Publique para a Sophia usar este conteúdo.",
    });
  }

  function extractModalUrl() {
    if (!insertModal.url.trim()) return;
    toast("Extraindo conteúdo da URL informada...");
    setTimeout(() => {
      setInsertModal((m) => ({
        ...m,
        tab: "escrever",
        content: `Conteúdo extraído de ${m.url}. Revise e ajuste o texto antes de publicar.`,
      }));
      toast.success("Conteúdo extraído com sucesso.");
    }, 900);
  }

  function discardChanges() {
    if (pendingCount === 0) return;
    const ids = pendingChanges;
    setSuggestions((ss) => ss.map((s) => (ids.includes(s.id) ? { ...s, added: false } : s)));
    setPendingChanges([]);
    toast("Alterações descartadas.");
  }

  function publishChanges() {
    if (pendingCount === 0) return;
    const n = pendingCount;
    setPendingChanges([]);
    toast.success(`${n} ${n === 1 ? "conteúdo publicado" : "conteúdos publicados"} com sucesso!`, {
      description: "Nas próximas conversas sobre o tema, a Sophia já responde.",
    });
  }

  function toggleMsg(id: number) {
    setMsgs((ms) => ms.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));
  }

  function deleteMsg(id: number) {
    setMsgs((ms) => ms.filter((m) => m.id !== id));
  }

  function copyMsg(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast("Mensagem copiada.");
  }

  function sendChatMessage() {
    const text = chatDraft.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now(), from: "user", text };
    setChatMessages((cs) => [...cs, userMsg]);
    setChatDraft("");
    setTimeout(() => {
      setChatMessages((cs) => [
        ...cs,
        {
          id: Date.now() + 1,
          from: "sophia",
          text: "Essa resposta é simulada com base no conteúdo publicado no AI Studio.",
        },
      ]);
    }, 600);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen flex-col overflow-hidden bg-[#f5f7fa] text-[13px] text-[#132939]">
        <TopNav />

        <div className="flex min-h-0 flex-1 overflow-x-auto">
          <IconRail />
          <SubMenu />

          <main className="flex min-w-[640px] flex-1 flex-col gap-6 overflow-auto p-8">
            {!msgsReviewOpen ? (
              <>
                <PageHeader
                  pendingCount={pendingCount}
                  onDiscard={discardChanges}
                  onPublish={publishChanges}
                  period={period}
                  onPeriodChange={setPeriod}
                />

                <ConflictsCard
                  conflicts={conflicts}
                  resolvedCount={resolvedCount}
                  ignoredCount={ignoredCount}
                  onToggle={toggleConflict}
                  onResolve={resolveConflict}
                  onIgnore={ignoreConflict}
                />

                <div className="flex flex-col gap-6 rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(42,48,66,0.16)]">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-medium text-[#132939]/90">
                      Mensagens não entendidas
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 cursor-help text-[#132939]/50" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Mensagens que a Sophia não conseguiu entender ou responder durante os
                        atendimentos.
                      </TooltipContent>
                    </Tooltip>
                    <Search className="ml-auto h-5 w-5 cursor-pointer text-[#132939]/90" />
                  </div>

                  <MonthlyAnalysisBanner suggestionsCount={suggestions.length} />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-[#132939]/50">
                        SUGESTÕES DE CONTEÚDO
                      </span>
                    </div>

                    {currentSuggestion && (
                      <SuggestionCarousel
                        suggestion={currentSuggestion}
                        total={suggestions.length}
                        index={currentSuggestionIndex}
                        onPrev={() => goToSuggestion(currentSuggestionIndex - 1)}
                        onNext={() => goToSuggestion(currentSuggestionIndex + 1)}
                        onDot={goToSuggestion}
                        onToggleOcc={() => toggleSuggestionOcc(currentSuggestion.id)}
                        onOpenInsert={() => openInsertModal(currentSuggestion)}
                        onOpenView={() =>
                          setViewModal({
                            open: true,
                            title: currentSuggestion.title,
                            text: currentSuggestion.text,
                            date: currentSuggestion.newest,
                          })
                        }
                      />
                    )}
                  </div>

                  <div className="h-px bg-[#01111e]/10" />

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-medium text-[#132939]/90">
                          Mensagens disponíveis para revisão manual
                        </span>
                        <span className="text-[13px] text-[#616e7c]">
                          Mensagens que não foram analisadas no relatório mensal e podem ser
                          revisadas manualmente.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-5 w-5 text-[#132939]/50" />
                        <span className="text-xl font-medium text-[#132939]/90">{msgs.length}</span>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded border border-[#01111e]/10 bg-white">
                      <MessageTableHeader />
                      {msgs.slice(0, 5).map((m) => (
                        <MessageRow
                          key={m.id}
                          msg={m}
                          onToggle={toggleMsg}
                          onCopy={copyMsg}
                          onDelete={deleteMsg}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setMsgsReviewOpen(true)}
                      className="mx-auto mt-2 flex items-center gap-0.5 text-[13px] font-medium text-[#132939] cursor-pointer"
                    >
                      Ver todas <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <MessagesReview
                msgs={msgs}
                onBack={() => setMsgsReviewOpen(false)}
                onToggle={toggleMsg}
                onDelete={deleteMsg}
                onCopy={copyMsg}
              />
            )}
          </main>

          <SophiaPanel
            messages={chatMessages}
            draft={chatDraft}
            onDraftChange={setChatDraft}
            onSend={sendChatMessage}
          />
        </div>

        <InsertContentModal
          state={insertModal}
          onClose={closeInsertModal}
          onTabChange={(tab) => setInsertModal((m) => ({ ...m, tab }))}
          onTitleChange={(title) => setInsertModal((m) => ({ ...m, title }))}
          onContentChange={(content) => setInsertModal((m) => ({ ...m, content }))}
          onFileChange={(fileName) => setInsertModal((m) => ({ ...m, fileName }))}
          onUrlChange={(url) => setInsertModal((m) => ({ ...m, url }))}
          onExtract={extractModalUrl}
          onConfirm={confirmInsertModal}
        />

        <ViewContentModal state={viewModal} onClose={() => setViewModal(EMPTY_VIEW_MODAL)} />
      </div>
    </TooltipProvider>
  );
}

function TopNav() {
  return (
    <nav className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-[#01111e]/10 bg-white px-5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff5724]">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1" />
      <Bell className="h-[22px] w-[22px] text-[#132939]/60" />
      <div className="flex cursor-pointer items-center gap-2">
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#2a3042] to-[#4a5568]" />
        <span className="text-[13px] font-medium">Ana Barcellos</span>
        <ChevronDown className="h-[18px] w-[18px] text-[#132939]/60" />
      </div>
    </nav>
  );
}

const RAIL_ICONS = [
  "home",
  "chart",
  "schedule",
  "forum",
  "chat",
  "camera",
  "cart",
  "user",
  "sms",
  "mail",
];

function IconRail() {
  return (
    <aside className="flex w-14 flex-shrink-0 flex-col items-center gap-5 overflow-y-auto bg-[#101b26] py-4">
      {RAIL_ICONS.map((name, i) => (
        <div
          key={name}
          className={cn(
            "h-[22px] w-[22px] cursor-pointer rounded-sm",
            i === 1 ? "text-[#ff5724]" : "text-white/55",
          )}
        >
          <RailIcon name={name} />
        </div>
      ))}
    </aside>
  );
}

function RailIcon({ name }: { name: string }) {
  const cls = "h-full w-full";
  switch (name) {
    case "chart":
      return <Sparkles className={cls} />;
    case "schedule":
      return <Clock className={cls} />;
    case "forum":
    case "chat":
      return <MessageSquare className={cls} />;
    default:
      return <Bot className={cls} />;
  }
}

const SUBMENU_TOP = ["Data Hub", "Estilos de comunicação", "Publicar"];
const SUBMENU_BOTTOM = ["Automação de etiquetas", "Formulários", "Atendimento humano"];

function SubMenu() {
  return (
    <aside className="flex w-[254px] flex-shrink-0 flex-col gap-6 overflow-y-auto border-r border-[#01111e]/10 bg-white p-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#ff5724]">
          <ArrowLeft className="h-[18px] w-[18px]" />
          <span>Voltar</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-[#2a3042]">AI Studio</span>
        <ChevronDown className="h-5 w-5 text-[#132939]/60" />
      </div>
      <div className="flex flex-col gap-2">
        {SUBMENU_TOP.map((label) => (
          <SubMenuItem key={label} label={label} />
        ))}
        <div className="my-1 h-px bg-[#d3d7da]" />
        <div className="flex items-center gap-2.5 rounded-md bg-[#fde3d9] px-3 py-2.5 text-sm font-semibold text-[#ff5724]">
          <Sparkles className="h-[18px] w-[18px]" />
          <span>Analytics</span>
        </div>
        <div className="my-1 h-px bg-[#d3d7da]" />
        {SUBMENU_BOTTOM.map((label) => (
          <SubMenuItem key={label} label={label} />
        ))}
      </div>
    </aside>
  );
}

function SubMenuItem({ label }: { label: string }) {
  return (
    <div className="flex cursor-pointer items-center rounded-md px-3 py-2.5 text-sm text-[#132939]/75 hover:bg-[#01111e]/[0.04]">
      <span>{label}</span>
    </div>
  );
}

function PageHeader({
  pendingCount,
  onDiscard,
  onPublish,
  period,
  onPeriodChange,
}: {
  pendingCount: number;
  onDiscard: () => void;
  onPublish: () => void;
  period: string;
  onPeriodChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <span className="text-2xl font-medium text-[#132939]/[0.875]">Analytics</span>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <HelpCircle className="h-[18px] w-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajuda sobre esta página</TooltipContent>
          </Tooltip>
          <Button variant="outline" size="sm" disabled={pendingCount === 0} onClick={onDiscard}>
            Descartar alterações
          </Button>
          <Button
            size="sm"
            disabled={pendingCount === 0}
            onClick={onPublish}
            className="gap-1.5 bg-[#ff5724] text-white hover:bg-[#ff5724]/90 disabled:bg-[#132939]/15 disabled:text-[#132939]/40"
          >
            <Rocket className="h-4 w-4" />
            {pendingCount > 0 ? `Publicar alterações (${pendingCount})` : "Publicar alterações"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#132939]/75">Período dos dados</span>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="h-auto w-auto gap-1.5 rounded border-[#01111e]/10 bg-white px-3 py-2 text-[13px] text-[#132939]/75 shadow-none">
              <Calendar className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => toast("Dados atualizados para o período selecionado.")}
            className="gap-1.5 bg-[#132939]/[0.875] text-white hover:bg-[#132939]"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
        <span className="text-xs text-[#616e7c]">
          Os dados desta página são atualizados conforme o período selecionado. As sugestões de
          conteúdo seguem um ciclo mensal próprio e não mudam com o filtro.
        </span>
      </div>
    </div>
  );
}

function ConflictsCard({
  conflicts,
  resolvedCount,
  ignoredCount,
  onToggle,
  onResolve,
  onIgnore,
}: {
  conflicts: Conflict[];
  resolvedCount: number;
  ignoredCount: number;
  onToggle: (id: number) => void;
  onResolve: (id: number) => void;
  onIgnore: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(42,48,66,0.16)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="text-base font-medium text-[#132939]/90">Conflitos de conteúdo</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-[#132939]/50" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Informações conflitantes entre conteúdos do Data Hub que foram identificados durante
              os atendimentos da Sophia.
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-xs text-[#132939]/[0.5625]">
          Informações conflitantes entre conteúdos do Data Hub que foram identificados durante os
          atendimentos da Sophia.
        </span>
      </div>

      <div className="flex gap-3">
        <StatPill
          icon={<AlertTriangle className="h-[22px] w-[22px] text-[#9e3d22]" />}
          bg="bg-[#fde3d9]"
          value={conflicts.length}
          label="PENDENTES"
        />
        <StatPill
          icon={<CheckCircle2 className="h-[22px] w-[22px] text-[#132939]/75" />}
          bg="bg-[#01111e]/[0.06]"
          value={resolvedCount}
          label="RESOLVIDOS"
        />
        <StatPill
          icon={<Ban className="h-[22px] w-[22px] text-[#132939]/75" />}
          bg="bg-[#01111e]/[0.06]"
          value={ignoredCount}
          label="IGNORADOS"
        />
      </div>

      {conflicts.length > 0 ? (
        <>
          <div className="flex items-center gap-2.5 rounded-lg bg-[#fde3d9] px-3 py-2">
            <AlertTriangle className="h-[18px] w-[18px] flex-shrink-0 text-[#9e3d22]" />
            <span className="text-xs text-[#9e3d22]">
              Informações conflitantes no Data Hub podem fazer com que a Sophia dê respostas
              incorretas durante os atendimentos. Revise e corrija os conflitos pendentes se
              necessário.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {conflicts.map((c) => (
              <ConflictItem
                key={c.id}
                conflict={c}
                onToggle={() => onToggle(c.id)}
                onResolve={() => onResolve(c.id)}
                onIgnore={() => onIgnore(c.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center gap-6 py-6">
          <CheckCircle2 className="h-16 w-16 text-[#ff5724]" />
          <div className="flex max-w-xs flex-col gap-1">
            <span className="text-lg font-medium text-[#01111e]/[0.87]">Tudo certo!</span>
            <span className="text-base text-[#01111e]/[0.49]">
              Não foram encontrados conflitos de conteúdo no Data Hub
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-4 rounded-lg p-4 shadow-[inset_0_0_0_1px_rgba(1,17,30,0.1)]">
      <div
        className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full", bg)}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-medium text-[#132939]/90">{value}</div>
        <div className="text-[11px] text-[#132939]/90">{label}</div>
      </div>
    </div>
  );
}

function ConflictItem({
  conflict,
  onToggle,
  onResolve,
  onIgnore,
}: {
  conflict: Conflict;
  onToggle: () => void;
  onResolve: () => void;
  onIgnore: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-[inset_0_0_0_1px_rgba(19,41,57,0.1875)]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge className="rounded-full border-transparent bg-[#fde3d9] text-[11px] font-semibold text-[#9e3d22] hover:bg-[#fde3d9]">
              Conflito pendente
            </Badge>
            <span className="text-sm font-medium text-[#132939]/75">{conflict.tag}</span>
          </div>
          <button
            onClick={onToggle}
            className="flex cursor-pointer items-center gap-1 text-[13px] text-[#132939]/[0.875]"
          >
            <span>{conflict.expanded ? "Ver menos" : "Ver mais"}</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", conflict.expanded && "rotate-180")}
            />
          </button>
        </div>
        <span className="text-[13px] text-[#132939]/75">{conflict.desc}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[13px] text-[#132939]/75">Mais antiga: {conflict.oldest}</span>
        <span className="text-[13px] text-[#132939]/75">Mais recente: {conflict.newest}</span>
      </div>

      {conflict.expanded && (
        <>
          <div className="flex flex-col gap-3 py-1">
            <span className="text-[11px] text-[#132939]/90">OCORRÊNCIAS</span>
            {conflict.occurrences.map((o, i) => (
              <div key={i} className="flex items-center gap-1 border-t border-[#01111e]/10 pt-2">
                <span className="text-xs font-medium text-[#132939]/90">&ldquo;{o.q}&rdquo;</span>
                <span className="flex-1 text-right text-[11px] text-[#132939]/60">{o.t}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <ConflictSourceCard
              icon={<Link2 className="h-5 w-5" />}
              name={conflict.a.name}
              desc={conflict.a.desc}
              updated={conflict.a.updated}
            />
            <ConflictSourceCard
              icon={<FileText className="h-5 w-5" />}
              name={conflict.b.name}
              desc={conflict.b.desc}
              updated={conflict.b.updated}
            />
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="flex-1 gap-1.5 border-[#d92b50] text-[#d92b50] hover:bg-[#d92b50]/10 hover:text-[#d92b50]"
              onClick={onIgnore}
            >
              <Ban className="h-4 w-4" />
              Desconsiderar conflito
            </Button>
            <Button
              className="flex-1 gap-1.5 bg-[#279661] text-white hover:bg-[#279661]/90"
              onClick={onResolve}
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar como resolvido
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ConflictSourceCard({
  icon,
  name,
  desc,
  updated,
}: {
  icon: React.ReactNode;
  name: string;
  desc: string;
  updated: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-lg bg-[#f5f7fa] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="flex-1 text-sm font-medium">{name}</span>
        <Pencil className="h-4 w-4 cursor-pointer text-[#132939]/60" />
      </div>
      <div className="h-px bg-[#01111e]/10" />
      <span className="text-sm leading-5">{desc}</span>
      <div className="flex items-center gap-1 text-xs text-[#132939]/75">
        <Clock className="h-4 w-4" />
        <span>Atualizado em {updated}</span>
      </div>
    </div>
  );
}

function MonthlyAnalysisBanner({ suggestionsCount }: { suggestionsCount: number }) {
  return (
    <div className="flex overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_rgba(19,41,57,0.1)]">
      <div className="flex w-16 flex-shrink-0 items-center justify-center bg-gradient-to-b from-[#f7deed] to-[#fde3d9]">
        <Sparkles className="h-6 w-6 text-[#ff5724]" />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-5 py-5">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border-transparent bg-[#f7deed] text-[11px] font-bold tracking-wide text-[#9e3d6e] hover:bg-[#f7deed]">
            ANÁLISE MENSAL
          </Badge>
          <Badge className="rounded-full border-transparent bg-[#01111e]/[0.06] text-[11px] font-semibold tracking-wide text-[#132939]/70 hover:bg-[#01111e]/[0.06]">
            AGOSTO 2026
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Download className="ml-auto h-[18px] w-[18px] cursor-pointer text-[#132939]/50" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              A cada mês, a Sophia analisa uma amostra de conversas não entendidas para identificar
              oportunidades de conteúdo. Essas sugestões não são filtradas pelo período dos dados
              acima.
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-[13px] text-[#616e7c]">
          Atendimentos com mensagens não entendidas
        </span>
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[#132939]/50" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#132939]/90">
                500 <span className="text-[13px] font-normal text-[#132939]/50">de 2000</span>
              </span>
              <span className="text-xs text-[#616e7c]">Mensagens analisadas</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#01111e]/10" />
          <div className="flex flex-1 items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#132939]/50" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#132939]/90">{suggestionsCount}</span>
              <span className="text-xs text-[#616e7c]">Recomendações de conteúdo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCarousel({
  suggestion,
  total,
  index,
  onPrev,
  onNext,
  onDot,
  onToggleOcc,
  onOpenInsert,
  onOpenView,
}: {
  suggestion: Suggestion;
  total: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onDot: (i: number) => void;
  onToggleOcc: () => void;
  onOpenInsert: () => void;
  onOpenView: () => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-[9px] bg-gradient-to-r from-[#f3cee4] to-[#fad0c4] p-px">
        <div className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-[3px_0_0_#ff5724_inset]">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-[#132939]/90">{suggestion.title}</span>
            {suggestion.added && (
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f8e2ef] to-[#f8e9e4] px-2 py-0.5 text-xs font-medium">
                <span className="bg-gradient-to-r from-[#d75ba5] to-[#ff5724] bg-clip-text font-bold text-transparent">
                  ✓
                </span>
                <span className="bg-gradient-to-r from-[#d75ba5] to-[#ff5724] bg-clip-text text-transparent">
                  Conteúdo adicionado
                </span>
              </span>
            )}
            <div className="flex-1" />
            {suggestion.added && (
              <div className="inline-block rounded-lg bg-gradient-to-r from-[#d75ba5] to-[#ff5724] p-px">
                <button
                  onClick={onOpenView}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] bg-white"
                >
                  <Eye className="h-[18px] w-[18px] text-[#ff5724]" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-[#01111e]/[0.06] px-2.5 py-1 text-xs text-[#132939]/70">
              {suggestion.occurrences} ocorrências
            </span>
            <span className="text-[13px] text-[#132939]/75">Mais antiga: {suggestion.oldest}</span>
            <span className="text-[13px] text-[#132939]/75">Mais recente: {suggestion.newest}</span>
            <button
              onClick={onToggleOcc}
              className="ml-auto flex cursor-pointer items-center gap-1 text-[13px] font-medium text-[#ff5724]"
            >
              Ver ocorrências
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  suggestion.occExpanded && "rotate-180",
                )}
              />
            </button>
          </div>

          {suggestion.occExpanded && (
            <div className="flex flex-col gap-2">
              {suggestion.occList.map((o, i) => (
                <div key={i} className="flex items-center gap-2 border-t border-[#01111e]/10 pt-2">
                  <span className="text-xs font-medium text-[#132939]/90">&ldquo;{o.q}&rdquo;</span>
                  <span className="flex-1 text-right text-[11px] text-[#132939]/50">{o.t}</span>
                  <ExternalLink className="h-3.5 w-3.5 cursor-pointer text-[#ff5724]" />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-[#132939]/75">Conteúdo sugerido:</span>
            <div className="rounded-lg bg-gradient-to-r from-[#fff4fb] to-[#fff9f6] p-3.5">
              <span className="text-sm leading-5 text-[#132939]/90">{suggestion.text}</span>
            </div>
          </div>

          {!suggestion.added && (
            <div className="self-center rounded-lg bg-gradient-to-r from-[#d75ba5] to-[#ff5724] p-px">
              <button
                onClick={onOpenInsert}
                className="flex cursor-pointer items-center gap-1.5 rounded-[7px] bg-white px-3 py-2 text-[13px] font-medium"
              >
                <Plus className="h-4 w-4 text-[#ff5724]" />
                <span className="bg-gradient-to-r from-[#d75ba5] to-[#ff5724] bg-clip-text text-transparent">
                  Adicionar este conteúdo
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <ChevronLeft onClick={onPrev} className="h-5 w-5 cursor-pointer text-[#132939]/50" />
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              onClick={() => onDot(i)}
              className={cn(
                "h-2 w-2 cursor-pointer rounded-full",
                i === index ? "bg-[#ff5724]" : "bg-[#132939]/15",
              )}
            />
          ))}
        </div>
        <ChevronRight onClick={onNext} className="h-5 w-5 cursor-pointer text-[#132939]/50" />
      </div>
    </div>
  );
}

function MessagesReview({
  msgs,
  onBack,
  onToggle,
  onDelete,
  onCopy,
}: {
  msgs: Msg[];
  onBack: () => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(42,48,66,0.16)]">
        <button
          onClick={onBack}
          className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#01111e]/[0.06]"
        >
          <ArrowLeft className="h-5 w-5 text-[#132939]/60" />
        </button>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-medium text-[#132939]/90">Mensagens não entendidas</span>
          <span className="text-[13px] text-[#616e7c]">
            Mensagens que não foram analisadas no relatório mensal e podem ser revisadas
            manualmente.
          </span>
        </div>
        <div className="h-8 w-px bg-[#01111e]/10" />
        <span className="text-2xl font-semibold text-[#ff5724]">{msgs.length}</span>
      </div>

      <div className="overflow-hidden rounded border border-[#01111e]/10 bg-white">
        <MessageTableHeader />
        {msgs.map((m) => (
          <MessageRow key={m.id} msg={m} onToggle={onToggle} onCopy={onCopy} onDelete={onDelete} />
        ))}
        {msgs.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-[#132939]/50">
            Nenhuma mensagem restante para revisão.
          </div>
        )}
      </div>
    </div>
  );
}

function MessageTableHeader() {
  return (
    <div className="flex gap-4 border-b border-[#01111e]/10 bg-[#f5f7fa] px-3 py-2">
      <span className="w-6" />
      <span className="flex-1 text-[13px] font-semibold text-[#132939]/75">Mensagem</span>
      <span className="w-[140px] text-[13px] font-semibold text-[#132939]/75">Data</span>
      <span className="w-20 text-[13px] font-semibold text-[#132939]/75">Ações</span>
    </div>
  );
}

function MessageRow({
  msg,
  onToggle,
  onCopy,
  onDelete,
}: {
  msg: Msg;
  onToggle: (id: number) => void;
  onCopy: (text: string) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#01111e]/10 px-3 py-3 last:border-0">
      <Checkbox checked={msg.checked} onCheckedChange={() => onToggle(msg.id)} />
      <span className="flex-1 text-sm text-[#132939]/90">{msg.text}</span>
      <span className="w-[140px] text-[13px] text-[#132939]/60">{msg.date}</span>
      <div className="flex w-24 gap-3">
        <ExternalLink className="h-[18px] w-[18px] cursor-pointer text-[#132939]/60" />
        <FilePlus2
          onClick={() => onCopy(msg.text)}
          className="h-[18px] w-[18px] cursor-pointer text-[#132939]/60"
        />
        <Trash2
          onClick={() => onDelete(msg.id)}
          className="h-[18px] w-[18px] cursor-pointer text-[#132939]/60"
        />
      </div>
    </div>
  );
}

function SophiaPanel({
  messages,
  draft,
  onDraftChange,
  onSend,
}: {
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <aside className="flex w-[380px] flex-shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white shadow-[0px_0px_10px_rgba(42,48,66,0.161)]">
      <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-[#01111e]/10 px-4">
        <Sparkles className="h-[18px] w-[18px] text-[#ff5724]" />
        <span className="flex-1 text-base font-medium">Testar conteúdo</span>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-b-2xl bg-[#ff5724] px-3 py-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-white/90">Olá, eu sou a Sophia</span>
          <span className="text-sm text-white">Hotel Fazendinha do Campo</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-5",
              m.from === "sophia" ? "self-start bg-[#f5f7fa]" : "self-end bg-[#ff5724] text-white",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-[#01111e]/10 px-4 py-3">
        <Input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Digite sua mensagem"
          className="flex-1 rounded-full border-[#01111e]/10 px-4 py-2.5 text-[13px] focus-visible:ring-[#ff5724]"
        />
        <Send onClick={onSend} className="h-5 w-5 cursor-pointer text-[#ff5724]" />
      </div>
    </aside>
  );
}

function InsertContentModal({
  state,
  onClose,
  onTabChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onUrlChange,
  onExtract,
  onConfirm,
}: {
  state: InsertModalState;
  onClose: () => void;
  onTabChange: (tab: ModalTab) => void;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onFileChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onExtract: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[82vh] w-[780px] max-w-[92vw] flex-col gap-0 overflow-auto p-0">
        <DialogHeader className="gap-1 px-6 pt-5 text-left">
          <DialogTitle>Inserir conteúdo</DialogTitle>
          <span className="text-[13px] text-[#616e7c]">{state.title}</span>
        </DialogHeader>

        <Tabs value={state.tab} onValueChange={(v) => onTabChange(v as ModalTab)} className="mt-2">
          <TabsList className="mx-6 grid w-auto grid-cols-3 bg-transparent p-0">
            <TabsTrigger
              value="escrever"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-0 pb-2.5 data-[state=active]:border-[#ff5724] data-[state=active]:bg-transparent data-[state=active]:text-[#ff5724] data-[state=active]:shadow-none"
            >
              <PenLine className="h-4 w-4" />
              Escrever conteúdo
            </TabsTrigger>
            <TabsTrigger
              value="arquivo"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-0 pb-2.5 data-[state=active]:border-[#ff5724] data-[state=active]:bg-transparent data-[state=active]:text-[#ff5724] data-[state=active]:shadow-none"
            >
              <FileText className="h-4 w-4" />
              Enviar arquivo
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-0 pb-2.5 data-[state=active]:border-[#ff5724] data-[state=active]:bg-transparent data-[state=active]:text-[#ff5724] data-[state=active]:shadow-none"
            >
              <Link2 className="h-4 w-4" />
              Buscar dados de link
            </TabsTrigger>
          </TabsList>
          <div className="h-px bg-[#01111e]/10" />
        </Tabs>

        {state.tab === "escrever" && (
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#132939]/75">Título</span>
              <Input value={state.title} onChange={(e) => onTitleChange(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#132939]/75">Conteúdo</span>
                <span className="flex items-center gap-1 rounded-full bg-[#fde3d9] px-2 py-0.5 text-[11px] font-semibold text-[#ff5724]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Conteúdo sugerido pela IA
                </span>
              </div>
              <Textarea
                value={state.content}
                onChange={(e) => onContentChange(e.target.value)}
                className="min-h-[160px] resize-y"
              />
              <span className="text-xs text-[#616e7c]">
                Digite uma frase ou texto com as informações que a Sophia deve utilizar nas
                respostas.
              </span>
            </div>
          </div>
        )}

        {state.tab === "arquivo" && (
          <div className="flex flex-col gap-2 px-6 py-5">
            <span className="text-[13px] font-medium text-[#132939]/75">Enviar arquivos</span>
            <div className="flex overflow-hidden rounded-lg border border-[#01111e]/10">
              <span className="flex-1 px-3 py-2.5 text-sm text-[#132939]/50">
                {state.fileName || "Nenhum arquivo escolhido"}
              </span>
              <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap bg-gradient-to-r from-[#e9427a] to-[#ff5724] px-4 py-2.5 text-[13px] font-semibold text-white">
                <FileText className="h-4 w-4" />
                Escolher arquivo
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </div>
            <span className="text-xs text-[#616e7c]">
              Arquivos suportados: PDF, DOCX, TXT (máx. 100MB)
            </span>
          </div>
        )}

        {state.tab === "url" && (
          <div className="flex flex-col gap-2 px-6 py-5">
            <span className="text-[13px] font-medium text-[#132939]/75">Link do conteúdo</span>
            <div className="flex overflow-hidden rounded-lg border border-[#01111e]/10">
              <input
                value={state.url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
              <button
                onClick={onExtract}
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap bg-gradient-to-r from-[#e9427a] to-[#ff5724] px-4 py-2.5 text-[13px] font-semibold text-white"
              >
                <Download className="h-4 w-4" />
                Extrair
              </button>
            </div>
            <span className="text-xs text-[#616e7c]">
              Informe a url da qual deseja extrair o conteúdo.
            </span>
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-[#f5f7fa] p-2.5">
              <Lightbulb className="h-4 w-4 flex-shrink-0 text-[#ff5724]" />
              <span className="text-xs leading-[18px] text-[#132939]/75">
                <strong>Dica importante:</strong> certifique-se de inserir uma página exclusiva
                sobre um único assunto. Páginas específicas garantem melhor desempenho na
                compreensão e precisão das respostas da Sophia.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 px-6 pb-6 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#ff5724] font-semibold text-white hover:bg-[#ff5724]/90"
          >
            Inserir conteúdo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewContentModal({ state, onClose }: { state: ViewModalState; onClose: () => void }) {
  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex w-[780px] max-w-[92vw] flex-col gap-0 p-0">
        <DialogHeader className="gap-1.5 px-6 pt-5 text-left">
          <DialogTitle>{state.title}</DialogTitle>
          <div className="flex items-center gap-2.5 text-xs text-[#616e7c]">
            <Clock className="h-3.5 w-3.5 text-[#ff5724]" />
            <span>Atualizado em: {state.date}</span>
            <span className="text-[#01111e]/10">|</span>
            <span>Por: Ana Barcellos</span>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 py-5">
          <span className="text-[13px] font-medium text-[#132939]/75">Conteúdo</span>
          <div className="rounded-lg bg-gradient-to-r from-[#fff4fb] to-[#fff9f6] p-4">
            <span className="text-sm leading-5 text-[#132939]/90">{state.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#01111e]/10 px-6 py-4">
          <CheckCircle2 className="h-4 w-4 text-[#ff5724]" />
          <span className="text-xs text-[#616e7c]">
            Conteúdo publicado e em uso pela Sophia nas respostas.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
