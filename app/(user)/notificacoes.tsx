import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppIcon } from '@/components/AppIcon';
import { DARK, LIGHT } from '@/constants/app-theme';
import { useApp } from '@/context/AppContext';

const data = [
  ['Protocolo #2024-00123 atualizado', 'Sua solicitação de reparo de via pública foi encaminhada para análise técnica.', 'há 9 dias', 'Protocolos', 'clipboard-check-outline'],
  ['Sessão Extraordinária amanhã', 'A Câmara realizará sessão extraordinária às 18h para votação do orçamento.', 'há 9 dias', 'Avisos', 'bullhorn-outline'],
  ['Protocolo #2024-00089 resolvido', 'Sua reclamação sobre iluminação pública foi solucionada.', 'há 10 dias', 'Protocolos', 'clipboard-check-outline'],
  ['Audiência Pública - Saúde', 'Participe da discussão sobre melhorias na saúde pública no dia 22/04.', 'há 11 dias', 'Avisos', 'bullhorn-outline'],
  ['Protocolo #2024-00145 em andamento', 'Sua sugestão sobre área de lazer foi aprovada e está em fase de planejamento.', 'há 12 dias', 'Protocolos', 'clipboard-check-outline'],
] as const;

export default function Notificacoes() {
  const { dark } = useApp();
  const C = dark ? DARK : LIGHT;
  const [protocolosColor, avisosColor] = [C.blue, C.orange];
  return <Screen>
    <View style={styles.head}><Text style={[styles.title, { color: C.text }]}>Notificações</Text><TouchableOpacity><Text style={[styles.mark, { color: C.blue }]}>Marcar todas como lidas</Text></TouchableOpacity></View>
    <View style={styles.filters}><Filter label="Todas" active C={C} /><Filter label="Protocolos" C={C} /><Filter label="Avisos" C={C} /></View>
    {data.map((n, i) => { const color = n[3] === 'Protocolos' ? protocolosColor : avisosColor; return <View key={i} style={[styles.card, { backgroundColor: C.surface, borderLeftColor: color }]}><View style={[styles.icon, { backgroundColor: dark ? (n[3] === 'Protocolos' ? '#17385F' : '#4A3518') : '#EEF2F8' }]}><AppIcon name={n[4]} size={20} color={color} /></View><View style={{ flex: 1 }}><View style={styles.row}><Text style={[styles.cardTitle, { color: C.text }]}>{n[0]}</Text>{i < 2 && <View style={[styles.new, { backgroundColor: color }]}><Text style={styles.newText}>Nova</Text></View>}</View><Text style={[styles.desc, { color: C.muted }]}>{n[1]}</Text><View style={styles.bottom}><Text style={[styles.time, { color: C.muted }]}>{n[2]}</Text><Text style={[styles.category, { color }]}>{n[3]}</Text></View></View></View>; })}
  </Screen>;
}
function Filter({ label, active = false, C }: { label: string; active?: boolean; C: typeof DARK | typeof LIGHT }) { return <TouchableOpacity style={[styles.filter, { backgroundColor: C.surface }, active && { backgroundColor: '#4359BC' }]}><Text style={[styles.filterText, { color: C.text }]}>{label}</Text></TouchableOpacity>; }
const styles = StyleSheet.create({ head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, title: { fontSize: 24, fontWeight: '800' }, mark: { fontSize: 13, fontWeight: '700' }, filters: { flexDirection: 'row', marginBottom: 15, gap: 9 }, filter: { borderRadius: 22, paddingHorizontal: 18, paddingVertical: 11 }, filterText: { fontWeight: '700' }, card: { borderRadius: 18, padding: 15, marginBottom: 12, flexDirection: 'row', borderLeftWidth: 5 }, icon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, row: { flexDirection: 'row', alignItems: 'center' }, cardTitle: { fontSize: 15, fontWeight: '800', flex: 1 }, new: { borderRadius: 13, paddingHorizontal: 9, paddingVertical: 5, marginLeft: 8 }, newText: { color: '#fff', fontSize: 10, fontWeight: '800' }, desc: { fontSize: 13, lineHeight: 19, marginTop: 10 }, bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, time: { fontSize: 12 }, category: { fontSize: 12, fontWeight: '800' } });
