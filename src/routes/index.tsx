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
  CalendarCheck,
  CalendarClock,
  ChartNoAxesColumn,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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
  Loader2,
  MessageSquare,
  Pencil,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Share2,
  Sparkles,
  Tag,
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
  date: string;
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

type ContentFormState = {
  tab: ModalTab;
  title: string;
  content: string;
  fileName: string;
  url: string;
};

type InsertModalState = ContentFormState & {
  open: boolean;
  suggestionId: number | null;
};

type AddContentPageState = ContentFormState & {
  open: boolean;
  sourceMessageId: number | null;
  sourceText: string;
  sourceDate: string;
};

type ViewModalState = {
  open: boolean;
  title: string;
  text: string;
  date: string;
  url?: string | undefined;
  sourceMessage?: string | undefined;
  aiSuggested?: boolean | undefined;
};

type ChatMessage = { id: number; from: "sophia" | "user"; text: string };

const INITIAL_CONFLICTS: Conflict[] = [
  {
    id: 1,
    date: "29/08/2026",
    expanded: false,
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
    date: "12/08/2026",
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
    added: false,
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
  {
    id: 4,
    title: "Café da manhã e opções alimentares",
    occurrences: 118,
    oldest: "03/08/2026",
    newest: "23/08/2026",
    added: false,
    occExpanded: false,
    text: "O café da manhã está incluído na diária e é servido das 6h30 às 10h30 no restaurante principal. Oferecemos opções vegetarianas e sem glúten mediante solicitação na recepção.",
    occList: [
      { q: "O café da manhã está incluso?", t: "23/08/2026" },
      { q: "Tem opção vegetariana no café?", t: "19/08/2026" },
      { q: "Até que horas serve o café da manhã?", t: "11/08/2026" },
    ],
  },
  {
    id: 5,
    title: "Estacionamento e manobrista",
    occurrences: 96,
    oldest: "01/08/2026",
    newest: "21/08/2026",
    added: false,
    occExpanded: false,
    text: "O hotel conta com estacionamento próprio gratuito para hóspedes, sujeito à disponibilidade de vagas. Também oferecemos serviço de manobrista mediante taxa adicional de [VALOR_TAXA_MANOBRISTA].",
    occList: [
      { q: "O estacionamento é gratuito?", t: "21/08/2026" },
      { q: "Tem vaga coberta?", t: "14/08/2026" },
      { q: "Vocês têm manobrista?", t: "06/08/2026" },
    ],
  },
  {
    id: 6,
    title: "Wi-fi e conectividade nos quartos",
    occurrences: 74,
    oldest: "04/08/2026",
    newest: "20/08/2026",
    added: false,
    occExpanded: false,
    text: "O wi-fi é gratuito e está disponível em todas as áreas do hotel, incluindo os quartos. A senha de acesso é fornecida no momento do check-in.",
    occList: [
      { q: "Tem wi-fi grátis no quarto?", t: "20/08/2026" },
      { q: "Qual a senha do wi-fi?", t: "16/08/2026" },
      { q: "O sinal de internet é bom no quarto?", t: "09/08/2026" },
    ],
  },
  {
    id: 7,
    title: "Piscina e horário de funcionamento",
    occurrences: 65,
    oldest: "06/08/2026",
    newest: "25/08/2026",
    added: false,
    occExpanded: false,
    text: "A piscina fica aberta diariamente das 8h às 20h e não possui aquecimento. Toalhas de piscina podem ser retiradas na recepção mediante apresentação do número do quarto.",
    occList: [
      { q: "A piscina é aquecida?", t: "25/08/2026" },
      { q: "Até que horas a piscina fica aberta?", t: "17/08/2026" },
      { q: "Preciso levar toalha para a piscina?", t: "08/08/2026" },
    ],
  },
  {
    id: 8,
    title: "Política de cancelamento e reembolso",
    occurrences: 58,
    oldest: "02/08/2026",
    newest: "19/08/2026",
    added: false,
    occExpanded: false,
    text: "Cancelamentos feitos com até 48 horas de antecedência não possuem multa e o valor é reembolsado integralmente. Após esse prazo, será cobrada a primeira diária como taxa de cancelamento.",
    occList: [
      { q: "Posso cancelar sem multa?", t: "19/08/2026" },
      { q: "Qual o prazo para cancelar de graça?", t: "13/08/2026" },
      { q: "Como funciona o reembolso em caso de cancelamento?", t: "03/08/2026" },
    ],
  },
  {
    id: 9,
    title: "Transporte e transfer do aeroporto",
    occurrences: 53,
    oldest: "05/08/2026",
    newest: "22/08/2026",
    added: false,
    occExpanded: false,
    text: "Oferecemos serviço de transfer do aeroporto mediante reserva prévia e taxa adicional. O aeroporto mais próximo fica a aproximadamente 25 minutos do hotel.",
    occList: [
      { q: "Vocês fazem transfer do aeroporto?", t: "22/08/2026" },
      { q: "Quanto tempo do aeroporto até o hotel?", t: "15/08/2026" },
      { q: "Como reservo o transfer?", t: "07/08/2026" },
    ],
  },
  {
    id: 10,
    title: "Academia e área de bem-estar",
    occurrences: 47,
    oldest: "07/08/2026",
    newest: "24/08/2026",
    added: false,
    occExpanded: false,
    text: "A academia funciona 24 horas e é de uso exclusivo dos hóspedes. Também contamos com uma área de spa com massagens mediante agendamento na recepção.",
    occList: [
      { q: "Tem academia no hotel?", t: "24/08/2026" },
      { q: "A academia funciona 24h?", t: "18/08/2026" },
      { q: "Vocês têm spa?", t: "10/08/2026" },
    ],
  },
  {
    id: 11,
    title: "Formas de pagamento aceitas",
    occurrences: 44,
    oldest: "03/08/2026",
    newest: "21/08/2026",
    added: false,
    occExpanded: false,
    text: "Aceitamos pagamento em cartão de crédito, débito e Pix. Pagamentos em dinheiro também são aceitos, mas recomendamos confirmar com a recepção no momento da reserva.",
    occList: [
      { q: "Vocês aceitam Pix?", t: "21/08/2026" },
      { q: "Posso pagar em dólar?", t: "14/08/2026" },
      { q: "Dá para parcelar no cartão?", t: "05/08/2026" },
    ],
  },
  {
    id: 12,
    title: "Berço e itens para bebês",
    occurrences: 36,
    oldest: "06/08/2026",
    newest: "20/08/2026",
    added: false,
    occExpanded: false,
    text: "Disponibilizamos berço sem custo adicional mediante solicitação prévia na reserva. Também oferecemos kit de banho e aquecedor de mamadeira sob consulta.",
    occList: [
      { q: "Tem berço disponível?", t: "20/08/2026" },
      { q: "O berço tem custo extra?", t: "12/08/2026" },
      { q: "Vocês têm aquecedor de mamadeira?", t: "06/08/2026" },
    ],
  },
  {
    id: 13,
    title: "Serviço de lavanderia",
    occurrences: 31,
    oldest: "08/08/2026",
    newest: "23/08/2026",
    added: false,
    occExpanded: false,
    text: "O hotel oferece serviço de lavanderia com prazo de entrega em até 24 horas. O valor cobrado é de [PRECO_POR_PECA] por peça e pode ser solicitado diretamente com a governança.",
    occList: [
      { q: "Como funciona a lavanderia do hotel?", t: "23/08/2026" },
      { q: "Quanto tempo demora para lavar a roupa?", t: "16/08/2026" },
      { q: "Qual o valor da lavanderia?", t: "09/08/2026" },
    ],
  },
  {
    id: 14,
    title: "Guarda-volumes após o check-out",
    occurrences: 27,
    oldest: "09/08/2026",
    newest: "22/08/2026",
    added: false,
    occExpanded: false,
    text: "Hóspedes podem deixar as malas guardadas gratuitamente na recepção após o check-out, sem limite de tempo definido dentro do mesmo dia.",
    occList: [
      { q: "Posso deixar minha mala depois do check-out?", t: "22/08/2026" },
      { q: "O guarda-volumes tem custo?", t: "17/08/2026" },
      { q: "Até que horas posso retirar minha mala?", t: "10/08/2026" },
    ],
  },
  {
    id: 15,
    title: "Eventos e espaços para reuniões",
    occurrences: 22,
    oldest: "10/08/2026",
    newest: "24/08/2026",
    added: false,
    occExpanded: false,
    text: "Contamos com salas de reunião equipadas para até [CAPACIDADE_MAXIMA_PESSOAS] pessoas e também organizamos casamentos e festas de aniversário mediante orçamento personalizado. Para solicitar uma proposta, entre em contato pelo [CONTATO_EVENTOS].",
    occList: [
      { q: "Vocês têm espaço para eventos?", t: "24/08/2026" },
      { q: "Fazem casamentos no hotel?", t: "19/08/2026" },
      { q: "Tem sala de reunião para empresas?", t: "11/08/2026" },
    ],
  },
];

const UNANSWERED_MESSAGE_TEMPLATES = [
  "Qual o horário de check-in e check-out?",
  "Vocês têm estacionamento gratuito para hóspedes?",
  "O café da manhã está incluso na diária?",
  "Posso levar meu cachorro de pequeno porte?",
  "O hotel tem piscina aquecida?",
  "Qual a política de cancelamento sem multa?",
  "Vocês aceitam pagamento em dólar?",
  "Tem wi-fi grátis nos quartos?",
  "Existe transporte do aeroporto até o hotel?",
  "Quantos quilômetros o hotel fica da praia?",
  "Posso fazer check-in antecipado se eu chegar de manhã?",
  "É possível fazer late check-out até às 14h?",
  "O quarto tem ar-condicionado?",
  "Vocês têm cama extra para criança no quarto?",
  "Qual a idade mínima para se hospedar sozinho?",
  "O hotel oferece serviço de quarto 24 horas?",
  "Tem academia disponível para os hóspedes?",
  "Vocês têm spa ou serviço de massagem?",
  "É permitido fumar nas varandas dos quartos?",
  "Como funciona o serviço de lavanderia?",
  "Posso deixar minha mala guardada após o check-out?",
  "O hotel tem estrutura para cadeirantes?",
  "Quais canais de TV estão disponíveis nos quartos?",
  "Vocês fazem desconto para grupos ou famílias grandes?",
  "Tem sala de reuniões ou espaço para eventos corporativos?",
  "O hotel organiza casamentos ou festas de aniversário?",
  "Vocês têm pacote de lua de mel com algum benefício?",
  "Qual a distância até o aeroporto mais próximo?",
  "Quais pontos turísticos ficam perto do hotel?",
  "A água da torneira é potável?",
  "A voltagem das tomadas é 110 ou 220?",
  "Vocês emitem nota fiscal para reembolso da empresa?",
  "Como funciona o check-in para famílias grandes?",
  "Se chover durante minha viagem, tenho direito a reembolso?",
  "O restaurante do hotel serve jantar todos os dias?",
  "Tem opção de refeição vegetariana ou vegana no café da manhã?",
  "O hotel tem vaga de garagem coberta?",
  "É necessário pagar caução na chegada?",
  "Posso pagar a diária parcelado no cartão de crédito?",
  "Tem berço disponível para bebês?",
  "O hotel aceita animais de grande porte?",
  "Vocês têm cofre no quarto para guardar objetos de valor?",
  "Como faço para reservar um transfer até o hotel?",
  "O hotel fica perto do centro da cidade?",
  "Existe horário de silêncio à noite?",
  "Posso remarcar minha reserva para outra data sem custo?",
  "Vocês oferecem passeios ou excursões pela região?",
  "O quarto tem varanda com vista para o mar?",
  "Preciso apresentar algum documento além do RG na recepção?",
  "O hotel tem loja de conveniência ou minibar no quarto?",
  "Qual o horário de funcionamento da piscina?",
];

const TODAY = new Date(2026, 8, 1);

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildUnansweredMessage(index: number): Msg {
  const template = UNANSWERED_MESSAGE_TEMPLATES[index % UNANSWERED_MESSAGE_TEMPLATES.length]!;
  const dayOffset = index % 30;
  const date = addDays(TODAY, -dayOffset);
  const hour = String(6 + (index % 16)).padStart(2, "0");
  const minute = String((index * 7) % 60).padStart(2, "0");
  return {
    id: index + 1,
    text: template,
    date: `${formatDateBR(date)} às ${hour}:${minute}`,
    checked: false,
  };
}

function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function parseBRDate(value: string): Date {
  const [datePart] = value.split(" às ");
  const [day, month, year] = datePart!.split("/").map(Number);
  return new Date(year!, month! - 1, day);
}

function isWithinPeriod(dateStr: string, period: string): boolean {
  const date = parseBRDate(dateStr);
  const diffDays = Math.round((TODAY.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  switch (period) {
    case "Hoje":
      return diffDays === 0;
    case "Última semana":
      return diffDays >= 0 && diffDays <= 6;
    case "Últimos 30 dias":
      return diffDays >= 0 && diffDays <= 29;
    case "Este mês":
      return date.getFullYear() === TODAY.getFullYear() && date.getMonth() === TODAY.getMonth();
    default:
      return true;
  }
}

const PLACEHOLDER_PATTERN = /\[[A-Z0-9_]+\]/;

function hasPlaceholder(text: string): boolean {
  return PLACEHOLDER_PATTERN.test(text);
}

const INITIAL_MSGS: Msg[] = Array.from({ length: 529 }, (_, index) => buildUnansweredMessage(index));

type DataHubAction = "refresh" | "download" | "eye" | "gear" | "trash";

type DataHubContentOrigin = { type: "message"; sourceText: string } | { type: "ai_suggestion" };

type DataHubContent = {
  id: number;
  name: string;
  icon: "link" | "file" | "shield";
  updated: string;
  nextUpdate?: string;
  promotional: boolean;
  expires: string;
  actions: DataHubAction[];
  content?: string;
  origin?: DataHubContentOrigin;
};

const INITIAL_SYNCED_CONTENTS: DataHubContent[] = [
  {
    id: 1,
    name: "clima tiempo",
    icon: "link",
    updated: "31/08/2026 11:34",
    nextUpdate: "Em 1 dia",
    promotional: false,
    expires: "--",
    actions: ["refresh", "eye", "gear", "trash"],
  },
];

const INITIAL_OTHER_CONTENTS: DataHubContent[] = [
  {
    id: 2,
    name: "Contato",
    icon: "file",
    updated: "22/04/2026",
    promotional: false,
    expires: "--",
    actions: ["download", "eye", "gear", "trash"],
  },
  {
    id: 3,
    name: "https://www.resner.com.br/",
    icon: "link",
    updated: "28/04/2026",
    promotional: false,
    expires: "--",
    actions: ["refresh", "download", "eye", "gear", "trash"],
  },
  {
    id: 4,
    name: "novo doc",
    icon: "file",
    updated: "09/07/2026",
    promotional: false,
    expires: "--",
    actions: ["download", "eye", "gear", "trash"],
  },
  {
    id: 5,
    name: "teste",
    icon: "file",
    updated: "15/04/2026",
    promotional: true,
    expires: "--",
    actions: ["download", "eye", "gear", "trash"],
  },
  {
    id: 6,
    name: "Toalhas",
    icon: "file",
    updated: "22/04/2026",
    promotional: false,
    expires: "--",
    actions: ["download", "eye", "gear", "trash"],
  },
  {
    id: 7,
    name: "Conteúdo Padrão",
    icon: "shield",
    updated: "01/09/2026",
    promotional: false,
    expires: "--",
    actions: ["eye"],
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

const EMPTY_ADD_CONTENT_PAGE: AddContentPageState = {
  open: false,
  sourceMessageId: null,
  sourceText: "",
  sourceDate: "",
  tab: "escrever",
  title: "",
  content: "",
  fileName: "",
  url: "",
};

function Index() {
  const [activePage, setActivePage] = useState<"analytics" | "dataHub">("analytics");

  const [period, setPeriod] = useState<string>("Última semana");
  const [conflicts, setConflicts] = useState<Conflict[]>(INITIAL_CONFLICTS);
  const [resolvedCount, setResolvedCount] = useState(6);
  const [ignoredCount, setIgnoredCount] = useState(2);

  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<number[]>([]);

  const [msgs, setMsgs] = useState<Msg[]>(INITIAL_MSGS);
  const [msgsReviewOpen, setMsgsReviewOpen] = useState(false);

  const [syncedContents, setSyncedContents] = useState<DataHubContent[]>(INITIAL_SYNCED_CONTENTS);
  const [otherContents, setOtherContents] = useState<DataHubContent[]>(INITIAL_OTHER_CONTENTS);

  const [insertModal, setInsertModal] = useState<InsertModalState>(EMPTY_INSERT_MODAL);
  const [viewModal, setViewModal] = useState<ViewModalState>(EMPTY_VIEW_MODAL);
  const [addContentPage, setAddContentPage] = useState<AddContentPageState>(EMPTY_ADD_CONTENT_PAGE);
  const [pendingMessageContentCount, setPendingMessageContentCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "sophia",
      text: "Seja bem-vindo ao Hotel Fazendinha do Campo! Sou a Sophia, assistente digital do hotel, e estou aqui 24h para te auxiliar no que for preciso. Estamos esperando por você! Como posso ajudá-lo hoje?",
    },
    { id: 2, from: "user", text: "Quero saber os horários de checkout" },
  ]);
  const [chatDraft, setChatDraft] = useState("");

  const orderedSuggestions = [...suggestions].sort(
    (a, b) => Number(a.added) - Number(b.added),
  );
  const currentSuggestion = orderedSuggestions[currentSuggestionIndex];
  const allSuggestionsAdded = suggestions.length > 0 && suggestions.every((s) => s.added);
  const pendingCount = pendingChanges.length + pendingMessageContentCount;

  const filteredConflicts = conflicts.filter((c) => isWithinPeriod(c.date, period));
  const filteredMsgs = msgs.filter((m) => isWithinPeriod(m.date, period));

  function navigateTo(page: "analytics" | "dataHub") {
    setActivePage(page);
    setMsgsReviewOpen(false);
    setAddContentPage(EMPTY_ADD_CONTENT_PAGE);
  }

  function deleteSyncedContent(id: number) {
    setSyncedContents((cs) => cs.filter((c) => c.id !== id));
    toast("Conteúdo removido do Data Hub.");
  }

  function deleteOtherContent(id: number) {
    setOtherContents((cs) => cs.filter((c) => c.id !== id));
    toast("Conteúdo removido do Data Hub.");
  }

  function viewDataHubContent(row: DataHubContent) {
    setViewModal({
      open: true,
      title: row.name,
      text: row.content ?? "",
      date: row.updated,
      url: row.icon === "link" ? row.name : undefined,
      sourceMessage: row.origin?.type === "message" ? row.origin.sourceText : undefined,
      aiSuggested: row.origin?.type === "ai_suggestion",
    });
  }

  function editViewedContent() {
    toast("Edição de conteúdo em breve.");
    setViewModal(EMPTY_VIEW_MODAL);
  }

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
    setOtherContents((cs) => [
      ...cs,
      {
        id: Date.now(),
        name: insertModal.title,
        icon: "file",
        updated: formatDateBR(new Date()),
        promotional: false,
        expires: "--",
        actions: ["download", "eye", "gear", "trash"],
        content: insertModal.content,
        origin: { type: "ai_suggestion" },
      },
    ]);
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
    if (pendingCount === 0 || isPublishing) return;
    const ids = pendingChanges;
    setSuggestions((ss) => ss.map((s) => (ids.includes(s.id) ? { ...s, added: false } : s)));
    setPendingChanges([]);
    setPendingMessageContentCount(0);
    toast("Alterações descartadas.");
  }

  function publishChanges() {
    if (pendingCount === 0 || isPublishing) return;
    const n = pendingCount;
    setIsPublishing(true);
    setTimeout(() => {
      setPendingChanges([]);
      setPendingMessageContentCount(0);
      setIsPublishing(false);
      toast.success(`${n} ${n === 1 ? "conteúdo publicado" : "conteúdos publicados"} com sucesso!`, {
        description: "Nas próximas conversas sobre o tema, a Sophia já responde.",
      });
    }, 1200);
  }

  function toggleMsg(id: number) {
    setMsgs((ms) => ms.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));
  }

  function deleteMsg(id: number) {
    setMsgs((ms) => ms.filter((m) => m.id !== id));
  }

  function openAddContentPage(msg: Msg) {
    setAddContentPage({
      open: true,
      sourceMessageId: msg.id,
      sourceText: msg.text,
      sourceDate: msg.date,
      tab: "escrever",
      title: "",
      content: "",
      fileName: "",
      url: "",
    });
  }

  function closeAddContentPage() {
    setAddContentPage(EMPTY_ADD_CONTENT_PAGE);
  }

  function confirmAddContentPage() {
    setPendingMessageContentCount((n) => n + 1);
    if (addContentPage.sourceMessageId !== null) {
      setMsgs((ms) => ms.filter((m) => m.id !== addContentPage.sourceMessageId));
    }
    setOtherContents((cs) => [
      ...cs,
      {
        id: Date.now(),
        name: addContentPage.title || "Conteúdo sem título",
        icon: "file",
        updated: formatDateBR(new Date()),
        promotional: false,
        expires: "--",
        actions: ["download", "eye", "gear", "trash"],
        content: addContentPage.content,
        origin: { type: "message", sourceText: addContentPage.sourceText },
      },
    ]);
    toast.success(`"${addContentPage.title || "Conteúdo"}" adicionado às alterações pendentes.`, {
      description: "Publique para a Sophia usar este conteúdo.",
    });
    closeAddContentPage();
  }

  function extractAddContentPageUrl() {
    if (!addContentPage.url.trim()) return;
    toast("Extraindo conteúdo da URL informada...");
    setTimeout(() => {
      setAddContentPage((s) => ({
        ...s,
        tab: "escrever",
        content: `Conteúdo extraído de ${s.url}. Revise e ajuste o texto antes de publicar.`,
      }));
      toast.success("Conteúdo extraído com sucesso.");
    }, 900);
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
          <SubMenu
            publishPending={pendingCount > 0}
            activePage={activePage}
            onNavigate={navigateTo}
          />

          <main className="flex min-w-[640px] flex-1 flex-col gap-6 overflow-auto p-8">
            {addContentPage.open ? (
              <AddContentPage
                state={addContentPage}
                onBack={closeAddContentPage}
                onTabChange={(tab) => setAddContentPage((s) => ({ ...s, tab }))}
                onTitleChange={(title) => setAddContentPage((s) => ({ ...s, title }))}
                onContentChange={(content) => setAddContentPage((s) => ({ ...s, content }))}
                onFileChange={(fileName) => setAddContentPage((s) => ({ ...s, fileName }))}
                onUrlChange={(url) => setAddContentPage((s) => ({ ...s, url }))}
                onExtract={extractAddContentPageUrl}
                onConfirm={confirmAddContentPage}
              />
            ) : activePage === "dataHub" ? (
              <DataHubPage
                pendingCount={pendingCount}
                isPublishing={isPublishing}
                onDiscard={discardChanges}
                onPublish={publishChanges}
                syncedContents={syncedContents}
                otherContents={otherContents}
                onDeleteSynced={deleteSyncedContent}
                onDeleteOther={deleteOtherContent}
                onViewContent={viewDataHubContent}
              />
            ) : !msgsReviewOpen ? (
              <>
                <PageHeader
                  pendingCount={pendingCount}
                  isPublishing={isPublishing}
                  onDiscard={discardChanges}
                  onPublish={publishChanges}
                  period={period}
                  onPeriodChange={setPeriod}
                />

                <ConflictsCard
                  conflicts={filteredConflicts}
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

                  <MonthlyAnalysisBanner
                    suggestionsCount={suggestions.length}
                    unreviewedCount={filteredMsgs.length}
                    onReviewIndividually={() => setMsgsReviewOpen(true)}
                  />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-[#132939]/50">
                        SUGESTÕES DE CONTEÚDO
                      </span>
                    </div>

                    {allSuggestionsAdded && (
                      <div className="flex items-center gap-4 rounded-lg px-5 py-4 shadow-[inset_0_0_0_1px_rgba(19,41,57,0.1)]">
                        <CheckCircle2 className="h-10 w-10 flex-shrink-0 text-[#ff5724]" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base font-medium text-[#01111e]/[0.87]">
                            Você adicionou todas as sugestões!
                          </span>
                          <span className="text-[13px] text-[#01111e]/[0.49]">
                            Novas recomendações de conteúdo aparecerão aqui no próximo ciclo
                            mensal.
                          </span>
                        </div>
                      </div>
                    )}

                    {currentSuggestion && (
                      <SuggestionCarousel
                        suggestion={currentSuggestion}
                        total={suggestions.length}
                        index={currentSuggestionIndex}
                        addedFlags={orderedSuggestions.map((s) => s.added)}
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

                </div>
              </>
            ) : (
              <MessagesReview
                msgs={filteredMsgs}
                onBack={() => setMsgsReviewOpen(false)}
                onToggle={toggleMsg}
                onDelete={deleteMsg}
                onAddContent={openAddContentPage}
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

        <ViewContentModal
          state={viewModal}
          onClose={() => setViewModal(EMPTY_VIEW_MODAL)}
          onEdit={editViewedContent}
        />
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

const SETTINGS_ITEMS = ["Estilos de comunicação", "Atendimento humano", "Formulários"];

function SubMenu({
  publishPending,
  activePage,
  onNavigate,
}: {
  publishPending: boolean;
  activePage: "analytics" | "dataHub";
  onNavigate: (page: "analytics" | "dataHub") => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(true);

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
        <SubMenuNavItem
          icon={<Share2 className="h-[18px] w-[18px]" />}
          label="Data Hub"
          active={activePage === "dataHub"}
          onClick={() => onNavigate("dataHub")}
        />
        <SubMenuNavItem
          icon={<ChartNoAxesColumn className="h-[18px] w-[18px]" />}
          label="Analytics"
          active={activePage === "analytics"}
          onClick={() => onNavigate("analytics")}
        />
        <SubMenuItem icon={<Tag className="h-[18px] w-[18px]" />} label="Automação de etiquetas" />
        <div className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[#132939]/75 hover:bg-[#01111e]/[0.04]">
          <Rocket className="h-[18px] w-[18px] flex-shrink-0 text-[#5b6b79]" />
          <span>Publicar</span>
          {publishPending && (
            <Badge className="ml-2 rounded-md border-transparent bg-[#fde8be] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8a5a12] shadow-none hover:bg-[#fde8be]">
              pendente
            </Badge>
          )}
        </div>

        <div className="my-1 h-px bg-[#d3d7da]" />

        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm text-[#132939]/75 hover:bg-[#01111e]/[0.04]"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="h-[18px] w-[18px]" />
            <span>Configurações</span>
          </div>
          {settingsOpen ? (
            <ChevronUp className="h-4 w-4 text-[#132939]/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#132939]/40" />
          )}
        </button>
        {settingsOpen && (
          <div className="flex flex-col gap-2 pl-7">
            {SETTINGS_ITEMS.map((label) => (
              <SubMenuItem key={label} label={label} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function SubMenuNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm",
        active
          ? "bg-[#fde3d9] font-semibold text-[#ff5724]"
          : "text-[#132939]/75 hover:bg-[#01111e]/[0.04]",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SubMenuItem({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[#132939]/75 hover:bg-[#01111e]/[0.04]">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function PublishActionsBar({
  pendingCount,
  isPublishing,
  onDiscard,
  onPublish,
}: {
  pendingCount: number;
  isPublishing: boolean;
  onDiscard: () => void;
  onPublish: () => void;
}) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-[18px] w-[18px]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ajuda sobre esta página</TooltipContent>
      </Tooltip>
      <Button
        variant="outline"
        size="sm"
        disabled={pendingCount === 0 || isPublishing}
        onClick={onDiscard}
      >
        Descartar alterações
      </Button>
      <Button
        size="sm"
        disabled={pendingCount === 0 || isPublishing}
        onClick={onPublish}
        className="gap-1.5 bg-[#ff5724] text-white hover:bg-[#ff5724]/90 disabled:bg-[#132939]/15 disabled:text-[#132939]/40"
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Publicando...
          </>
        ) : (
          <>
            <Rocket className="h-4 w-4" />
            {pendingCount > 0 ? `Publicar alterações (${pendingCount})` : "Publicar alterações"}
          </>
        )}
      </Button>
    </>
  );
}

function PageHeader({
  pendingCount,
  isPublishing,
  onDiscard,
  onPublish,
  period,
  onPeriodChange,
}: {
  pendingCount: number;
  isPublishing: boolean;
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
          <PublishActionsBar
            pendingCount={pendingCount}
            isPublishing={isPublishing}
            onDiscard={onDiscard}
            onPublish={onPublish}
          />
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

function MonthlyAnalysisBanner({
  suggestionsCount,
  unreviewedCount,
  onReviewIndividually,
}: {
  suggestionsCount: number;
  unreviewedCount: number;
  onReviewIndividually: () => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[#01111e]/10 bg-white">
      <div className="flex w-16 flex-shrink-0 items-center justify-center bg-gradient-to-b from-[#f7deed] to-[#fde3d9]">
        <svg width="0" height="0" className="absolute">
          <linearGradient id="monthlyAnalysisIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d75ba5" />
            <stop offset="100%" stopColor="#ff5724" />
          </linearGradient>
        </svg>
        <Sparkles
          className="h-6 w-6"
          fill="url(#monthlyAnalysisIconGradient)"
          stroke="url(#monthlyAnalysisIconGradient)"
        />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-5 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#d75ba5] to-[#ff5724] bg-clip-text text-[11px] font-bold tracking-wide text-transparent">
              ANÁLISE MENSAL
            </span>
            <Badge className="rounded-full border-transparent bg-gradient-to-r from-[#f7deed] to-[#fde3d9] text-[11px] font-bold tracking-wide text-[#9e3d6e] hover:from-[#f7deed] hover:to-[#fde3d9]">
              AGOSTO 2026
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 cursor-help text-[#132939]/50" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Todos os meses, a Sophia analisa uma quantidade de mensagens não entendidas para
                gerar sugestões de conteúdo baseadas em tópicos que foram muito perguntados mas
                não tinham conteúdo cadastrado.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Download
                  onClick={() => toast("Baixando relatório em PDF...")}
                  className="ml-auto h-[18px] w-[18px] cursor-pointer text-[#132939]/50"
                />
              </TooltipTrigger>
              <TooltipContent>Baixar PDF</TooltipContent>
            </Tooltip>
          </div>
          <span className="text-[13px] text-[#616e7c]">
            Análise das mensagens que a Sophia não entendeu e que não receberam tratativa no
            período
          </span>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-1 items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[#132939]/50" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#132939]/90">500</span>
              <span className="text-xs text-[#616e7c]">Mensagens analisadas</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#01111e]/10" />
          <div className="flex flex-1 items-center gap-3">
            <Lightbulb className="h-5 w-5 text-[#132939]/50" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#132939]/90">{suggestionsCount}</span>
              <span className="text-xs text-[#616e7c]">Conteúdos sugeridos</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-[#01111e]/10 pt-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-[#132939]/50" />
            <span className="text-[13px] text-[#616e7c]">
              Período analisado: mensagens entre <strong>01/08/2026</strong> até{" "}
              <strong>31/08/2026</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#132939]/50" />
            <span className="text-[13px] text-[#616e7c]">
              Próxima análise: <strong>01/10/2026</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#01111e]/10 pt-4">
          <span className="text-base text-[#132939]/75">
            <span className="font-semibold text-[#ff5724]">{unreviewedCount}</span> Mensagens não
            analisadas
          </span>
          <button
            onClick={onReviewIndividually}
            className="flex cursor-pointer items-center gap-0.5 text-[13px] font-medium text-[#ff5724]"
          >
            Revisar individualmente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestionCarousel({
  suggestion,
  total,
  index,
  addedFlags,
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
  addedFlags: boolean[];
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
        <div
          className={cn(
            "flex flex-col gap-4 rounded-lg p-5 shadow-[3px_0_0_#ff5724_inset]",
            suggestion.added ? "bg-gradient-to-r from-[#f8e2ef] to-[#f8e9e4]" : "bg-white",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-[#132939]/90">{suggestion.title}</span>
            {suggestion.added && (
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium">
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
              <div className="inline-flex rounded-lg bg-gradient-to-r from-[#d75ba5] to-[#ff5724] p-px">
                <button
                  onClick={onOpenView}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[7px] bg-white"
                >
                  <svg width="0" height="0" className="absolute">
                    <linearGradient id="suggestionViewIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d75ba5" />
                      <stop offset="100%" stopColor="#ff5724" />
                    </linearGradient>
                  </svg>
                  <Eye
                    className="h-[18px] w-[18px]"
                    stroke="url(#suggestionViewIconGradient)"
                  />
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
            <div className="min-h-[88px] rounded-lg bg-gradient-to-r from-[#fff4fb] to-[#fff9f6] p-3.5">
              <span className="line-clamp-3 text-sm leading-5 text-[#132939]/90">
                {suggestion.text}
              </span>
            </div>
          </div>

          {!suggestion.added && (
            <div className="mx-auto w-fit max-w-full rounded-lg bg-gradient-to-r from-[#d75ba5] to-[#ff5724] p-px">
              <button
                onClick={onOpenInsert}
                className="flex w-full max-w-full flex-wrap items-center justify-center gap-1.5 rounded-[7px] bg-white px-3 py-2 text-center text-[13px] font-medium"
              >
                <Plus className="h-4 w-4 flex-shrink-0 text-[#ff5724]" />
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
            <SuggestionStepDot
              key={i}
              isCurrent={i === index}
              isAdded={addedFlags[i] ?? false}
              onClick={() => onDot(i)}
            />
          ))}
        </div>
        <ChevronRight onClick={onNext} className="h-5 w-5 cursor-pointer text-[#132939]/50" />
      </div>
    </div>
  );
}

function SuggestionStepDot({
  isCurrent,
  isAdded,
  onClick,
}: {
  isCurrent: boolean;
  isAdded: boolean;
  onClick: () => void;
}) {
  if (isAdded) {
    return (
      <button
        onClick={onClick}
        className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[#132939]/40"
      >
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "h-3 w-3 cursor-pointer rounded-full border transition-colors",
        isCurrent
          ? "border-transparent bg-gradient-to-r from-[#d75ba5] to-[#ff5724]"
          : "border-[#132939]/25 hover:border-[#132939]/40",
      )}
    />
  );
}

function MessagesReview({
  msgs,
  onBack,
  onToggle,
  onDelete,
  onAddContent,
}: {
  msgs: Msg[];
  onBack: () => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAddContent: (msg: Msg) => void;
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
          <MessageRow
            key={m.id}
            msg={m}
            onToggle={onToggle}
            onAddContent={onAddContent}
            onDelete={onDelete}
          />
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
  onAddContent,
  onDelete,
}: {
  msg: Msg;
  onToggle: (id: number) => void;
  onAddContent: (msg: Msg) => void;
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
          onClick={() => onAddContent(msg)}
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

        <ContentFormFields
          state={state}
          onTabChange={onTabChange}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          onFileChange={onFileChange}
          onUrlChange={onUrlChange}
          onExtract={onExtract}
          tabsListClassName="mx-6"
        />

        <div className="flex justify-end gap-3 px-6 pb-6 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={hasPlaceholder(state.content)}
            className="bg-[#ff5724] font-semibold text-white hover:bg-[#ff5724]/90"
          >
            Inserir conteúdo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContentFormFields({
  state,
  onTabChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onUrlChange,
  onExtract,
  tabsListClassName,
  showAiSuggestedBadge = true,
}: {
  state: ContentFormState;
  onTabChange: (tab: ModalTab) => void;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onFileChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onExtract: () => void;
  tabsListClassName?: string;
  showAiSuggestedBadge?: boolean;
}) {
  return (
    <>
      <Tabs value={state.tab} onValueChange={(v) => onTabChange(v as ModalTab)} className="mt-2">
        <TabsList className={cn("grid w-auto grid-cols-3 bg-transparent p-0", tabsListClassName)}>
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
              {showAiSuggestedBadge && (
                <span className="flex items-center gap-1 rounded-full bg-[#fde3d9] px-2 py-0.5 text-[11px] font-semibold text-[#ff5724]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Conteúdo sugerido pela IA
                </span>
              )}
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
            {hasPlaceholder(state.content) && (
              <div className="flex items-center gap-2 rounded-lg bg-[#fde3d9] px-3 py-2 text-xs text-[#9e3d22]">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Substitua os campos entre colchetes (ex: [PLACEHOLDER]) por informações reais
                antes de inserir este conteúdo.
              </div>
            )}
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
    </>
  );
}

function AddContentPage({
  state,
  onBack,
  onTabChange,
  onTitleChange,
  onContentChange,
  onFileChange,
  onUrlChange,
  onExtract,
  onConfirm,
}: {
  state: AddContentPageState;
  onBack: () => void;
  onTabChange: (tab: ModalTab) => void;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onFileChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onExtract: () => void;
  onConfirm: () => void;
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
          <span className="text-base font-medium text-[#132939]/90">Inserir conteúdo</span>
          <span className="text-[13px] text-[#616e7c]">
            Você poderá preencher apenas uma das opções: arquivo ou link. Ao trocar de aba, os
            dados inseridos anteriormente serão apagados.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(42,48,66,0.16)]">
        <div className="flex flex-col gap-1 rounded-lg bg-[#f5f7fa] p-3.5">
          <span className="text-[13px] font-medium text-[#132939]/75">Mensagem não entendida</span>
          <span className="text-sm text-[#132939]/90">&ldquo;{state.sourceText}&rdquo;</span>
        </div>

        <ContentFormFields
          state={state}
          onTabChange={onTabChange}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          onFileChange={onFileChange}
          onUrlChange={onUrlChange}
          onExtract={onExtract}
          showAiSuggestedBadge={false}
        />

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={hasPlaceholder(state.content)}
            className="bg-[#ff5724] font-semibold text-white hover:bg-[#ff5724]/90"
          >
            Inserir conteúdo
          </Button>
        </div>
      </div>
    </div>
  );
}

type DataHubTabKey = "fonte" | "questionario" | "ensinar";

function DataHubPage({
  pendingCount,
  isPublishing,
  onDiscard,
  onPublish,
  syncedContents,
  otherContents,
  onDeleteSynced,
  onDeleteOther,
  onViewContent,
}: {
  pendingCount: number;
  isPublishing: boolean;
  onDiscard: () => void;
  onPublish: () => void;
  syncedContents: DataHubContent[];
  otherContents: DataHubContent[];
  onDeleteSynced: (id: number) => void;
  onDeleteOther: (id: number) => void;
  onViewContent: (row: DataHubContent) => void;
}) {
  const [activeTab, setActiveTab] = useState<DataHubTabKey>("fonte");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const filteredSynced = syncedContents.filter((c) => c.name.toLowerCase().includes(query));
  const filteredOthers = otherContents.filter((c) => c.name.toLowerCase().includes(query));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-medium text-[#132939]/[0.875]">Data hub</span>
          <span className="text-[13px] text-[#616e7c]">
            Gerencie suas fontes de conteúdo da Sophia
          </span>
        </div>
        <div className="flex gap-2">
          <PublishActionsBar
            pendingCount={pendingCount}
            isPublishing={isPublishing}
            onDiscard={onDiscard}
            onPublish={onPublish}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-[0px_1px_2px_rgba(42,48,66,0.16)]">
        <div className="flex gap-6 border-b border-[#01111e]/10">
          <DataHubTab
            label="Fonte de dados"
            active={activeTab === "fonte"}
            onClick={() => setActiveTab("fonte")}
          />
          <DataHubTab
            label="Questionário"
            active={activeTab === "questionario"}
            onClick={() => setActiveTab("questionario")}
          />
          <DataHubTab
            label="Ensinar robô"
            active={activeTab === "ensinar"}
            onClick={() => setActiveTab("ensinar")}
          />
        </div>

        {activeTab !== "fonte" ? (
          <div className="px-3 py-16 text-center text-sm text-[#132939]/50">
            Conteúdo em construção.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#132939]/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Procurar conteúdo"
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toast("Lista de conteúdos atualizada.")}
                  className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[#132939]/75"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar lista
                </button>
                <Button
                  variant="outline"
                  className="gap-1.5 border-[#ff5724] text-[#ff5724] hover:bg-[#ff5724]/10 hover:text-[#ff5724]"
                  onClick={() => toast("Funcionalidade de adicionar conteúdo em breve.")}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar conteúdo
                </Button>
              </div>
            </div>

            <SyncedContentsTable
              rows={filteredSynced}
              onDelete={onDeleteSynced}
              onView={onViewContent}
            />
            <OtherContentsTable rows={filteredOthers} onDelete={onDeleteOther} onView={onViewContent} />
          </>
        )}
      </div>
    </div>
  );
}

function DataHubTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b-2 pb-3 text-[13px] font-semibold uppercase tracking-wide",
        active ? "border-[#ff5724] text-[#ff5724]" : "border-transparent text-[#132939]/50 hover:text-[#132939]/75",
      )}
    >
      {label}
    </button>
  );
}

function PromoBadge({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase",
        value ? "bg-[#dcf5e6] text-[#279661]" : "bg-[#01111e]/[0.06] text-[#132939]/60",
      )}
    >
      {value ? "Sim" : "Não"}
    </span>
  );
}

function DataHubContentIcon({ icon }: { icon: DataHubContent["icon"] }) {
  if (icon === "link") return <Link2 className="h-4 w-4 flex-shrink-0" />;
  if (icon === "shield") return <ShieldCheck className="h-4 w-4 flex-shrink-0" />;
  return <FileText className="h-4 w-4 flex-shrink-0" />;
}

function DataHubActionIcons({
  actions,
  onDelete,
  onView,
}: {
  actions: DataHubAction[];
  onDelete: () => void;
  onView?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {actions.includes("refresh") && (
        <RefreshCw
          onClick={() => toast("Sincronização iniciada.")}
          className="h-4 w-4 cursor-pointer text-[#132939]/60"
        />
      )}
      {actions.includes("download") && <Download className="h-4 w-4 cursor-pointer text-[#132939]/60" />}
      {actions.includes("eye") && (
        <Eye onClick={onView} className="h-4 w-4 cursor-pointer text-[#132939]/60" />
      )}
      {actions.includes("gear") && <Settings className="h-4 w-4 cursor-pointer text-[#132939]/60" />}
      {actions.includes("trash") && (
        <Trash2 onClick={onDelete} className="h-4 w-4 cursor-pointer text-[#132939]/60" />
      )}
    </div>
  );
}

function SyncedContentsTable({
  rows,
  onDelete,
  onView,
}: {
  rows: DataHubContent[];
  onDelete: (id: number) => void;
  onView: (row: DataHubContent) => void;
}) {
  return (
    <div className="overflow-hidden rounded border border-[#01111e]/10">
      <div className="flex items-center gap-4 border-b border-[#01111e]/10 bg-[#fde3d9] px-3 py-2">
        <span className="flex-1 text-[13px] font-semibold text-[#9e3d22]">
          Conteúdos sincronizados
        </span>
        <span className="w-[140px] text-[13px] font-semibold text-[#9e3d22]">
          Última atualização
        </span>
        <span className="w-[140px] text-[13px] font-semibold text-[#9e3d22]">
          Próxima atualização
        </span>
        <span className="w-[90px] text-[13px] font-semibold text-[#9e3d22]">Promocional</span>
        <span className="w-[80px] text-[13px] font-semibold text-[#9e3d22]">Expira em</span>
        <span className="w-[110px]" />
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center gap-4 border-b border-[#01111e]/10 px-3 py-3 last:border-0"
        >
          <span className="flex flex-1 items-center gap-2 text-sm font-medium text-[#ff5724]">
            <DataHubContentIcon icon={row.icon} />
            {row.name}
          </span>
          <span className="w-[140px] text-[13px] text-[#132939]/75">{row.updated}</span>
          <span className="w-[140px] text-[13px] text-[#132939]/75">{row.nextUpdate ?? "--"}</span>
          <span className="w-[90px]">
            <PromoBadge value={row.promotional} />
          </span>
          <span className="w-[80px] text-[13px] text-[#132939]/50">{row.expires}</span>
          <div className="w-[110px]">
            <DataHubActionIcons
              actions={row.actions}
              onDelete={() => onDelete(row.id)}
              onView={() => onView(row)}
            />
          </div>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-3 py-8 text-center text-sm text-[#132939]/50">
          Nenhum conteúdo sincronizado encontrado.
        </div>
      )}
    </div>
  );
}

function OtherContentsTable({
  rows,
  onDelete,
  onView,
}: {
  rows: DataHubContent[];
  onDelete: (id: number) => void;
  onView: (row: DataHubContent) => void;
}) {
  return (
    <div className="overflow-hidden rounded border border-[#01111e]/10">
      <div className="flex items-center gap-4 border-b border-[#01111e]/10 bg-[#f5f7fa] px-3 py-2">
        <span className="flex-1 text-[13px] font-semibold text-[#132939]/75">Outros conteúdos</span>
        <span className="w-[140px] text-[13px] font-semibold text-[#132939]/75">
          Última atualização
        </span>
        <span className="w-[90px] text-[13px] font-semibold text-[#132939]/75">Promocional</span>
        <span className="w-[80px] text-[13px] font-semibold text-[#132939]/75">Expira em</span>
        <span className="w-[130px]" />
      </div>
      {rows.map((row) => {
        const isDefault = row.icon === "shield";
        return (
          <div
            key={row.id}
            className={cn(
              "flex items-center gap-4 border-b border-[#01111e]/10 px-3 py-3 last:border-0",
              isDefault && "text-[#132939]/50",
            )}
          >
            <span
              className={cn(
                "flex flex-1 items-center gap-2 text-sm",
                isDefault ? "text-[#132939]/50" : "font-medium text-[#132939]/90",
              )}
            >
              <DataHubContentIcon icon={row.icon} />
              {row.name}
            </span>
            <span className="w-[140px] text-[13px] text-[#132939]/75">{row.updated}</span>
            <span className="w-[90px]">
              <PromoBadge value={row.promotional} />
            </span>
            <span className="w-[80px] text-[13px] text-[#132939]/50">{row.expires}</span>
            <div className="w-[130px]">
              <DataHubActionIcons
                actions={row.actions}
                onDelete={() => onDelete(row.id)}
                onView={() => onView(row)}
              />
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="px-3 py-8 text-center text-sm text-[#132939]/50">
          Nenhum conteúdo encontrado.
        </div>
      )}
    </div>
  );
}

function ViewContentModal({
  state,
  onClose,
  onEdit,
}: {
  state: ViewModalState;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [contentSearch, setContentSearch] = useState("");

  return (
    <Dialog open={state.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[780px] max-w-[92vw] flex-col gap-0 p-0">
        <DialogHeader className="gap-1.5 px-6 pt-5 text-left">
          <DialogTitle>{state.title}</DialogTitle>
          <div className="flex items-center gap-2.5 text-xs text-[#616e7c]">
            {state.url && (
              <>
                <a
                  href={state.url}
                  target="_blank"
                  rel="noreferrer"
                  title={state.url}
                  className="flex min-w-0 items-center gap-1.5 truncate text-[#ff5724] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{state.url}</span>
                </a>
                <span className="flex-shrink-0 text-[#01111e]/10">|</span>
              </>
            )}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#ff5724]" />
              <span>Atualizado em: {state.date}</span>
            </div>
            <span className="flex-shrink-0 text-[#01111e]/10">|</span>
            <span className="flex-shrink-0">Por: Ana Barcellos</span>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-6 py-5">
          {state.sourceMessage && (
            <div className="flex flex-col gap-1 rounded-lg bg-[#f5f7fa] p-3.5">
              <span className="text-[13px] font-medium text-[#132939]/90">
                Mensagem não entendida
              </span>
              <span className="text-sm text-[#132939]/90">&ldquo;{state.sourceMessage}&rdquo;</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#132939]/75">Conteúdo</span>
              {state.aiSuggested && (
                <span className="flex items-center gap-1 rounded-full bg-[#fde3d9] px-2 py-0.5 text-[11px] font-semibold text-[#ff5724]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Conteúdo sugerido pela IA
                </span>
              )}
            </div>
            <div className="relative w-56 flex-shrink-0">
              <Input
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder="Buscar no conteúdo"
                className="h-8 pr-8 text-[13px]"
              />
              <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#132939]/40" />
            </div>
          </div>

          <div className="h-[420px] overflow-y-auto rounded-lg border border-[#01111e]/10 bg-[#f5f7fa] p-4">
            <span className="whitespace-pre-line text-sm leading-6 text-[#132939]/90">
              {state.text}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#01111e]/10 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <div className="rounded-lg bg-gradient-to-r from-[#d75ba5] to-[#ff5724] p-px">
            <button
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-1.5 rounded-[7px] bg-white px-4 py-2 text-[13px] font-medium"
            >
              <Pencil className="h-4 w-4 text-[#ff5724]" />
              <span className="bg-gradient-to-r from-[#d75ba5] to-[#ff5724] bg-clip-text text-transparent">
                Editar
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
