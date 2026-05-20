export type ClinicalFormKey =
  | "identificacao"
  | "anamnese"
  | "framingham"
  | "ecocardiograma"
  | "exameFisico"
  | "avaliacaoFuncional"
  | "autocuidado";

export type ClinicalFieldValue = string | string[];

export type ClinicalFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "radio"
  | "checkbox"
  | "select"
  | "readonly";

export type ClinicalOption = {
  value: string;
  label: string;
};

export type ClinicalField = {
  id: string;
  label: string;
  type: ClinicalFieldType;
  options?: ClinicalOption[];
  placeholder?: string;
  unit?: string;
  helper?: string;
  defaultValue?: ClinicalFieldValue;
  span?: "full" | "half";
};

export type ClinicalSection = {
  id: string;
  title: string;
  description?: string;
  fields: ClinicalField[];
};

export type ClinicalFormTemplate = {
  key: ClinicalFormKey;
  name: string;
  short: string;
  source: string;
  sections: ClinicalSection[];
};

export type ClinicalFormValues = Record<string, ClinicalFieldValue>;
export type ClinicalFormsState = Record<ClinicalFormKey, ClinicalFormValues>;

export type ClinicalFormMeta = {
  updated: string;
  status: "completo" | "parcial" | "pendente";
};

const yesNoOptions: ClinicalOption[] = [
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
];

const yesNoPreferOptions: ClinicalOption[] = [
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
  { value: "Prefiro não informar", label: "Prefiro não informar" },
];

const presentAbsentOptions: ClinicalOption[] = [
  { value: "Presente", label: "Presente" },
  { value: "Ausente", label: "Ausente" },
];

const selfCareOptions: ClinicalOption[] = [
  { value: "Nunca", label: "Nunca" },
  { value: "Raramente", label: "Raramente" },
  { value: "Às vezes", label: "Às vezes" },
  { value: "Frequentemente", label: "Frequentemente" },
  { value: "Sempre", label: "Sempre" },
];

const confidenceOptions: ClinicalOption[] = [
  { value: "Não estou confiante", label: "Não estou confiante" },
  { value: "Estou um pouco confiante", label: "Estou um pouco confiante" },
  { value: "Estou confiante", label: "Estou confiante" },
  { value: "Estou muito confiante", label: "Estou muito confiante" },
  { value: "Extremamente confiante", label: "Extremamente confiante" },
];

const symptomSpeedOptions: ClinicalOption[] = [
  { value: "NA - Não tive sintomas", label: "NA - Não tive sintomas" },
  { value: "Não reconheci", label: "Não reconheci" },
  { value: "Lentamente", label: "Lentamente" },
  { value: "Moderadamente rápido", label: "Moderadamente rápido" },
  { value: "Rapidamente", label: "Rapidamente" },
  { value: "Muito rapidamente", label: "Muito rapidamente" },
];

function radioField(id: string, label: string, options = yesNoOptions): ClinicalField {
  return { id, label, type: "radio", options };
}

function numberField(id: string, label: string, unit?: string): ClinicalField {
  return { id, label, type: "number", unit };
}

function textareaField(id: string, label: string): ClinicalField {
  return { id, label, type: "textarea", span: "full" };
}

export const clinicalFormTemplates: ClinicalFormTemplate[] = [
  {
    key: "identificacao",
    name: "Identificação Universal",
    short: "Record ID, dados pessoais, resumo clínico, etnia, escolaridade, religião e renda",
    source: "IdentificaO_UniversalCardIO20.pdf",
    sections: [
      {
        id: "registro",
        title: "Registro Universal CardIO 2.0",
        fields: [
          {
            id: "recordId",
            label: "Record ID / Registro Universal",
            type: "readonly",
            helper:
              "Gerado automaticamente no formato p-XXXXX a partir dos cinco primeiros dígitos do CPF.",
          },
          { id: "cpf", label: "CPF do participante", type: "text", placeholder: "Somente números" },
          { id: "dataAvaliacao", label: "Data da avaliação", type: "date" },
          { id: "dataNascimento", label: "Data de nascimento do participante", type: "date" },
          {
            id: "idadeCalculada",
            label: "Idade calculada automaticamente",
            type: "readonly",
          },
        ],
      },
      {
        id: "dadosPessoais",
        title: "Dados pessoais e sociodemográficos",
        fields: [
          { id: "nomeCompleto", label: "Nome completo", type: "text", span: "full" },
          {
            id: "sexo",
            label: "Sexo do participante",
            type: "radio",
            options: [
              { value: "Masculino", label: "M - Masculino" },
              { value: "Feminino", label: "F - Feminino" },
            ],
          },
          {
            id: "etnia",
            label: "Etnia (raça) do participante",
            type: "radio",
            options: [
              { value: "Preto", label: "Preto" },
              { value: "Branco", label: "Branco" },
              { value: "Pardo", label: "Pardo" },
              { value: "Amarelo", label: "Amarelo" },
              { value: "Indígena", label: "Indígena" },
            ],
          },
          {
            id: "escolaridade",
            label: "Grau de escolaridade",
            type: "select",
            options: [
              { value: "Analfabeto", label: "Analfabeto" },
              {
                value: "Nível fundamental incompleto",
                label: "Nível fundamental incompleto",
              },
              { value: "Nível fundamental completo", label: "Nível fundamental completo" },
              { value: "Nível médio incompleto", label: "Nível médio incompleto" },
              { value: "Nível médio completo", label: "Nível médio completo" },
              { value: "Nível superior incompleto", label: "Nível superior incompleto" },
              { value: "Nível superior completo", label: "Nível superior completo" },
              { value: "Pós-graduado", label: "Pós-graduado" },
            ],
          },
          { id: "religiao", label: "Religião do participante", type: "text" },
          {
            id: "rendaFamiliar",
            label: "Renda familiar total da casa",
            type: "number",
            unit: "R$",
            helper: "Valor total de todos que residem juntos na casa.",
          },
          { id: "telefone", label: "Telefone para contato", type: "text" },
          { id: "email", label: "E-mail", type: "text" },
          { id: "endereco", label: "Endereço", type: "textarea", span: "full" },
        ],
      },
      {
        id: "equipe",
        title: "Equipe responsável",
        fields: [
          { id: "responsavel", label: "Responsável pelo cadastro", type: "text" },
          { id: "instituicao", label: "Instituição", type: "text" },
        ],
      },
      {
        id: "resumoClinico",
        title: "Resumo clínico do paciente",
        fields: [
          {
            id: "resumoClinico",
            label: "Resumo clínico editável",
            type: "textarea",
            span: "full",
            placeholder:
              "Registre sinais, sintomas, contexto clínico e pontos que precisam ser acompanhados pela equipe.",
          },
        ],
      },
    ],
  },
  {
    key: "anamnese",
    name: "Anamnese",
    short: "HDA, sintomas, fatores de risco, HDP, gestacional e familiar",
    source: "Anamnese_UniversalCardIO20.pdf",
    sections: [
      {
        id: "hda",
        title: "História da doença atual",
        fields: [textareaField("hda", "Descreva a História da doença atual (HDA)")],
      },
      {
        id: "sintomas",
        title: "Sintomas",
        fields: [
          radioField("dorToracica", "Dor torácica", yesNoPreferOptions),
          radioField("dispneia", "Dispneia", yesNoPreferOptions),
          radioField("ortopneia", "Ortopneia", yesNoPreferOptions),
          radioField("dpn", "Dispneia paroxística noturna (D.P.N.)", yesNoPreferOptions),
          radioField("tontura", "Tontura", yesNoPreferOptions),
          radioField("sincope", "Síncope", yesNoPreferOptions),
          radioField("palpitacao", "Palpitação", yesNoPreferOptions),
          radioField("edema", "Edema", yesNoPreferOptions),
          radioField("claudicacao", "Claudicação (alteração na marcha)", yesNoPreferOptions),
        ],
      },
      {
        id: "fatoresRisco",
        title: "Fatores de risco",
        fields: [
          {
            id: "tabagismo",
            label: "Tabagismo (fuma?)",
            type: "radio",
            options: [
              { value: "Não", label: "Não" },
              { value: "Sim", label: "Sim" },
              { value: "Ex-fumante", label: "Ex-fumante" },
              { value: "Prefiro não responder", label: "Prefiro não responder" },
            ],
          },
          numberField("macosAno", "Se tabagista, quantos maços por ano?"),
          {
            id: "tempoParouFumar",
            label: "Se ex-tabagista, há quanto tempo parou?",
            type: "radio",
            options: [
              { value: "Menos de 10 anos", label: "Menos de 10 anos" },
              { value: "Mais de 10 anos", label: "Mais de 10 anos" },
            ],
          },
          {
            id: "alcool",
            label: "Com que frequência consome bebidas alcoólicas?",
            type: "radio",
            options: [
              { value: "Nunca consome", label: "Nunca consome" },
              { value: "1 vez por mês", label: "1 vez por mês" },
              { value: "2 a 4 vezes por mês", label: "2 a 4 vezes por mês" },
              { value: "2 a 3 vezes por semana", label: "2 a 3 vezes por semana" },
              { value: "4 vezes ou mais por semana", label: "4 vezes ou mais por semana" },
            ],
          },
        ],
      },
      {
        id: "hdp",
        title: "História de doença pregressa (HDP)",
        fields: [
          radioField("diabetes", "Diabetes", yesNoPreferOptions),
          radioField("hipertensao", "Hipertensão", yesNoPreferOptions),
          radioField("obesidade", "Obesidade", yesNoPreferOptions),
          radioField("dislipidemia", "Dislipidemia", yesNoPreferOptions),
          radioField("iam", "Doença coronariana (IAM)", yesNoPreferOptions),
          radioField("disturbioSono", "Distúrbio do sono", yesNoPreferOptions),
          radioField("cancer", "Câncer", yesNoPreferOptions),
          radioField("tvp", "Trombose venosa profunda (TVP)", yesNoPreferOptions),
          radioField("ave", "Acidente vascular encefálico", yesNoPreferOptions),
          radioField("cirurgiaPrevia", "Cirurgia prévia?", yesNoPreferOptions),
          textareaField("cirurgiaQuais", "Se respondeu sim para cirurgia prévia, diga quais"),
          radioField("hipotireoidismo", "Hipotireoidismo", yesNoPreferOptions),
          radioField("internacao12m", "Esteve internado nos últimos 12 meses?", yesNoPreferOptions),
          textareaField("outrasDoencas", "Outras doenças? Quais?"),
          textareaField("medicamentos", "Faz uso de medicamentos? Quais?"),
        ],
      },
      {
        id: "gestacionalFamiliar",
        title: "História gestacional e familiar",
        fields: [
          numberField("gestacoes", "Quantas vezes já engravidou?"),
          radioField("aborto", "Já teve algum aborto?", yesNoPreferOptions),
          radioField("eclampsia", "Já teve eclâmpsia?", yesNoPreferOptions),
          {
            id: "familiaresCardiometabolica",
            label: "Familiar com doença cardiometabólica",
            type: "checkbox",
            options: [
              { value: "Pai", label: "Pai" },
              { value: "Mãe", label: "Mãe" },
              { value: "Irmãos", label: "Irmãos" },
              { value: "Outros", label: "Outros" },
            ],
          },
          textareaField("historiaFamiliarDescricao", "Descrição da história familiar"),
        ],
      },
    ],
  },
  {
    key: "framingham",
    name: "Critérios de Framingham",
    short: "Critérios maiores, menores e observações diagnósticas",
    source: "CritriosDeFramingham_Universal.pdf",
    sections: [
      {
        id: "maiores",
        title: "Critérios maiores",
        fields: [
          radioField("estertores", "Estertores pulmonares"),
          radioField("dpnFramingham", "Dispneia paroxística noturna"),
          radioField("edemaAgudoPulmao", "Edema agudo de pulmão"),
          radioField("turgenciaJugular", "Turgência jugular patológica"),
          radioField("refluxoHepatojugular", "Refluxo hepatojugular"),
          radioField("pvcAlta", "Pressão venosa central > 16 cmH2O (PVC alta)"),
          radioField("cardiomegaliaRx", "Cardiomegalia na radiografia de tórax"),
          radioField("terceiraBulha", "Terceira bulha"),
          radioField(
            "perdaPesoTratamento",
            "Perda de peso > 4,5 kg em 5 dias em resposta ao tratamento",
          ),
        ],
      },
      {
        id: "menores",
        title: "Critérios menores",
        fields: [
          radioField("dispneiaEsforco", "Dispneia de esforço"),
          radioField("tosseNoturna", "Tosse noturna"),
          radioField("derramePleural", "Derrame pleural"),
          radioField("edemaMaleolar", "Edema maleolar"),
          radioField("hepatomegalia", "Hepatomegalia"),
          radioField("taquicardia120", "Taquicardia (frequência cardíaca > 120 bpm)"),
          radioField(
            "capacidadeFuncionalReduzida",
            "Capacidade funcional reduzida em 1/3 da registrada anteriormente",
          ),
          textareaField("obsFramingham", "OBS Framingham"),
        ],
      },
    ],
  },
  {
    key: "ecocardiograma",
    name: "Ecocardiograma",
    short: "Aorta/AE, VE 2D e 3D, VD, hemodinâmica pulmonar e função diastólica",
    source: "Ecocardiograma_UniversalCardIO.pdf",
    sections: [
      {
        id: "aortaAe",
        title: "Aorta e átrio esquerdo",
        fields: [
          numberField("aoSinusal", "Aorta sinusal", "mm"),
          numberField("ae", "Átrio esquerdo", "mm"),
          numberField("vaeBiplanar", "VAE biplanar", "mL"),
          numberField("vaeI", "VAE indexado", "mL/m²"),
          numberField("pals", "PALS", "%"),
        ],
      },
      {
        id: "ve2d",
        title: "Ventrículo esquerdo - 2D",
        fields: [
          numberField("ved", "VED", "mm"),
          numberField("ves", "VES", "mm"),
          numberField("siv", "SIV", "mm"),
          numberField("ppve", "PPVE", "mm"),
          numberField("feveTeich", "FEVE Teich", "%"),
          numberField("feveSimpson", "FEVE Simpson", "%"),
          numberField("vdf", "VDF", "mL"),
          numberField("vsf", "VSF", "mL"),
          numberField("glsVe", "GLS-VE", "%"),
        ],
      },
      {
        id: "ve3d",
        title: "Ventrículo esquerdo - 3D",
        fields: [
          numberField("feve3d", "FEVE 3D", "%"),
          numberField("vds3d", "VDS 3D", "mL"),
          numberField("vsf3d", "VSF 3D", "mL"),
          numberField("sv", "SV", "mL"),
          numberField("indiceDissincronia", "Índice de dissincronia", "%"),
        ],
      },
      {
        id: "vdHemodinamica",
        title: "VD e hemodinâmica pulmonar",
        fields: [
          numberField("vrtPico", "VRT pico", "m/s"),
          numberField("pmap", "PMAP", "mmHg"),
          numberField("psap", "PSAP", "mmHg"),
          numberField("taaPulmonar", "TAA pulmonar", "ms"),
          numberField("sLinha", "S'", "cm/s"),
          numberField("tapse", "TAPSE", "mm"),
          numberField("glsVd", "GLS VD", "%"),
        ],
      },
      {
        id: "funcaoDiastolica",
        title: "Função diastólica",
        fields: [
          numberField("ondaE", "Onda E", "cm/s"),
          numberField("ondaA", "Onda A", "cm/s"),
          numberField("tdE", "TD de E", "ms"),
          numberField("eMedial", "E' medial", "cm/s"),
          numberField("eLateral", "E' lateral", "cm/s"),
          numberField("mediaE", "Média de E'", "cm/s"),
          numberField("relacaoEMediaE", "Relação onda E/média de E'"),
          {
            id: "disfuncaoDiastolica",
            label: "Disfunção diastólica",
            type: "radio",
            options: [
              { value: "0 - Normal", label: "0 - Normal" },
              { value: "1 - Grau 1", label: "1 - Grau 1" },
              { value: "2 - Grau 2", label: "2 - Grau 2" },
              { value: "3 - Grau 3", label: "3 - Grau 3" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "exameFisico",
    name: "Exame Físico",
    short: "Sinais vitais, turgência, refluxo e avaliação por sistemas",
    source: "ExameFSico_UniversalCardIO20.pdf",
    sections: [
      {
        id: "sinaisVitais",
        title: "Sinais vitais",
        fields: [
          numberField("fc", "Frequência cardíaca (FC)", "bpm"),
          numberField("fr", "Frequência respiratória (FR)", "irpm"),
          numberField("pasD", "Pressão arterial sistólica direita (PAS_D)", "mmHg"),
          numberField("pasE", "Pressão arterial sistólica esquerda (PAS_E)", "mmHg"),
          numberField("padD", "Pressão arterial diastólica direita (PAD_D)", "mmHg"),
          numberField("padE", "Pressão arterial diastólica esquerda (PAD_E)", "mmHg"),
          numberField("spo2", "Saturação de oxigênio (SO2)", "%"),
        ],
      },
      {
        id: "achados",
        title: "Achados clínicos",
        fields: [
          radioField("turgenciaJugulares", "Turgência de jugulares", presentAbsentOptions),
          radioField("refluxoHepatojugularExame", "Refluxo hepatojugular", presentAbsentOptions),
          textareaField("aparelhoRespiratorio", "Aparelho respiratório"),
          textareaField("aparelhoCardiovascular", "Aparelho cardiovascular"),
          textareaField("abdomen", "Abdômen"),
          textareaField("membrosInferiores", "Membros inferiores"),
          textareaField("obsExame", "OBS"),
        ],
      },
    ],
  },
  {
    key: "avaliacaoFuncional",
    name: "Avaliação Funcional",
    short: "VFC, Ewing, força respiratória, TSL e teste do degrau de 6 minutos",
    source: "AvFuncional_UniversalCardIO20.pdf",
    sections: [
      {
        id: "respiratoriaVfc",
        title: "Avaliação funcional fisioterapêutica e VFC",
        fields: [
          numberField("frInicialVfc", "Frequência respiratória inicial (FR inicial VFC)", "irpm"),
          numberField("frFinalVfc", "Frequência respiratória final após 10 minutos", "irpm"),
          numberField("rrMedio", "RR médio", "ms"),
          numberField("sdnn", "SDNN", "ms"),
          numberField("rmssd", "RMSSD", "ms"),
          numberField("pnn50", "PNN50", "%"),
          numberField("vfcIndex", "VFC índex"),
          numberField("tpEnergiaTotal", "TP energia total"),
          numberField("vlf", "VLF muito baixa frequência"),
          numberField("lf", "LF baixa frequência"),
          numberField("hf", "HF alta frequência"),
          numberField("lfHf", "Relação LF/HF"),
        ],
      },
      {
        id: "ewing",
        title: "Teste autonômico de Ewing",
        fields: [
          numberField("ortostatismoDeltaPas", "Ortostatismo - delta de pressão sistólica", "mmHg"),
          numberField("razao3015", "Razão 30/15"),
          numberField("manobraValsalva", "Manobra de Valsalva (MV)"),
          numberField("handGripDeltaPad", "Hand grip - delta de PAD durante o teste", "mmHg"),
          numberField("respiracaoProfunda", "Respiração profunda em 6 ciclos em 1 minuto"),
          numberField("ewingTotal", "Ewing - soma dos resultados total dos testes"),
          {
            id: "can",
            label: "Classificação CAN",
            type: "radio",
            options: [
              { value: "1 - Sem disfunção autonômica", label: "1 - Sem disfunção autonômica" },
              { value: "2 - Disfunção autonômica leve", label: "2 - Disfunção autonômica leve" },
              {
                value: "3 - Disfunção autonômica severa",
                label: "3 - Disfunção autonômica severa",
              },
            ],
          },
          radioField("predominioSimpatico", "Componente simpático / predomínio simpático", [
            { value: "Não", label: "Não" },
            { value: "Sim", label: "Sim" },
          ]),
          radioField("predominioVagal", "Componente parassimpático / predomínio vagal", [
            { value: "Não", label: "Não" },
            { value: "Sim", label: "Sim" },
          ]),
          {
            id: "bendopneia",
            label: "Bendopneia (flexopneia)",
            type: "radio",
            options: [
              {
                value: "Sim - positiva",
                label: "Sim - positiva (não tolera 30 segundos)",
              },
              {
                value: "Não - negativa",
                label: "Não - negativa (tolera os 30 segundos)",
              },
            ],
          },
        ],
      },
      {
        id: "forcaFuncional",
        title: "Força muscular e teste senta e levanta",
        fields: [
          numberField("pimax", "PImax - pressão inspiratória máxima", "cmH2O"),
          numberField("pemax", "PEmax - pressão expiratória máxima", "cmH2O"),
          numberField("fpm", "Força de preensão manual (FPM)", "kgf"),
          numberField("peakFlow", "Pico de fluxo expiratório forçado (Peak Flow)", "L/min"),
          {
            id: "tslSentar",
            label: "Teste senta e levanta - sentar",
            type: "select",
            options: [
              { value: "Sem apoio", label: "Sem apoio" },
              { value: "1 apoio", label: "1 apoio" },
              { value: "2 apoios", label: "2 apoios" },
              { value: "3 apoios", label: "3 apoios" },
              { value: "4 apoios", label: "4 apoios" },
              { value: "Mais de 4 apoios", label: "Mais de 4 apoios" },
            ],
          },
          {
            id: "tslLevantar",
            label: "Teste senta e levanta - levantar",
            type: "select",
            options: [
              { value: "Sem apoio", label: "Sem apoio" },
              { value: "1 apoio", label: "1 apoio" },
              { value: "2 apoios", label: "2 apoios" },
              { value: "3 apoios", label: "3 apoios" },
              { value: "4 apoios", label: "4 apoios" },
              { value: "Mais de 4 apoios", label: "Mais de 4 apoios" },
            ],
          },
          numberField("fcSubmax", "Frequência cardíaca submáxima", "bpm"),
          numberField("fcMax", "Frequência cardíaca máxima", "bpm"),
        ],
      },
      {
        id: "td6",
        title: "Teste do Degrau de 6 minutos",
        fields: [
          numberField("td6FcRepouso", "FC repouso", "bpm"),
          numberField("td6PasRepouso", "PAS repouso", "mmHg"),
          numberField("td6PadRepouso", "PAD repouso", "mmHg"),
          numberField("td6Spo2Repouso", "SpO2 repouso", "%"),
          numberField("td6BorgRepouso", "Borg repouso"),
          numberField("td6Fc2", "FC 2º minuto", "bpm"),
          numberField("td6Pas2", "PAS 2º minuto", "mmHg"),
          numberField("td6Pad2", "PAD 2º minuto", "mmHg"),
          numberField("td6Spo22", "SpO2 2º minuto", "%"),
          numberField("td6Borg2", "Borg 2º minuto"),
          numberField("td6Fc4", "FC 4º minuto", "bpm"),
          numberField("td6Pas4", "PAS 4º minuto", "mmHg"),
          numberField("td6Pad4", "PAD 4º minuto", "mmHg"),
          numberField("td6Spo24", "SpO2 4º minuto", "%"),
          numberField("td6Borg4", "Borg 4º minuto"),
          numberField("td6FcFinal", "FC final do teste", "bpm"),
          numberField("td6PasFinal", "PAS final", "mmHg"),
          numberField("td6PadFinal", "PAD final", "mmHg"),
          numberField("td6Spo2Final", "SpO2 final", "%"),
          numberField("td6BorgFinal", "Borg final"),
          numberField("td6FcRec1", "FC 1º min recuperação", "bpm"),
          numberField("td6PasRec1", "PAS 1º min recuperação", "mmHg"),
          numberField("td6PadRec1", "PAD 1º min recuperação", "mmHg"),
          numberField("td6Spo2Rec1", "SpO2 1º min recuperação", "%"),
          numberField("td6BorgRec1", "Borg 1º min recuperação"),
          numberField("td6FcRec2", "FC 2º min recuperação", "bpm"),
          numberField("td6PasRec2", "PAS 2º min recuperação", "mmHg"),
          numberField("td6PadRec2", "PAD 2º min recuperação", "mmHg"),
          numberField("td6Spo2Rec2", "SpO2 2º min recuperação", "%"),
          numberField("td6BorgRec2", "Borg 2º min recuperação"),
          numberField("td6Degraus", "Número de degraus executados"),
          { id: "td6TempoFinal", label: "Tempo final do teste", type: "text" },
          numberField("td6DeltaFcRec1", "Delta de recuperação da FC no 1º minuto", "bpm"),
          numberField("td6DeltaFcRec2", "Delta de recuperação da FC no 2º minuto", "bpm"),
          numberField("td6Vo2Max", "VO2 máximo predito", "ml/kg/min"),
          numberField("td6Icx", "Índice cronotrópico - ICx"),
        ],
      },
    ],
  },
  {
    key: "autocuidado",
    name: "Autocuidado",
    short: "Manutenção, percepção de sintomas, manejo e confiança",
    source: "Autocuidado_UniversalCardIO20.pdf",
    sections: [
      {
        id: "manutencao",
        title: "Manutenção do autocuidado",
        fields: [
          radioField(
            "auto1",
            "1. Tenta evitar ficar doente (por exemplo: lava as mãos)?",
            selfCareOptions,
          ),
          radioField(
            "auto2",
            "2. Faz algum exercício (por exemplo: caminha rapidamente, usa as escadas)?",
            selfCareOptions,
          ),
          radioField("auto3", "3. Come uma dieta com pouco sal?", selfCareOptions),
          radioField(
            "auto4",
            "4. Consulta o médico ou enfermeiro para cuidados de saúde de rotina?",
            selfCareOptions,
          ),
          radioField(
            "auto5",
            "5. Toma os remédios prescritos pelo médico sem esquecer nenhuma dose?",
            selfCareOptions,
          ),
          radioField(
            "auto6",
            "6. Pede comida com pouco sal quando come fora de casa?",
            selfCareOptions,
          ),
          radioField("auto7", "7. Toma a vacina contra a gripe?", selfCareOptions),
          radioField(
            "auto8",
            "8. Pede alimentos com pouco sal ao visitar familiares e amigos?",
            selfCareOptions,
          ),
          radioField(
            "auto9",
            "9. Usa um sistema ou método para lembrar de tomar medicamentos?",
            selfCareOptions,
          ),
          radioField(
            "auto10",
            "10. Pergunta ao médico, enfermeiro ou farmacêutico sobre seus medicamentos?",
            selfCareOptions,
          ),
          radioField("auto11", "11. Controla seu peso diariamente?", selfCareOptions),
        ],
      },
      {
        id: "percepcao",
        title: "Percepção e monitoramento de sintomas",
        fields: [
          radioField(
            "auto12",
            "12. Costuma prestar atenção às mudanças de seu estado geral?",
            selfCareOptions,
          ),
          radioField(
            "auto13",
            "13. Fica atento aos efeitos colaterais dos medicamentos?",
            selfCareOptions,
          ),
          radioField(
            "auto14",
            "14. Observa se se cansa mais que o normal nas atividades do dia a dia?",
            selfCareOptions,
          ),
          radioField(
            "auto15",
            "15. Costuma perguntar ao médico ou enfermeiro sobre como você está?",
            selfCareOptions,
          ),
          radioField(
            "auto16",
            "16. Verifica com atenção seus sintomas da insuficiência cardíaca?",
            selfCareOptions,
          ),
          radioField("auto17", "17. Verifica se seus tornozelos estão inchados?", selfCareOptions),
          radioField(
            "auto18",
            "18. Observa falta de ar em atividades como tomar banho e se vestir?",
            selfCareOptions,
          ),
          radioField(
            "auto19",
            "19. Costuma anotar seus sintomas de insuficiência cardíaca?",
            selfCareOptions,
          ),
          radioField(
            "auto20",
            "20. Com que rapidez você percebeu que teve sintomas?",
            symptomSpeedOptions,
          ),
          radioField(
            "auto21",
            "21. Na última vez que teve sintomas, com que rapidez percebeu que eram devido à insuficiência cardíaca?",
            symptomSpeedOptions,
          ),
        ],
      },
      {
        id: "manejo",
        title: "Manejo dos sintomas",
        description:
          "Itens condicionais para quando houve sintomas; registre as medidas usadas e a avaliação da resposta.",
        fields: [
          radioField(
            "auto22",
            "22. Reduziu o sal da dieta para aliviar sintomas?",
            selfCareOptions,
          ),
          radioField(
            "auto23",
            "23. Reduziu a ingestão de líquidos para aliviar sintomas?",
            selfCareOptions,
          ),
          radioField(
            "auto24",
            "24. Usou diurético extra conforme orientação da equipe?",
            selfCareOptions,
          ),
          radioField(
            "auto25",
            "25. Entrou em contato com médico ou enfermeiro para orientação?",
            selfCareOptions,
          ),
          radioField("auto26", "26. Avaliou se reduzir o sal funcionou bem?", confidenceOptions),
          radioField("auto27", "27. Avaliou se reduzir líquidos funcionou bem?", confidenceOptions),
          radioField(
            "auto28",
            "28. Avaliou se o diurético extra funcionou bem?",
            confidenceOptions,
          ),
          radioField(
            "auto29",
            "29. Avaliou se buscar orientação da equipe funcionou bem?",
            confidenceOptions,
          ),
        ],
      },
      {
        id: "confianca",
        title: "Confiança no autocuidado",
        fields: [
          radioField(
            "auto30",
            "30. Em geral, quanto se sente confiante para manter-se estável e livre de sintomas?",
            confidenceOptions,
          ),
          radioField("auto31", "31. Seguir o plano de tratamento recebido?", confidenceOptions),
          radioField(
            "auto32",
            "32. Persistir em seguir o plano de tratamento mesmo quando é difícil?",
            confidenceOptions,
          ),
          radioField(
            "auto33",
            "33. Verificar sua condição de saúde rotineiramente?",
            confidenceOptions,
          ),
          radioField(
            "auto34",
            "34. Persistir na verificação diária da condição de saúde mesmo quando difícil?",
            confidenceOptions,
          ),
          radioField(
            "auto35",
            "35. Reconhecer mudanças na sua saúde se elas ocorrerem?",
            confidenceOptions,
          ),
          radioField("auto36", "36. Avaliar a importância dos seus sintomas?", confidenceOptions),
          radioField("auto37", "37. Fazer algo para aliviar seus sintomas?", confidenceOptions),
          radioField(
            "auto38",
            "38. Persistir em encontrar algo que melhore seus sintomas mesmo quando difícil?",
            confidenceOptions,
          ),
          radioField("auto39", "39. Avaliar o quanto uma medida funciona bem?", confidenceOptions),
        ],
      },
    ],
  },
];

export const clinicalFormMetaDefaults: Record<ClinicalFormKey, ClinicalFormMeta> = {
  identificacao: { updated: "20/05/2026", status: "parcial" },
  anamnese: { updated: "20/05/2026", status: "parcial" },
  framingham: { updated: "20/05/2026", status: "pendente" },
  ecocardiograma: { updated: "20/05/2026", status: "pendente" },
  exameFisico: { updated: "20/05/2026", status: "pendente" },
  avaliacaoFuncional: { updated: "20/05/2026", status: "pendente" },
  autocuidado: { updated: "20/05/2026", status: "pendente" },
};

export type ClinicalPrefillPatient = {
  id?: string;
  name?: string;
  age?: number;
  hr?: number;
  bp?: string;
  spo2?: number;
  fe?: number;
  vo2?: number;
  selfCare?: number;
  adherence?: number;
  weight?: number;
  responsible?: string;
};

export function createEmptyClinicalFormsState(): ClinicalFormsState {
  return Object.fromEntries(
    clinicalFormTemplates.map((template) => [
      template.key,
      Object.fromEntries(
        template.sections.flatMap((section) =>
          section.fields.map((field) => [
            field.id,
            field.defaultValue ?? (field.type === "checkbox" ? [] : ""),
          ]),
        ),
      ),
    ]),
  ) as ClinicalFormsState;
}

export function createPrefilledClinicalFormsState(patient: ClinicalPrefillPatient = {}) {
  const base = createEmptyClinicalFormsState();
  const [pas = "", pad = ""] = patient.bp?.split("/") ?? [];

  return {
    ...base,
    identificacao: {
      ...base.identificacao,
      recordId: patient.id ?? "P-1042",
      dataAvaliacao: "2026-05-20",
      nomeCompleto: patient.name ?? "Maria S. Oliveira",
      dataNascimento: patient.age ? String(2026 - patient.age) + "-05-20" : "",
      idadeCalculada: patient.age ? `${patient.age} anos` : "",
      sexo: "Feminino",
      etnia: "Pardo",
      escolaridade: "Nível fundamental completo",
      religiao: "Católica",
      rendaFamiliar: "2400",
      responsavel: patient.responsible ?? "Dr. Henrique Lima",
      instituicao: "Hospital Universitário - Cardiologia",
      resumoClinico:
        "Insuficiência cardíaca em acompanhamento remoto, com dispneia aos esforços e oscilação de peso recente.",
    },
    anamnese: {
      ...base.anamnese,
      hda: "Insuficiência cardíaca em acompanhamento remoto, com dispneia aos esforços e oscilação de peso recente.",
      dorToracica: "Não",
      dispneia: "Sim",
      ortopneia: "Sim",
      dpn: "Sim",
      tontura: "Não",
      sincope: "Não",
      palpitacao: "Sim",
      edema: "Sim",
      claudicacao: "Não",
      tabagismo: "Ex-fumante",
      tempoParouFumar: "Mais de 10 anos",
      alcool: "1 vez por mês",
      diabetes: "Sim",
      hipertensao: "Sim",
      obesidade: "Não",
      dislipidemia: "Sim",
      iam: "Sim",
      internacao12m: "Sim",
      medicamentos: "Furosemida 40 mg, Carvedilol 25 mg, Losartana 50 mg, Espironolactona 25 mg.",
      familiaresCardiometabolica: ["Pai", "Mãe"],
    },
    framingham: {
      ...base.framingham,
      estertores: "Sim",
      dpnFramingham: "Sim",
      edemaAgudoPulmao: "Não",
      turgenciaJugular: "Sim",
      refluxoHepatojugular: "Não",
      pvcAlta: "Não",
      cardiomegaliaRx: "Sim",
      terceiraBulha: "Sim",
      perdaPesoTratamento: "Não",
      dispneiaEsforco: "Sim",
      tosseNoturna: "Sim",
      derramePleural: "Não",
      edemaMaleolar: "Sim",
      hepatomegalia: "Não",
      taquicardia120: patient.hr && patient.hr > 120 ? "Sim" : "Não",
      capacidadeFuncionalReduzida: "Sim",
      obsFramingham: "Critérios compatíveis com insuficiência cardíaca clínica.",
    },
    ecocardiograma: {
      ...base.ecocardiograma,
      ae: "42",
      ved: "62",
      ves: "48",
      siv: "12",
      ppve: "11",
      feveSimpson: String(patient.fe ?? 32),
      glsVe: "-9.2",
      relacaoEMediaE: "16",
      disfuncaoDiastolica: "2 - Grau 2",
      tapse: "15",
      psap: "48",
    },
    exameFisico: {
      ...base.exameFisico,
      fc: String(patient.hr ?? 88),
      fr: "22",
      pasD: pas,
      pasE: pas,
      padD: pad,
      padE: pad,
      spo2: String(patient.spo2 ?? 93),
      turgenciaJugulares: "Presente",
      refluxoHepatojugularExame: "Presente",
      aparelhoRespiratorio: "Estertores em bases.",
      aparelhoCardiovascular: "B3 audível, sopro sistólico mitral 2+/6.",
      abdomen: "Sem dor à palpação, sem ascite evidente.",
      membrosInferiores: "Edema 2+/4 bilateral.",
    },
    avaliacaoFuncional: {
      ...base.avaliacaoFuncional,
      frInicialVfc: "20",
      frFinalVfc: "24",
      rrMedio: "684",
      sdnn: "22",
      rmssd: "14",
      lfHf: "3.1",
      can: "3 - Disfunção autonômica severa",
      bendopneia: "Sim - positiva",
      td6FcRepouso: String(patient.hr ?? 88),
      td6Spo2Repouso: String(patient.spo2 ?? 93),
      td6BorgRepouso: "3",
      td6FcFinal: "112",
      td6Spo2Final: "90",
      td6BorgFinal: "8",
      td6Degraus: "48",
      td6DeltaFcRec1: "8",
      td6Vo2Max: String(patient.vo2 ?? 12.4),
      td6Icx: "0.62",
    },
    autocuidado: {
      ...base.autocuidado,
      auto1: "Frequentemente",
      auto2: "Raramente",
      auto3: "Às vezes",
      auto4: "Frequentemente",
      auto5: "Frequentemente",
      auto7: "Sempre",
      auto11: "Raramente",
      auto14: "Às vezes",
      auto17: "Raramente",
      auto19: "Nunca",
      auto20: "Moderadamente rápido",
      auto21: "Moderadamente rápido",
      auto30: "Estou um pouco confiante",
      auto31: "Estou confiante",
      auto35: "Estou um pouco confiante",
      auto36: "Estou um pouco confiante",
    },
  } satisfies ClinicalFormsState;
}

export function createClinicalFormMetaDefaults(): Record<ClinicalFormKey, ClinicalFormMeta> {
  return Object.fromEntries(
    Object.entries(clinicalFormMetaDefaults).map(([key, value]) => [key, { ...value }]),
  ) as Record<ClinicalFormKey, ClinicalFormMeta>;
}

export function getClinicalTemplate(key: ClinicalFormKey) {
  return clinicalFormTemplates.find((template) => template.key === key);
}

export function formatClinicalValue(value: ClinicalFieldValue | undefined) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Não preenchido";
  return value?.trim() ? value : "Não preenchido";
}

export function countCompletedClinicalForms(state: ClinicalFormsState) {
  return clinicalFormTemplates.filter(
    (template) => countFilledFields(template, state[template.key]) > 0,
  ).length;
}

export function countFilledFields(template: ClinicalFormTemplate, values: ClinicalFormValues) {
  return template.sections
    .flatMap((section) => section.fields)
    .filter((field) => {
      const value = values[field.id];
      if (field.type === "readonly") return false;
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value?.trim());
    }).length;
}

export function countTotalEditableFields(template: ClinicalFormTemplate) {
  return template.sections
    .flatMap((section) => section.fields)
    .filter((field) => field.type !== "readonly").length;
}

export function cloneClinicalValues(values: ClinicalFormValues): ClinicalFormValues {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
  );
}
