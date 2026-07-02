import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { STUDIO_INFO, STUDENT_STATUS_LABELS, POSTURAL_CHECKLIST } from "@/lib/appConstants";
import { calculateAge, calculateIMC, imcCategory, formatDate } from "@/lib/appHelpers";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: "#581C87", paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flexDirection: "column", flex: 1 },
  studioName: { fontSize: 16, fontWeight: "bold", color: "#581C87" },
  studioInfo: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  photoBox: { width: 60, height: 60, backgroundColor: "#F3E8FF", borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photo: { width: 60, height: 60, objectFit: "cover" },
  title: { fontSize: 14, fontWeight: "bold", color: "#581C87", marginBottom: 4, marginTop: 10 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#9333EA", marginBottom: 5, borderBottomWidth: 1, borderBottomColor: "#F3E8FF", paddingBottom: 2 },
  row: { flexDirection: "row", marginBottom: 3, gap: 10, flexWrap: "wrap" },
  field: { flexDirection: "row", marginRight: 15, marginBottom: 2 },
  fieldLabel: { fontWeight: "bold", marginRight: 3 },
  block: { marginBottom: 4 },
  smallText: { fontSize: 9, color: "#4b5563" },
  divider: { borderTopWidth: 1, borderTopColor: "#e5e7eb", marginVertical: 6 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, fontSize: 8, color: "#6b7280", flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 },
  evolutionCard: { padding: 6, marginBottom: 5, backgroundColor: "#F3E8FF", borderRadius: 4 },
  badge: { padding: "2 6", borderRadius: 4, fontSize: 8, backgroundColor: "#F3E8FF", color: "#581C87", marginRight: 4, marginBottom: 3 },
});

interface Props {
  student: any;
  anamnese: any;
  assessments: any[];
  evolutions: any[];
  photoDataUrl?: string | null;
  logoDataUrl?: string | null;
  generatedBy: string;
  recordNumber: string;
}

const Field = ({ label, value }: { label: string; value: any }) =>
  value ? (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text>{String(value)}</Text>
    </View>
  ) : null;

const yesNo = (v: boolean | null | undefined) =>
  v === true ? "Sim" : v === false ? "Não" : "—";

export function StudentPDF({ student, anamnese, assessments, evolutions, photoDataUrl, logoDataUrl, generatedBy, recordNumber }: Props) {
  const age = calculateAge(student.birth_date);
  const latestAssessment = assessments[0];
  const imc = latestAssessment ? calculateIMC(latestAssessment.weight, latestAssessment.height) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {logoDataUrl && <Image src={logoDataUrl} style={{ width: 40, height: 40, marginBottom: 4 }} />}
            <Text style={styles.studioName}>{STUDIO_INFO.name}</Text>
            <Text style={styles.studioInfo}>{STUDIO_INFO.address}</Text>
            <Text style={styles.studioInfo}>{STUDIO_INFO.neighborhood}, {STUDIO_INFO.city}</Text>
            <Text style={styles.studioInfo}>WhatsApp: {STUDIO_INFO.phone}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.photoBox}>
              {photoDataUrl ? <Image src={photoDataUrl} style={styles.photo} /> : <Text style={{ fontSize: 8, color: "#9333EA" }}>Sem foto</Text>}
            </View>
            <Text style={{ fontSize: 8, marginTop: 4 }}>Prontuário Nº {recordNumber}</Text>
            <Text style={{ fontSize: 8 }}>Emissão: {new Date().toLocaleDateString("pt-BR")}</Text>
          </View>
        </View>

        <Text style={styles.title}>Prontuário do Aluno</Text>

        {/* DADOS PESSOAIS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          <View style={styles.row}>
            <Field label="Nome" value={student.full_name} />
            {age !== null && <Field label="Idade" value={`${age} anos`} />}
          </View>
          <View style={styles.row}>
            <Field label="CPF" value={student.cpf} />
            <Field label="RG" value={student.rg} />
            <Field label="Data Nasc." value={formatDate(student.birth_date)} />
          </View>
          <View style={styles.row}>
            <Field label="Sexo" value={student.gender} />
            <Field label="Estado civil" value={student.marital_status} />
            <Field label="Profissão" value={student.profession} />
          </View>
          <View style={styles.row}>
            <Field label="Endereço" value={[student.address, student.neighborhood, student.city, student.state, student.zip_code].filter(Boolean).join(", ")} />
          </View>
          <View style={styles.row}>
            <Field label="Celular" value={student.phone} />
            <Field label="WhatsApp" value={student.whatsapp} />
            <Field label="E-mail" value={student.email} />
          </View>
        </View>

        {/* MATRÍCULA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matrícula</Text>
          <View style={styles.row}>
            <Field label="Data matrícula" value={formatDate(student.enrollment_date)} />
            <Field label="Status" value={STUDENT_STATUS_LABELS[student.status]} />
            <Field label="Plano" value={student.plan} />
            <Field label="Aulas/semana" value={student.weekly_classes} />
          </View>
          {student.schedule && <Field label="Horários" value={student.schedule} />}
        </View>

        {/* CONTATO DE EMERGÊNCIA */}
        {(student.emergency_name || student.emergency_phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato de Emergência</Text>
            <View style={styles.row}>
              <Field label="Nome" value={student.emergency_name} />
              <Field label="Parentesco" value={student.emergency_relationship} />
              <Field label="Telefone" value={student.emergency_phone} />
            </View>
            {student.emergency_notes && <Field label="Observações" value={student.emergency_notes} />}
          </View>
        )}

        {/* OBJETIVOS */}
        {((student.objectives ?? []).length > 0 || student.objectives_other) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetivos</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {(student.objectives ?? []).map((o: string) => (
                <Text key={o} style={styles.badge}>{o}</Text>
              ))}
            </View>
            {student.objectives_other && <Text style={styles.smallText}>{student.objectives_other}</Text>}
          </View>
        )}

        {/* ANAMNESE */}
        {anamnese && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Anamnese</Text>
            <View style={styles.row}>
              <Field label="Dores atuais" value={yesNo(anamnese.has_pain)} />
              <Field label="Cirurgia" value={yesNo(anamnese.had_surgery)} />
              <Field label="Prótese" value={yesNo(anamnese.has_prosthesis)} />
              <Field label="Gestante" value={yesNo(anamnese.is_pregnant)} />
              <Field label="Amamentando" value={yesNo(anamnese.is_breastfeeding)} />
            </View>
            <View style={styles.row}>
              <Field label="Fuma" value={yesNo(anamnese.smokes)} />
              <Field label="Bebe" value={yesNo(anamnese.drinks_alcohol)} />
              <Field label="Ativ. física" value={yesNo(anamnese.practices_activity)} />
              <Field label="Medicamentos" value={yesNo(anamnese.uses_medication)} />
              <Field label="Rec. médica" value={yesNo(anamnese.has_medical_recommendation)} />
              <Field label="Limitações" value={yesNo(anamnese.has_limitations)} />
            </View>
            {(anamnese.diseases ?? []).length > 0 && (
              <View style={{ marginTop: 3 }}>
                <Text style={styles.fieldLabel}>Doenças:</Text>
                <Text style={styles.smallText}>{(anamnese.diseases ?? []).join(", ")}{anamnese.diseases_other ? `, ${anamnese.diseases_other}` : ""}</Text>
              </View>
            )}
            {anamnese.allergies && <View style={{ marginTop: 3 }}><Text style={styles.fieldLabel}>Alergias:</Text><Text style={styles.smallText}>{anamnese.allergies}</Text></View>}
            {anamnese.medications && <View style={{ marginTop: 3 }}><Text style={styles.fieldLabel}>Medicamentos:</Text><Text style={styles.smallText}>{anamnese.medications}</Text></View>}
            {anamnese.observations && <View style={{ marginTop: 3 }}><Text style={styles.fieldLabel}>Observações:</Text><Text style={styles.smallText}>{anamnese.observations}</Text></View>}
            {anamnese.doctor_name && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.fieldLabel}>Médico responsável:</Text>
                <Text style={styles.smallText}>{anamnese.doctor_name} {anamnese.doctor_specialty ? `— ${anamnese.doctor_specialty}` : ""} {anamnese.doctor_phone ? `— ${anamnese.doctor_phone}` : ""} {anamnese.doctor_crm ? `— CRM ${anamnese.doctor_crm}` : ""}</Text>
              </View>
            )}
          </View>
        )}

        {/* AVALIAÇÃO FÍSICA */}
        {latestAssessment && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Avaliação Física — {formatDate(latestAssessment.assessed_at)}</Text>
            <View style={styles.row}>
              <Field label="Peso" value={latestAssessment.weight ? `${latestAssessment.weight} kg` : null} />
              <Field label="Altura" value={latestAssessment.height ? `${latestAssessment.height} m` : null} />
              {imc && <Field label="IMC" value={`${imc} (${imcCategory(imc)})`} />}
              <Field label="% Gordura" value={latestAssessment.body_fat_pct ? `${latestAssessment.body_fat_pct}%` : null} />
              <Field label="PA" value={latestAssessment.blood_pressure} />
              <Field label="FC" value={latestAssessment.heart_rate ? `${latestAssessment.heart_rate} bpm` : null} />
            </View>
            <View style={styles.row}>
              <Field label="Braço" value={latestAssessment.circ_arm ? `${latestAssessment.circ_arm} cm` : null} />
              <Field label="Abdômen" value={latestAssessment.circ_abdomen ? `${latestAssessment.circ_abdomen} cm` : null} />
              <Field label="Cintura" value={latestAssessment.circ_waist ? `${latestAssessment.circ_waist} cm` : null} />
              <Field label="Quadril" value={latestAssessment.circ_hip ? `${latestAssessment.circ_hip} cm` : null} />
              <Field label="Coxa" value={latestAssessment.circ_thigh ? `${latestAssessment.circ_thigh} cm` : null} />
              <Field label="Panturrilha" value={latestAssessment.circ_calf ? `${latestAssessment.circ_calf} cm` : null} />
            </View>
            <View style={{ marginTop: 4 }}>
              <Text style={styles.fieldLabel}>Escalas (1-5):</Text>
              <Text style={styles.smallText}>
                Mobilidade: Ombros {latestAssessment.mobility_shoulders ?? "—"} | Quadril {latestAssessment.mobility_hip ?? "—"} | Coluna {latestAssessment.mobility_spine ?? "—"} | Joelhos {latestAssessment.mobility_knees ?? "—"} | Tornozelos {latestAssessment.mobility_ankles ?? "—"}
              </Text>
              <Text style={styles.smallText}>
                Flexibilidade {latestAssessment.flexibility ?? "—"} | Equilíbrio {latestAssessment.balance ?? "—"} | Força {latestAssessment.strength ?? "—"} | Resistência {latestAssessment.endurance ?? "—"}
              </Text>
            </View>
            {latestAssessment.pain_notes && (
              <View style={{ marginTop: 3 }}><Text style={styles.fieldLabel}>Dor:</Text><Text style={styles.smallText}>{latestAssessment.pain_notes}</Text></View>
            )}
            {latestAssessment.postural_checklist && Object.keys(latestAssessment.postural_checklist).length > 0 && (
              <View style={{ marginTop: 3 }}>
                <Text style={styles.fieldLabel}>Avaliação postural:</Text>
                <Text style={styles.smallText}>
                  {POSTURAL_CHECKLIST.filter((c) => latestAssessment.postural_checklist[c.key]).map((c) => c.label).join(", ") || "—"}
                </Text>
              </View>
            )}
            {latestAssessment.postural_notes && (
              <View style={{ marginTop: 3 }}><Text style={styles.fieldLabel}>Obs. posturais:</Text><Text style={styles.smallText}>{latestAssessment.postural_notes}</Text></View>
            )}
          </View>
        )}

        {/* EVOLUÇÕES */}
        {evolutions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico de Evoluções</Text>
            {evolutions.slice(0, 10).map((e) => (
              <View key={e.id} style={styles.evolutionCard} wrap={false}>
                <Text style={{ fontWeight: "bold", fontSize: 9 }}>{formatDate(e.evolution_date)} — {e.profiles?.full_name ?? "—"}</Text>
                {e.description && <Text style={styles.smallText}>{e.description}</Text>}
                {e.objectives && <Text style={styles.smallText}><Text style={styles.fieldLabel}>Objetivos: </Text>{e.objectives}</Text>}
                {e.observations && <Text style={styles.smallText}><Text style={styles.fieldLabel}>Obs: </Text>{e.observations}</Text>}
                {e.recommended_exercises && <Text style={styles.smallText}><Text style={styles.fieldLabel}>Exercícios: </Text>{e.recommended_exercises}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* ASSINATURAS */}
        <View style={{ marginTop: 15, flexDirection: "row", justifyContent: "space-between", gap: 20 }} wrap={false}>
          <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 3 }}>
            <Text style={{ fontSize: 9, textAlign: "center" }}>Assinatura do Aluno</Text>
          </View>
          <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 3 }}>
            <Text style={{ fontSize: 9, textAlign: "center" }}>Assinatura do Profissional</Text>
            <Text style={{ fontSize: 8, textAlign: "center", color: "#6b7280" }}>{generatedBy}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          <Text>Gerado em {new Date().toLocaleString("pt-BR")}</Text>
          <Text>{generatedBy}</Text>
        </View>
      </Page>
    </Document>
  );
}
